#include "snapcast_protocol.hpp"

#include <limits>
#include <utility>

namespace snapcast {
namespace {

std::uint16_t read_u16(const std::uint8_t* p) {
  return static_cast<std::uint16_t>(p[0]) |
         (static_cast<std::uint16_t>(p[1]) << 8);
}

std::uint32_t read_u32(const std::uint8_t* p) {
  return static_cast<std::uint32_t>(p[0]) |
         (static_cast<std::uint32_t>(p[1]) << 8) |
         (static_cast<std::uint32_t>(p[2]) << 16) |
         (static_cast<std::uint32_t>(p[3]) << 24);
}

std::int32_t read_i32(const std::uint8_t* p) {
  const auto raw = read_u32(p);
  const auto signed_value = (raw & 0x80000000u) != 0
                                ? static_cast<std::int64_t>(raw) - 0x100000000ll
                                : static_cast<std::int64_t>(raw);
  return static_cast<std::int32_t>(signed_value);
}

void append_u16(std::vector<std::uint8_t>& out, std::uint16_t value) {
  out.push_back(static_cast<std::uint8_t>(value));
  out.push_back(static_cast<std::uint8_t>(value >> 8));
}

void append_u32(std::vector<std::uint8_t>& out, std::uint32_t value) {
  for (unsigned shift = 0; shift < 32; shift += 8)
    out.push_back(static_cast<std::uint8_t>(value >> shift));
}

bool known_type(std::uint16_t raw) {
  switch (static_cast<MessageType>(raw)) {
    case MessageType::CodecHeader:
    case MessageType::WireChunk:
    case MessageType::ServerSettings:
    case MessageType::Time:
    case MessageType::Hello:
    case MessageType::ClientInfo:
    case MessageType::Error:
      return true;
  }
  return false;
}

bool exact_sized_body(const std::vector<std::uint8_t>& body,
                      std::size_t prefix_bytes, std::uint32_t declared,
                      std::string& error) {
  if (declared > kMaxTypedPayloadBytes) {
    error = "typed payload exceeds configured limit";
    return false;
  }
  if (body.size() != prefix_bytes + declared) {
    error = "typed payload length does not match body";
    return false;
  }
  return true;
}

}  // namespace

bool FrameParser::feed(const std::uint8_t* data, std::size_t size,
                       std::vector<Frame>& frames, std::string& error) {
  if (size != 0 && data == nullptr) {
    error = "null input with non-zero size";
    reset();
    return false;
  }

  for (std::size_t i = 0; i < size; ++i) {
    pending_.push_back(data[i]);
    if (pending_.size() < kBaseHeaderBytes) continue;

    const auto raw_type = read_u16(pending_.data());
    if (!known_type(raw_type)) {
      error = "unknown Snapcast message type";
      reset();
      return false;
    }
    const auto body_size = read_u32(pending_.data() + 22);
    if (body_size > kMaxTypedPayloadBytes) {
      error = "frame body exceeds configured limit";
      reset();
      return false;
    }
    const auto total_size = kBaseHeaderBytes + body_size;
    if (pending_.size() > total_size) {
      error = "frame parser lost message boundary";
      reset();
      return false;
    }
    if (pending_.size() != total_size) continue;

    Frame frame;
    frame.type = static_cast<MessageType>(raw_type);
    frame.id = read_u16(pending_.data() + 2);
    frame.refers_to = read_u16(pending_.data() + 4);
    frame.sent_sec = read_i32(pending_.data() + 6);
    frame.sent_usec = read_i32(pending_.data() + 10);
    frame.received_sec = read_i32(pending_.data() + 14);
    frame.received_usec = read_i32(pending_.data() + 18);
    frame.body.assign(pending_.begin() + kBaseHeaderBytes, pending_.end());
    frames.push_back(std::move(frame));
    pending_.clear();
  }
  error.clear();
  return true;
}

void FrameParser::reset() { pending_.clear(); }

bool parse_sized_payload(const std::vector<std::uint8_t>& body,
                         std::vector<std::uint8_t>& payload,
                         std::string& error) {
  if (body.size() < 4) {
    error = "sized payload is missing its length prefix";
    return false;
  }
  const auto declared = read_u32(body.data());
  if (!exact_sized_body(body, 4, declared, error)) return false;
  payload.assign(body.begin() + 4, body.end());
  return true;
}

bool parse_codec_header(const std::vector<std::uint8_t>& body,
                        CodecHeader& header, std::string& error) {
  if (body.size() < 8) {
    error = "codec header is truncated";
    return false;
  }
  const auto codec_size = read_u32(body.data());
  if (codec_size > kMaxTypedPayloadBytes || codec_size > body.size() - 8) {
    error = "codec name length is invalid";
    return false;
  }
  const auto payload_length_offset = 4 + codec_size;
  if (payload_length_offset + 4 > body.size()) {
    error = "codec payload length is truncated";
    return false;
  }
  const auto payload_size = read_u32(body.data() + payload_length_offset);
  const auto prefix_size = static_cast<std::size_t>(payload_length_offset) + 4;
  if (!exact_sized_body(body, prefix_size, payload_size, error)) return false;
  header.codec.assign(reinterpret_cast<const char*>(body.data() + 4), codec_size);
  header.payload.assign(body.begin() + prefix_size, body.end());
  return true;
}

bool parse_wire_chunk(const std::vector<std::uint8_t>& body,
                      WireChunk& chunk, std::string& error) {
  if (body.size() < 12) {
    error = "wire chunk is truncated";
    return false;
  }
  const auto payload_size = read_u32(body.data() + 8);
  if (!exact_sized_body(body, 12, payload_size, error)) return false;
  chunk.timestamp_sec = read_i32(body.data());
  chunk.timestamp_usec = read_i32(body.data() + 4);
  chunk.payload.assign(body.begin() + 12, body.end());
  return true;
}

bool encode_json_message(MessageType type, std::uint16_t id,
                         const std::string& json,
                         std::vector<std::uint8_t>& frame,
                         std::string& error) {
  if (type != MessageType::Hello && type != MessageType::ClientInfo) {
    error = "JSON wrapper only supports Hello and ClientInfo";
    return false;
  }
  if (json.size() > kMaxTypedPayloadBytes - 4 ||
      json.size() > std::numeric_limits<std::uint32_t>::max()) {
    error = "JSON payload exceeds configured limit";
    return false;
  }

  frame.clear();
  frame.reserve(kBaseHeaderBytes + 4 + json.size());
  append_u16(frame, static_cast<std::uint16_t>(type));
  append_u16(frame, id);
  append_u16(frame, 0);  // refersTo
  append_u32(frame, 0);  // sent.sec
  append_u32(frame, 0);  // sent.usec
  append_u32(frame, 0);  // received.sec
  append_u32(frame, 0);  // received.usec
  append_u32(frame, static_cast<std::uint32_t>(4 + json.size()));
  append_u32(frame, static_cast<std::uint32_t>(json.size()));
  frame.insert(frame.end(), json.begin(), json.end());
  error.clear();
  return true;
}

}  // namespace snapcast
