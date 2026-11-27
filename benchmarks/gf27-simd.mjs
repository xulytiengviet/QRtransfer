import { createSIMD, wasmBase64 } from "../shared/gf27-simd.mjs";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { createHash } from "node:crypto";
import { cpus } from "node:os";
function add(a,b){return (a%3+b%3)%3+3*((Math.floor(a/3)%3+Math.floor(b/3)%3)%3)+9*((Math.floor(a/9)+Math.floor(b/9))%3);}
function mul(a,b){let x=[a%3,Math.floor(a/3)%3,Math.floor(a/9)],y=[b%3,Math.floor(b/3)%3,Math.floor(b/9)],c=[0,0,0,0,0];for(let i=0;i<3;i++)for(let j=0;j<3;j++)c[i+j]+=x[i]*y[j];for(let i=4;i>=3;i--){c[i-2]+=c[i];c[i-3]+=2*c[i];}return c[0]%3+3*(c[1]%3)+9*(c[2]%3);}
const A=Uint8Array.from({length:729},(_,i)=>add(i/27|0,i%27)),M=Uint8Array.from({length:729},(_,i)=>mul(i/27|0,i%27)),simd=createSIMD();assert.ok(simd);assert.equal(createHash("sha256").update(Buffer.from(wasmBase64,"base64")).digest("hex"),"39dc6a95889ddd8e319b3f29370a2a72d0366243b5e10a75a9d0cbdc7cff380a");
for(let c=0;c<27;c++){let d=Uint8Array.from({length:729},(_,i)=>i/27|0),s=Uint8Array.from({length:729},(_,i)=>i%27);assert.ok(simd(d,s,c));for(let i=0;i<729;i++)assert.equal(d[i],A[(i/27|0)*27+M[c*27+i%27]]);}
function run(n,loops){let x=Uint8Array.from({length:n},(_,i)=>i%27),y=Uint8Array.from({length:n},(_,i)=>(i*17)%27),z=x.slice();let t=performance.now();for(let j=0;j<loops;j++)for(let i=0;i<n;i++)x[i]=A[x[i]*27+M[13*27+y[i]]];let js=performance.now()-t;t=performance.now();for(let j=0;j<loops;j++)assert.ok(simd(z,y,13));let wasm=performance.now()-t;assert.deepEqual(x,z);return {js,wasm};}const results=[];for(let n of [2300,4600,65536]){run(n,500);let a=Array.from({length:5},()=>run(n,2000)),median=k=>a.map(x=>x[k]).sort((a,b)=>a-b)[2];results.push({n,loops:2000,repeat:5,jsMs:median("js"),wasmMs:median("wasm"),speedup:median("js")/median("wasm")});}console.log(JSON.stringify({node:process.version,cpu:cpus()[0].model,fieldCases:19683,results},null,2));
