#include "snapcast_protocol.hpp"

#include <cassert>
#include <cstdint>
#include <iostream>
#include <string>
#include <vector>

namespace {

void append_u16(std::vector<std::uint8_t>& out, std::uint16_t value) {
  out.push_back(static_cast<std::uint8_t>(value));
  out.push_back(static_cast<std::uint8_t>(value >> 8));
}

void append_u32(std::vector<std::uint8_t>& out, std::uint32_t value) {
  for (unsigned shift = 0; shift < 32; shift += 8)
    out.push_back(static_cast<std::uint8_t>(value >> shift));
}

std::vector<std::uint8_t> frame(snapcast::MessageType type,
                                const std::vector<std::uint8_t>& body) {
  std::vector<std::uint8_t> out;
  append_u16(out, static_cast<std::uint16_t>(type));
  append_u16(out, 17);
  append_u16(out, 9);
  append_u32(out, 11);
  append_u32(out, 12);
  append_u32(out, 13);
  append_u32(out, 14);
  append_u32(out, static_cast<std::uint32_t>(body.size()));
  out.insert(out.end(), body.begin(), body.end());
  return out;
}

void test_partial_and_concatenated_frames() {
  auto a = frame(snapcast::MessageType::ServerSettings, {2, 0, 0, 0, '{', '}'});
  auto b = frame(snapcast::MessageType::WireChunk, {0, 0, 0, 0, 0, 0,
                                                    0, 0, 1, 0, 0, 0, 0xaa});
  a.insert(a.end(), b.begin(), b.end());
  snapcast::FrameParser parser;
  std::vector<snapcast::Frame> messages;
  std::string error;
  for (const auto byte : a)
    assert(parser.feed(&byte, 1, messages, error));
  assert(messages.size() == 2);
  assert(messages[0].type == snapcast::MessageType::ServerSettings);
  assert(messages[0].id == 17 && messages[0].refers_to == 9);
  assert(messages[0].sent_sec == 11 && messages[0].received_usec == 14);
  assert(messages[1].type == snapcast::MessageType::WireChunk);
  assert(messages[1].body.size() == 13);
}

void test_codec_header_and_flac_chunk() {
  std::vector<std::uint8_t> body;
  append_u32(body, 4);
  body.insert(body.end(), {'f', 'l', 'a', 'c'});
  append_u32(body, 3);
  body.insert(body.end(), {0x66, 0x4c, 0x61});
  snapcast::CodecHeader header;
  std::string error;
  assert(snapcast::parse_codec_header(body, header, error));
  assert(header.codec == "flac");
  assert((header.payload == std::vector<std::uint8_t>{0x66, 0x4c, 0x61}));

  std::vector<std::uint8_t> chunk_body;
  append_u32(chunk_body, 1234);
  append_u32(chunk_body, 500000);
  append_u32(chunk_body, 2);
  chunk_body.insert(chunk_body.end(), {0xf8, 0x42});
  snapcast::WireChunk chunk;
  assert(snapcast::parse_wire_chunk(chunk_body, chunk, error));
  assert(chunk.timestamp_sec == 1234 && chunk.timestamp_usec == 500000);
  assert((chunk.payload == std::vector<std::uint8_t>{0xf8, 0x42}));
}

void test_sized_payload_validation() {
  std::vector<std::uint8_t> body{3, 0, 0, 0, 'a', 'b', 'c'};
  std::vector<std::uint8_t> payload;
  std::string error;
  assert(snapcast::parse_sized_payload(body, payload, error));
  assert((payload == std::vector<std::uint8_t>{'a', 'b', 'c'}));
  body[0] = 4;
  assert(!snapcast::parse_sized_payload(body, payload, error));
}

void test_malformed_frame_rejected_and_reset() {
  auto invalid = frame(static_cast<snapcast::MessageType>(99), {});
  snapcast::FrameParser parser;
  std::vector<snapcast::Frame> messages;
  std::string error;
  assert(!parser.feed(invalid.data(), invalid.size(), messages, error));
  assert(!error.empty());

  std::vector<std::uint8_t> oversized;
  append_u16(oversized, static_cast<std::uint16_t>(snapcast::MessageType::WireChunk));
  append_u16(oversized, 0);
  append_u16(oversized, 0);
  append_u32(oversized, 0);
  append_u32(oversized, 0);
  append_u32(oversized, 0);
  append_u32(oversized, 0);
  append_u32(oversized, snapcast::kMaxTypedPayloadBytes + 1);
  assert(!parser.feed(oversized.data(), oversized.size(), messages, error));

  const auto valid = frame(snapcast::MessageType::Time, {});
  assert(parser.feed(valid.data(), valid.size(), messages, error));
  assert(messages.size() == 1);
}

void test_hello_json_frame_encoding() {
  std::vector<std::uint8_t> encoded;
  std::string error;
  assert(snapcast::encode_json_message(snapcast::MessageType::Hello, 4,
                                      "{\"ClientName\":\"host-test\"}",
                                      encoded, error));
  snapcast::FrameParser parser;
  std::vector<snapcast::Frame> frames;
  assert(parser.feed(encoded.data(), encoded.size(), frames, error));
  assert(frames.size() == 1);
  assert(frames[0].type == snapcast::MessageType::Hello);
  assert(frames[0].id == 4);
  std::vector<std::uint8_t> json;
  assert(snapcast::parse_sized_payload(frames[0].body, json, error));
  assert(std::string(json.begin(), json.end()) == "{\"ClientName\":\"host-test\"}");
  assert(!snapcast::encode_json_message(snapcast::MessageType::Time, 1, "{}",
                                       encoded, error));
}

}  // namespace

int main() {
  test_partial_and_concatenated_frames();
  test_codec_header_and_flac_chunk();
  test_sized_payload_validation();
  test_malformed_frame_rejected_and_reset();
  test_hello_json_frame_encoding();
  std::cout << "Snapcast protocol host tests passed\n";
}
