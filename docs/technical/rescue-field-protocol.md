# Field validation protocol — QRtransfer Rescue

Status: planned; no physical results. Test only in a controlled safe environment with authorized personnel, not during an active rescue. Keep standard communication equipment available. Never wet uncertified devices or use lights toward drivers or sensitive people.

## Design

Use two documented devices (model, OS/browser, battery health, display size/refresh, speaker setting, camera exposure) and identical UTF-8 payloads. Compare QR Binary vs QR GF27 at identical frame bytes, ECC, grid and FPS; compare M3 v1 vs v2 with identical waveform timing and messages using saved v1 artifact as baseline. Randomize run order. Repeat at least 10 trials per cell, report exact n, confidence intervals and failures; increase repetitions for a formal reliability claim. Record commit, artifact hash, start time, setup, environmental measurements and reference message hash. Use fictional coordinates and no personal medical data.

| Factor | Proposed controlled levels |
|---|---|
| Distance | 0.5, 1, 2, 5, 10 m (stop when unsafe/unreliable) |
| Ambient sound | quiet, 60, 75 dBA measured using calibrated meter; no hazardous noise exposure |
| Light | 5, 50, 300 lux, measured with external meter |
| Rain | dry, simulated light/heavy rain with protected equipment and measured rate; never use storm/flood exposure |
| Payload | 16, 64, 120 UTF-8 bytes incl. Vietnamese accents and WGS84 |
| Motion | fixed support, safe handheld |
| Energy | sender and receiver separately; external power meter Wh preferred, battery percentage fallback |

## Measurements

Packet error rate = failed verified messages / attempted messages. Record timeouts as failures, no dropping outliers. Report successful original payload bytes / elapsed wall seconds (including acquisition), p50/p95 latency, success count and Wilson 95% intervals; bit/trit error requires known reference and raw symbol captures (not currently exported). Energy per verified message = external Wh / success count; report no-success case separately. Battery percentage delta is not Wh. Maximum tested usable range is farthest tested cell meeting prespecified reliability target, not a universal range.

ASR: enroll on-device with 3 examples per phrase. Test held-out utterances and unrelated speech at each noise level. Report per-phrase accuracy, false accept, false reject; do not claim free-form WER for enrolled-template recognizer. Verify GPS against known reference, accuracy estimate, age, manual fallback.

## Acceptance gates (proposed, not achieved)

No accepted CRC mismatch; no silently altered coordinates; successful offline operation after copying HTML under airplane mode; permission denial falls back to manual input; assess e.g. >=95% verified message delivery at a documented range with adequate trials. Do not promote to safety-critical deployment without independent validation and applicable approvals.

Use field UI to record observations and export JSON; attach instrument logs and raw data separately. Never fill absent measurements with estimates.
