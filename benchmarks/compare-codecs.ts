import { createHash } from "node:crypto";
import { writeFileSync, mkdirSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { platform, arch, cpus } from "node:os";
import { LTEncoder, LTDecoder } from "../shared/fountain";
import { GF27Encoder, GF27Decoder } from "../shared/gf27.mjs";
const hash=(b:Uint8Array)=>createHash("sha256").update(b).digest("hex");
const runs=[];
for(const size of [65536,1048576])for(const loss of [0,0.1,0.3,0.5])for(const seed of [42,123,456])for(const mode of ["binary","gf27"]){
let s=seed;const rng=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/2**32;};
const b=Uint8Array.from({length:size},()=>Math.floor(rng()*256));const digest=hash(b),t=performance.now();
const e=mode==="gf27"?new GF27Encoder(b,1463,seed):new LTEncoder(b,1463,seed);
const d=mode==="gf27"?new GF27Decoder(e.k,1463,seed,b.length):new LTDecoder(e.k,1463,seed,b.length);
let seq=0;while(!d.isComplete&&seq<e.k*30){const f=e.encode(seq);if(rng()>=loss)d.addFrame(seq,f);seq++;}
const out=d.assemble(),ms=performance.now()-t,receivedHash=out?hash(out):null;const ok=receivedHash===digest;
runs.push({mode,size,loss,seed,k:e.k,framesAttempted:seq,framesAccepted:d.framesNew,ms,sha256:digest,receivedHash,ok,cpuGoodputMiBs:ok?size/1048576/(ms/1000):null});
}
const result={kind:"synthetic codec CPU experiment, NOT optical camera benchmark",node:process.version,platform:platform(),arch:arch(),cpu:cpus()[0]?.model,commit:process.env.GITHUB_SHA??null,runs};
mkdirSync("benchmarks/results",{recursive:true});writeFileSync("benchmarks/results/codec-comparison.json",JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(runs.some(r=>!r.ok))process.exitCode=1;
