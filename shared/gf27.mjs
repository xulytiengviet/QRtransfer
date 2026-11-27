// QRtransfer GF27 systematic Cauchy erasure coding. AGPL-3.0-or-later.
import { createSIMD } from './gf27-simd.mjs';
let simd=null;
// Probe once; CSP/unsupported CPU safely fall back. Verify arithmetic before use.
function getSIMD(){if(simd!==null)return simd||null;simd=false;const f=createSIMD();if(f){const a=Uint8Array.from({length:64},(_,i)=>i%27),b=Uint8Array.from({length:64},(_,i)=>(i*11)%27);for(let k=1;k<27;k++){let d=a.slice();if(!f(d,b,k)||d.some((v,i)=>v!==ADD[a[i]*27+MUL[k*27+b[i]]]))return null;}simd=f;}return simd||null;}
function add(a,b){let v=0,p=1;for(let i=0;i<3;i++){v+=((a%3+b%3)%3)*p;a=Math.floor(a/3);b=Math.floor(b/3);p*=3;}return v;}
function mul(a,b){const x=[a%3,Math.floor(a/3)%3,Math.floor(a/9)],y=[b%3,Math.floor(b/3)%3,Math.floor(b/9)],c=[0,0,0,0,0];for(let i=0;i<3;i++)for(let j=0;j<3;j++)c[i+j]+=x[i]*y[j];for(let i=4;i>=3;i--){c[i-2]+=c[i];c[i-3]+=2*c[i];}return c[0]%3+3*(c[1]%3)+9*(c[2]%3);}
const ADD=Uint8Array.from({length:729},(_,i)=>add(Math.floor(i/27),i%27));
const MUL=Uint8Array.from({length:729},(_,i)=>mul(Math.floor(i/27),i%27));
const NEG=Uint8Array.from({length:27},(_,i)=>mul(2,i));
const INV=Uint8Array.from({length:27},(_,a)=>{for(let b=1;b<27;b++)if(MUL[a*27+b]===1)return b;return 0;});
const GROUP=12,PARITY=15,LIMIT=64*1024*1024+131119;
function rawBlockLen(wire){return Math.floor(wire/7)*6;}
function symbolsFromRaw(raw,off,wire){const a=new Uint8Array(Math.floor(wire/7)*11);for(let g=0;g<a.length/11;g++){let n=0;for(let j=0;j<6;j++)n=n*256+(raw[off+g*6+j]??0);for(let j=10;j>=0;j--){a[g*11+j]=n%27;n=Math.floor(n/27);}}return a;}
function pack(a,wire){const b=new Uint8Array(wire);for(let g=0;g<a.length/11;g++){let n=0;for(let j=0;j<11;j++)n=n*27+a[g*11+j];for(let j=6;j>=0;j--){b[g*7+j]=n%256;n=Math.floor(n/256);}}return b;}
function unpack(b){const a=new Uint8Array(Math.floor(b.length/7)*11);for(let i=Math.floor(b.length/7)*7;i<b.length;i++)if(b[i])throw Error("GF27 padding");for(let g=0;g<a.length/11;g++){let n=0;for(let j=0;j<7;j++)n=n*256+b[g*7+j];if(!Number.isSafeInteger(n)||n>=27**11)throw Error("GF27 noncanonical");for(let j=10;j>=0;j--){a[g*11+j]=n%27;n=Math.floor(n/27);}}return a;}
function writeRaw(a,out,off){for(let g=0;g<a.length/11;g++){let n=0;for(let j=0;j<11;j++)n=n*27+a[g*11+j];if(n>=2**48)throw Error("GF27 source overflow");for(let j=5;j>=0;j--){const v=n%256,i=off+g*6+j;if(i<out.length)out[i]=v;else if(v)throw Error("GF27 source padding");n=Math.floor(n/256);}}}
function frameRow(k,seq){const groups=Math.ceil(k/GROUP),p=seq%(k+groups*PARITY);let g,local;if(p<k){g=Math.floor(p/GROUP);local=p%GROUP;}else{g=(p-k)%groups;local=GROUP+Math.floor((p-k)/groups);}const count=Math.min(GROUP,k-g*GROUP),row=new Uint8Array(count);if(local<GROUP)row[local]=1;else for(let j=0;j<count;j++)row[j]=INV[ADD[j*27+NEG[local]]];return {g,local,row};}
function axpy(dst,src,c){if(!c)return;if(dst.length>=2048&&dst.length<=3072&&getSIMD()?.(dst,src,c))return;for(let j=0;j<dst.length;j++)dst[j]=ADD[dst[j]*27+MUL[c*27+src[j]]];}
function scale(a,c){for(let j=0;j<a.length;j++)a[j]=MUL[c*27+a[j]];}
function valid(k,w,total){const raw=rawBlockLen(w);return Number.isInteger(k)&&k>0&&k<=65535&&Number.isInteger(w)&&w>=7&&w<=2931&&Number.isInteger(total)&&total>0&&total<=LIMIT&&Math.ceil(total/raw)===k;}
class GF27Encoder {
 constructor(payload,blockLen,sessionId){this.payload=payload;this.blockLen=blockLen;this.sessionId=sessionId;this.raw=rawBlockLen(blockLen);this.k=Math.ceil(payload.length/this.raw);if(!valid(this.k,blockLen,payload.length))throw Error("GF27 capacity");}
 encode(seq){const {g,row}=frameRow(this.k,seq),a=new Uint8Array(Math.floor(this.blockLen/7)*11);for(let j=0;j<row.length;j++)if(row[j])axpy(a,symbolsFromRaw(this.payload,(g*GROUP+j)*this.raw,this.blockLen),row[j]);return pack(a,this.blockLen);}
}
class GF27Decoder{
 constructor(k,blockLen,sessionId,totalLen){if(!valid(k,blockLen,totalLen))throw Error("GF27 invalid header");Object.assign(this,{k,blockLen,sessionId,totalLen});this.raw=rawBlockLen(blockLen);this.solvedCount=0;this.framesNew=0;this.framesDup=0;this.framesRedundant=0;this.groups=new Map();this.completed=new Set();this.out=new Uint8Array(totalLen);}
 get isComplete(){return this.solvedCount===this.k;}
 addFrame(seq,block){if(this.isComplete||block.length!==this.blockLen)return;const {g,local,row}=frameRow(this.k,seq);if(this.completed.has(g)){this.framesRedundant++;this.framesNew++;return;}let state=this.groups.get(g);if(state?.seen.has(local)){this.framesDup++;return;}let data;try{data=unpack(block);}catch{return;}if(!state){state={seen:new Set(),basis:new Array(row.length).fill(null),rank:0};this.groups.set(g,state);}state.seen.add(local);this.framesNew++;for(let i=0;i<row.length;i++){const prior=state.basis[i];if(row[i]&&prior){const c=NEG[row[i]];axpy(row,prior.row,c);axpy(data,prior.data,c);}}const i=row.findIndex(v=>v!==0);if(i<0){this.framesRedundant++;return;}const inv=INV[row[i]];scale(row,inv);scale(data,inv);for(const q of state.basis){if(q&&q.row[i]){const c=NEG[q.row[i]];axpy(q.row,row,c);axpy(q.data,data,c);}}state.basis[i]={row,data};state.rank++;this.solvedCount++;if(state.rank===row.length){for(let j=0;j<row.length;j++)writeRaw(state.basis[j].data,this.out,(g*GROUP+j)*this.raw);this.groups.delete(g);this.completed.add(g);}}
 assemble(){return this.isComplete?this.out:null;}
}
export {add,mul,rawBlockLen,valid,GF27Encoder,GF27Decoder};
