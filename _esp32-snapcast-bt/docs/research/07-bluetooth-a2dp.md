# 07 Bluetooth and A2DP

Target radio/controller/antenna/wiring UNKNOWN. RP2040 alone has no Bluetooth; BLE-only hardware cannot provide Classic A2DP. Do not claim target A2DP Source capability.

Pico W's CYW43439 is documented for Bluetooth 5.2 including Classic and BLE. Pico SDK integrates BTstack using CYW43 HCI; Arduino-Pico documents A2DPSource with SBC. Applies to compatible Pico W, not this clone. SBC encode costs CPU. Wi-Fi+BT share CYW43439/SPI; stack support does not prove Snapcast coexistence.

Options: verified CYW43439; external module explicitly A2DP Source; ESP32 coprocessor exact SKU with BR/EDR; I2S transmitter documented as Source; UART module with documented PCM framing and Source role. BLE-only and A2DP Sink modules are excluded. After hardware proof and separate firmware authorization: tone to exact HK model, then Wi-Fi, then concurrency.

Refs: [Pico W](https://www.raspberrypi.com/documentation/microcontrollers/pico-series.html), [Arduino-Pico A2DP](https://arduino-pico.readthedocs.io/en/latest/a2dp.html), [CYW43 HCI](https://github.com/raspberrypi/pico-sdk/blob/master/src/rp2_common/pico_cyw43_driver/btstack_hci_transport_cyw43.c), [BTstack](https://github.com/bluekitchen/btstack).
