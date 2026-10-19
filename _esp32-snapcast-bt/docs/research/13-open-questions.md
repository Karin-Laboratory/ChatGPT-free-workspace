# 13 Open questions and safe experiments

Hardware blockers: board revision and IC/flash/radio/crystal markings; CYW43439/antenna/RF routing; SPI/control/IRQ/power wiring; historic serial match; flash size/image; SWD pads; reliable supply monitoring (vcgencmd unavailable).

Software blockers: Snapserver version/codec; exact HK model/profile/latency; concurrent Wi-Fi+Classic stability; SRAM/stack headroom; drift correction; library/license revisions.

Safe sequence: (1) unpowered photos/markings; (2) compare schematic, no unknown GPIO; (3) resolve supply/cable stability; (4) only if necessary, audit narrowly scoped read-only query and address bounds, no full dump/RAM code; (5) after hardware proof and separate write authorization, A2DP tone, TCP, concurrency, PCM Snapcast, soak/sync capture. Keep credentials/identifiers out of logs.

Best next step is board photography, not more USB polling. See [hardware log](../hardware-investigation.md).
