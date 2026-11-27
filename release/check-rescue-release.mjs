// Prevent this repository's release workflow from publishing a stable tag
// until independent evidence is reviewed. This does not prevent manual releases.
import {readFileSync} from "node:fs";
const tag=process.argv[2]??"";
const state=JSON.parse(readFileSync(new URL("./rescue-readiness.json",import.meta.url),"utf8"));
if(/^v\d+\.\d+\.\d+-(rc|alpha|beta)\.\d+$/.test(tag)){console.log("Research prerelease only:",tag);process.exit(0);}
console.error("Stable release BLOCKED: independent certification/acceptance not established.",JSON.stringify(state.evidence));
process.exit(1);
