import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const html=readFileSync("public/rescue.html","utf8");
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]!);
const context=vm.createContext({TextEncoder,TextDecoder});
vm.runInContext(scripts[0]!,context);
const core=scripts[1]!.split("const $=id=>")[0]!;
const api=vm.runInContext(core+"\n({frame,decode,find,wave,audio,light,crc,wav,cv:globalThis.CVNSSConverter})",context);
test("standalone has no network dependencies",()=>{assert.equal(scripts.length,2);assert.doesNotMatch(html,/<script[^>]+src=|<link[^>]+href=/i);assert.match(html,/connect-src 'none'/);assert.ok(api.cv.selfTest().ok);});
test("text, synthetic audio and light roundtrip and corrupt rejection",()=>{for(const s of ["can cuu ho","Cần cứu hộ, 5 người.","tôi yêu tiếng Việt","SOS 112","Đường ngập 2m 🚨","a\u0301","sẽ hề mồ mộ võ","a".repeat(120)]){const f=api.frame(s,api.cv);assert.equal(api.decode(f.t,api.cv).text,s);assert.equal(api.audio(api.wave(f.t),8000,api.cv).text,s);const l=[];for(let i=0;i<f.t.length;i++)for(let j=0;j<10;j++)l.push([i*500+j*50,40+Number(f.t[i])*90]);assert.equal(api.light(l,api.cv).text,s);const bad=f.t.slice(0,-1)+((Number(f.t.at(-1))+1)%3);assert.equal(api.decode(bad,api.cv).text,s); const lost=f.t.slice(0,18)+"?".repeat(21)+f.t.slice(39);assert.throws(()=>api.decode(lost,api.cv)); const erased=f.t.slice(0,18)+"?".repeat(18)+f.t.slice(36);assert.equal(api.decode(erased,api.cv).text,s);assert.throws(()=>api.decode(f.t.slice(0,-1),api.cv));}assert.throws(()=>api.frame("a".repeat(121),api.cv));});

test("randomized FEC erasures and fail-closed beyond bound",()=>{let seed=123;for(let i=0;i<128;i++){const s="Cần cứu hộ "+i+" người; kiểm tra tọa độ.",f=api.frame(s,api.cv),a=f.t.split("");for(let off=18;off<a.length;off+=54){const rows=new Set<number>();while(rows.size<6){seed=(Math.imul(seed,1664525)+1013904223)>>>0;rows.add(seed%18);}for(const row of rows)for(let j=0;j<3;j++)a[off+3*row+j]="?";}assert.equal(api.decode(a.join(""),api.cv).text,s);assert.throws(()=>api.decode(f.t.slice(0,18)+"?".repeat(21)+f.t.slice(39),api.cv));}});
test("release candidate visible; explicit review and no delivery claim",()=>{assert.match(html,/3\.1\.0-RC\.1/);assert.match(html,/id="reviewtx"/);assert.match(html,/checkTx\(\)/);assert.match(html,/chưa chứng nhận cứu hộ/i);assert.match(html,/chưa có xác nhận/i);});
