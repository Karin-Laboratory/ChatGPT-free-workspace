#pragma once

#include <cstddef>
#include <cstdint>
#include <string>
#include <vector>

namespace snapcast {

// Snapcast's binary base header is little-endian and 26 bytes long.
constexpr std::size_t kBaseHeaderBytes = 26;
constexpr std::uint32_t kMaxTypedPayloadBytes = 64 * 1024;

enum class MessageType : std::uint16_t {
  CodecHeader = 1,
  WireChunk = 2,
  ServerSettings = 3,
  Time = 4,
  Hello = 5,
  ClientInfo = 7,
  Error = 8,
};

struct Frame {
  MessageType type{};
  std::uint16_t id{};
  std::uint16_t refers_to{};
  std::int32_t sent_sec{};
  std::int32_t sent_usec{};
  std::int32_t received_sec{};
  std::int32_t received_usec{};
  std::vector<std::uint8_t> body;
};

// Incremental, bounded TCP frame parser. It handles partial and concatenated
// frames but deliberately does not implement socket I/O or audio decoding.
class FrameParser {
 public:
  bool feed(const std::uint8_t* data, std::size_t size,
            std::vector<Frame>& frames, std::string& error);
  void reset();

 private:
  std::vector<std::uint8_t> pending_;
};

struct CodecHeader {
  std::string codec;
  std::vector<std::uint8_t> payload;
};

struct WireChunk {
  std::int32_t timestamp_sec{};
  std::int32_t timestamp_usec{};
  std::vector<std::uint8_t> payload;
};

bool parse_sized_payload(const std::vector<std::uint8_t>& body,
                         std::vector<std::uint8_t>& payload,
                         std::string& error);
bool parse_codec_header(const std::vector<std::uint8_t>& body,
                        CodecHeader& header, std::string& error);
bool parse_wire_chunk(const std::vector<std::uint8_t>& body,
                      WireChunk& chunk, std::string& error);

// Wraps a JSON typed payload (Hello or ClientInfo) in a binary base frame.
// The caller is responsible for valid JSON and protocol-appropriate fields.
bool encode_json_message(MessageType type, std::uint16_t id,
                         const std::string& json,
                         std::vector<std::uint8_t>& frame,
                         std::string& error);

}  // namespace snapcast
