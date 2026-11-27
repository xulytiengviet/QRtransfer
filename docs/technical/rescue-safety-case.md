# QRtransfer Rescue 3.1.0-RC.1 — safety case and independent acceptance

Status: research candidate, NOT certified, NOT a primary emergency channel. Prior CI/build success is not a safety certification. No stable release authorization. Keep official communications available. Intended use: short authorized, non-sensitive messages in a controlled local optical/acoustic link on supported general-purpose devices. No claim of range, weather rating, medical-device status, end-to-end authentication, delivery or dispatch.

## Hazard register

| ID | Hazard | Mitigation in RC | Remaining verification |
|---|---|---|---|
| H01 | False interpretation or incorrect voice/location | Human review before transmission; GPS age check; manual input | Held-out speech and human factors test |
| H02 | Corrupt packet | GF27 FEC and CRC32 fail closed | Independent channel, synchronization, adversarial tests |
| H03 | Sender assumes delivery | UI explicitly says no acknowledgment | Operational readback procedure |
| H04 | Stale received text | Clear display at new receive attempt; receipt timestamp | Browser integration/race tests |
| H05 | Concurrent media/permission request | Serialize actions; stop on background; no automatic SOS | Device matrix and permission denial |
| H06 | Light/audio exposure | Small light patch, low-rate modulation, explicit warning; stop | Independent photobiological/acoustic review |
| H07 | Location/privacy leakage or spoofed sender | Explicit consent, no cloud, no encryption/authentication claim | Security threat model; authenticated protocol if needed |
| H08 | Battery loss, rain, range failure | Field measurement protocol; no physical range claim | Physical testing and battery profiles |
| H09 | Supply-chain alteration | SHA256 sums at release; RC only | Independent signature and trusted distribution |
| H10 | File browser restrictions | Manual text/trits/WAV fallback | Actual offline mobile/desktop trials |

## Acceptance gates (all independently reviewed before stable)
1. Reproducible version-specific artifact SHA256 and source commit, signed acceptance, full CI matrix, dependency/security review.
2. Physical range, latency, PER and energy with raw logs, calibrated equipment, predefined limits and adequate independent trials. No substituted synthetic results.
3. Confirm camera/mic/GPS permission denials, browser offline, lifecycle interrupts, low-battery behavior; no stale/incorrect accepted messages.
4. Human-factor assessment of ASR, manual fallback, SOS and readback, location consent and accessibility.
5. Regulatory applicability and independent laboratory/operational acceptance by competent organization, scoped to device/configuration. ISO 22320:2018 (incident management guidance), ISO 22301:2019 (BCMS), IEC 62368-1:2023 (equipment safety where applicable) are reference frameworks, not certificates for this HTML. See official ISO/IEC catalogs; national conformity obligations require scope review.
6. Record certificate/approval issuer, scope, ID, date, validity and artifact hash only when actually issued. No self-certification.

Use `release/rescue-readiness.json` for current gate state and `rescue-field-protocol.md` for test protocol. Release workflow rejects stable tags; only RC/alpha/beta tags can publish prerelease artifacts. It cannot block manual GitHub releases or privileged edits; repository tag rules and protected environments require separate administrator configuration.
