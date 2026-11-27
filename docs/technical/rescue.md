# QRtransfer Rescue / QRT-M3 v2 — experimental, not certified

Copy `public/rescue.html` and open in a browser. No external scripts, fonts, model downloads, network requests or installation. Text, trits and WAV work locally; microphone/camera/GPS depend on browser permission and local-file policy. On-device free-form speech recognition only when a preinstalled vi-VN model is available. Never send voice to cloud. Separate international Morse SOS. Do not replace official emergency communications, transmit sensitive health/location data without authorization, enter unsafe floodwater, or expose people to flashing lights.

## Wire and safety contract

- Legacy QRT-M3 v1 is still accepted: preamble 012210102201021120, header 3 bytes (49, mode, count), six trits per byte. Mode 0 UTF-8; mode 1 exact reverse-checked CVNSS lowercase space+a-z (3 trits). CRC32 of original UTF-8, big endian. Maximum 120 original UTF-8 bytes.
- v2 preamble 021120201102210012; protect v1 header, payload and CRC (without v1 preamble) with systematic (18,12) Cauchy MDS over GF(27), polynomial x^3+2x+1; pad with zeros to 12 symbols. Each symbol = 3 trits; each group = 54 trits. Both audio and light use exactly the same frame. Preamble itself is not FEC protected.
- Decode any 12 valid distinct symbols per group; low-confidence trit '?' erases its whole symbol. Recover up to six erased symbols; implementation also searches for a single substitution with up to four erasures, not a general three-error decoder. Reject ambiguous/inconsistent rows, malformed headers, nonzero padding and CRC mismatch. CRC32 is not cryptographic authentication; link is unencrypted. No delivery acknowledgment.
- 3-FSK 700/1100/1500 Hz, 100 ms/trit; optical patch 500 ms/trit. Slow by design; prioritize concise rescue messages. Do not claim long-range operation. Capture before transmit; clock drift and insert/delete synchronization are not solved.
- Optional WGS84 coordinates: explicit GPS permission or manual input, bounds validation, accuracy if known, reject GPS older than 5 min; no automatic transmission. Receiver reads coordinates as text. No map or network dependency. GPS time is UTC time-of-day, not full date.
- ASR Lite: speaker-dependent enrollment (2–6 phrases, three 1.5 s samples each), seven log spectral bands, DTW, distance/margin rejection, RAM-only templates. Not general Vietnamese ASR; no measured word error rate; verify phrase before transmitting.

## WASM SIMD

`shared/gf27-simd.mjs` embeds 1460-byte WASM; source `research/gf27_simd.c`. QR GF27 AXPY uses self-checked SIMD only for 2048–3072 field symbols, otherwise JS; if compilation/CSP/arithmetic probe fails, JS fallback. Rescue FEC operates on small groups using JS tables; do not assert SIMD speedup on rescue. Benchmark: `node benchmarks/gf27-simd.mjs`. Existing measured gain is workload-dependent.

## Evidence and limitations

`benchmarks/rescue-fec-isolate.json` and `benchmarks/rescue-channel-isolate.json`: executed synthetic loopbacks including failure at low optical contrast. Not physical dBA, lux, rain, range or battery data. `tests/rescue.test.ts`: automated regression. Field measurement UI exports operator-entered JSON and calculates packet error rate. No physical field data collected. See `docs/technical/rescue-field-protocol.md`.
