import {createHash} from "node:crypto";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {execFileSync} from "node:child_process";
const paths=["public/rescue.html","shared/gf27.mjs","shared/gf27-simd.mjs","package-lock.json","research/field-evaluate.mjs","docs/technical/rescue-safety-case.md","docs/technical/rescue-assurance.md","release/rescue-readiness.json","research/requirements.json"];
const files=Object.fromEntries(paths.map(p=>[p,createHash("sha256").update(readFileSync(p)).digest("hex")]));
mkdirSync("evidence",{recursive:true});
writeFileSync("evidence/manifest.json",JSON.stringify({schema:"qrt-software-evidence-v1",commit:execFileSync("git",["rev-parse","HEAD"],{encoding:"utf8"}).trim(),node:process.version,platform:process.platform,arch:process.arch,runId:process.env.GITHUB_RUN_ID??null,generatedUtc:new Date().toISOString(),files,physicalFieldTest:false,certified:false},null,2));
