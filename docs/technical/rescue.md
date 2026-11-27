# QRtransfer Rescue / QRT-M3 v1

Self-contained public/rescue.html; copy and open directly, no network or installation. Text and WAV work without camera/mic; file:// permissions vary. ASR is on-device only with preinstalled vi-VN model, no cloud fallback. 3-FSK 700/1100/1500 Hz at 100 ms/trit; light 3 grayscale levels at 500 ms/trit. Separate SOS traditional 3 short/3 long/3 short. No emergency certification; use official communication methods when available.

Wire: preamble 012210102201021120; header 3 bytes (49, mode, count), six base-3 digits per byte. Mode 0 UTF-8, mode 1 exact reverse-checked CVNSS lowercase space+a-z mapped to three trits. CRC32 of original UTF-8, four bytes big endian. Maximum 120 UTF-8 bytes. No FEC or authentication; repeat manually. GF27/QR independent. No bundled ASR model. Synthetic tests in benchmarks/rescue-loopback.json, not physical field testing.

## GF27 SIMD research kernel

`shared/gf27-simd.mjs` embeds a 1460-byte WASM SIMD kernel with no external fetch. Source: `research/gf27_simd.c`. Compile: `clang --target=wasm32 -O3 -fno-vectorize -fno-slp-vectorize -msimd128 -nostdlib -Wl,--no-entry -Wl,--export-memory -Wl,--strip-all -o gf27_simd.wasm research/gf27_simd.c`. Benchmark: `node benchmarks/gf27-simd.mjs`. The kernel is an opt-in research module; it is not yet connected to the GF27 optical stream in PR #2. Local CPU measurements show a modest small-block gain and no consistent large-block gain. No optical speed claim.
