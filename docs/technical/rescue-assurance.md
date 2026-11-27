# QRtransfer Rescue 3.1.0-RC.2 — R&D and independent assurance dossier

**Research prototype / not certified.** This is a mapping to publicly described scope, not a clause-by-clause conformity assessment. Obtain applicable editions, amendments and competent independent review. Never substitute this tool for official emergency channels. The current software has no authenticated sender or automatic delivery acknowledgment.

## Reference framework
| Reference | Application | Evidence / gap |
|---|---|---|
| OECD Frascati Manual 2015 https://www.oecd.org/en/publications/frascati-manual-2015_9789264239012-en.html | Novelty, creativity, uncertainty, systematic method, reproducibility | Hypotheses and preregistration below; novelty literature review pending |
| ISO/IEC/IEEE 15288:2023 https://www.iso.org/standard/81702.html | System life cycle | Traceability, hazards, version control; full lifecycle audit pending |
| ISO/IEC 25010:2023 https://www.iso.org/standard/78176.html | Software product quality model | Integrity, performance, interaction, compatibility, safety; independent assessment pending |
| ISO/IEC/IEEE 29119-2:2021 https://www.iso.org/standard/79428.html | Test processes | Automated regression, physical test plan; execution pending |
| ISO 22320:2018 https://www.iso.org/standard/67851.html | Incident management guidance | Readback, handover, fallback procedure; operational exercises pending |
| ISO/IEC 17025:2017 https://www.iso.org/standard/17025 | Lab competence | Select accredited lab within relevant scope; no lab commissioned |
| ISO/IEC 27001:2022 https://www.iso.org/standard/27001 | Organizational security management | Threat review, supply chain; no ISMS certification claim |
| IEC 62368-1:2023 https://webstore.iec.ch/en/publication/69308 | Equipment safety where applicable | Device-specific independent safety assessment |
| IEC 62471:2006 / IEC 62471-7:2023 https://webstore.iec.ch/en/publication/68810 | Optical exposure where applicable | Review exact light source, luminance and temporal modulation; not a flicker certification |
| ITU-T X.1303 bis https://www.itu.int/itu-t/recommendations/rec.aspx?rec=X.1303+bis | CAP public warning interoperability | Future gateway only; QRT-M3 is not CAP and not an authoritative alert service |
| Vietnam Circular 29/2025/TT-BKHCN https://mst.gov.vn/danh-muc-san-pham-hang-hoa-co-kha-nang-gay-mat-an-toan-trong-linh-vuc-cong-nghe-thong-tin-va-vien-thong-197251115212002848.htm | Check applicability to actual ICT/telecom product and hardware | No automatic conclusion about standalone HTML; competent authority/lab must determine scope and current rules |

## R&D preregistration
Hypotheses: GF27 improves verified delivery under matched erasure conditions relative to M3 v1; QR GF27 vs binary fountain may trade goodput for resilience; SIMD may improve CPU time on selected block sizes. No universal superiority or novelty claim. Freeze versions, device pair, randomization, sample sizes, outcome definitions, timeouts and thresholds BEFORE collecting data; retain failures. Record source commit, artifact SHA256, environment, raw logs and seed. Keep exploratory/synthetic results separate from confirmatory physical results. Compare same payload, symbol timing, FPS, device settings and environmental conditions. Report effect sizes and uncertainty, not just pass rate. Perform literature/prior-art review separately.

## Evidence workflow
1. Copy research/field-plan.template.json and set identity, artifact digest, preregistration UTC and cells. Archive plan hash before trials.
2. Copy research/field-trials.template.json and add one row per attempt: id, cellId, kind="physical", utc, operator, instrumentLog, instrumentLogSha256, expectedSha256, receivedSha256 (null when absent), outcome (verified/timeout/rejected/wrong), elapsedS, payloadBytes, energyWh (null if not measured). "wrong" means an incorrect message accepted by receiver. Store actual device settings, measured environmental variation and calibrated instrument logs separately. Never use fixture records as physical evidence.
3. Run node research/field-evaluate.mjs plan.json trials.json > summary.json. Evaluator checks internal consistency, not authenticity of operator entries, raw hashes or preregistration. Independent auditor must check original data, actual artifact and logs.
4. Proposed reliability threshold: lower bound of two-sided Wilson 95% interval >=99% per predefined cell; 381/381 successes is the minimum zero-failure case for that threshold, not a guarantee. 10 exploratory trials insufficient. Timeouts count as failures; no pooling of unlike cells. p95 of verified attempts reported with failure rate; verify timeouts independently. Repeated trials may be dependent; independent statistician must review sampling. Latency target 10s is provisional and current M3 may not meet it.
5. CI evidence includes source digest, HTML digest, lockfile digest, npm test log and CycloneDX SBOM. Hashes alone are not signatures; verify trusted source. No new dependencies.
6. Traceability: research/requirements.json links requirements and hazards to evidence with partial/missing explicitly marked. A statistical pass cannot authorize stable.

## Operational protocol for controlled exercise only
Use assigned device pair and preagreed channel; keep radio/phone/official channels available. Sender reads message and coordinates, receiver reads back exact text through a separate available channel, sender verifies readback. Log time and identifier manually; if no readback or mismatch, switch to official fallback without delaying urgent assistance. Do not infer dispatch, identity or delivery from CRC. No real patient data or public SOS during testing. Stop test if environmental or exposure conditions become unsafe.

## Independent acceptance
Obtain written regulatory scope determination, lab reports within relevant accreditation scope, device matrix, human factors and security review, signed operational acceptance, version-specific artifact digest, validity and restrictions. Resolve all critical hazards. Record issuer and certificate only when issued. Release remains blocked by policy. No claim of accreditation, certification or legal conformity.
