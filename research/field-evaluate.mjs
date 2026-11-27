// Operator-submitted trial data, not a certification engine. AGPL-3.0-or-later.
import {readFileSync} from "node:fs";
import {pathToFileURL} from "node:url";
const hash=x=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x);
const nonempty=x=>typeof x==="string"&&x.trim().length>0;
const finite=(x,min=0,max=Infinity)=>typeof x==="number"&&Number.isFinite(x)&&x>=min&&x<=max;
const utc=x=>typeof x==="string"&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(x)&&Number.isFinite(Date.parse(x));
function need(v,msg){if(!v)throw Error(msg);}
export function wilson(k,n){need(Number.isInteger(k)&&Number.isInteger(n)&&n>0&&k>=0&&k<=n,"invalid counts");const z=1.959963984540054,p=k/n,d=1+z*z/n,c=(p+z*z/(2*n))/d,h=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return [Math.max(0,c-h),Math.min(1,c+h)];}
export function evaluate(plan,data){
 need(plan?.schema==="qrt-field-plan-v2"&&data?.schema==="qrt-field-trials-v2","schema");
 need(hash(plan.artifactSha256)&&plan.artifactSha256===data.artifactSha256&&/^[a-f0-9]{40}$/.test(plan.commit)&&plan.commit===data.commit,"artifact identity");
 need(utc(plan.registeredUtc)&&nonempty(plan.planId)&&plan.planId===data.planId,"plan identity");
 need(Array.isArray(plan.cells)&&plan.cells.length>0&&plan.cells.length<=1000,"cells");
 need(Array.isArray(data.trials)&&data.trials.length<=100000,"trials");
 const cells=new Map(),ids=new Set();
 for(const c of plan.cells){
  need(nonempty(c.id)&&!cells.has(c.id),"duplicate cell");
  need(["audio","light","qr-binary","qr-gf27"].includes(c.channel)&&nonempty(c.sender)&&nonempty(c.receiver)&&nonempty(c.condition),"cell config");
  need(finite(c.distanceM)&&finite(c.lux)&&finite(c.noiseDBA,0,200)&&finite(c.rainMmH)&&finite(c.maxLatencyS,.001)&&finite(c.minSuccess,.95,1)&&Number.isInteger(c.minTrials)&&c.minTrials>=10,"cell limits");
  cells.set(c.id,{c,trials:[]});
 }
 for(const t of data.trials){
  need(nonempty(t.id)&&!ids.has(t.id),"duplicate trial");ids.add(t.id);
  const cell=cells.get(t.cellId);need(cell,"unplanned cell");
  need(t.kind==="physical"&&utc(t.utc)&&Date.parse(t.utc)>=Date.parse(plan.registeredUtc)&&nonempty(t.operator)&&nonempty(t.instrumentLog)&&hash(t.instrumentLogSha256),"physical provenance missing");
  need(hash(t.expectedSha256)&&["verified","timeout","rejected","wrong"].includes(t.outcome)&&finite(t.elapsedS,.001)&&finite(t.payloadBytes,1,67108864)&&Number.isInteger(t.payloadBytes),"trial values");
  need(t.receivedSha256===null||hash(t.receivedSha256),"received hash");
  need(t.outcome!=="verified"||t.receivedSha256===t.expectedSha256,"verified hash mismatch");
  need(t.outcome!=="wrong"||(hash(t.receivedSha256)&&t.receivedSha256!==t.expectedSha256),"wrong outcome inconsistent");
  need(t.energyWh===null||finite(t.energyWh),"energy");cell.trials.push(t);
 }
 const results=[];
 for(const {c,trials:t} of cells.values()){
  const n=t.length,k=t.filter(x=>x.outcome==="verified").length,w=t.filter(x=>x.outcome==="wrong").length;
  const ci=n?wilson(k,n):null, times=t.filter(x=>x.outcome==="verified").map(x=>x.elapsedS).sort((a,b)=>a-b),p95=times.length?times[Math.ceil(times.length*.95)-1]:null;
  const energy=t.every(x=>x.energyWh!==null)&&n?t.reduce((s,x)=>s+x.energyWh,0):null;
  const seconds=t.reduce((s,x)=>s+x.elapsedS,0);
  results.push({id:c.id,n,verified:k,wrongAccepted:w,PER:n?1-k/n:null,wilson95:ci,p95LatencyS:p95,goodputBytesS:seconds?t.filter(x=>x.outcome==="verified").reduce((s,x)=>s+x.payloadBytes,0)/seconds:null,energyWhPerVerified:energy!==null&&k?energy/k:null,statisticalGate:Boolean(n>=c.minTrials&&ci&&ci[0]>=c.minSuccess&&w===0&&p95!==null&&p95<=c.maxLatencyS)});
 }
 return {schema:"qrt-field-summary-v2",planId:plan.planId,artifactSha256:plan.artifactSha256,commit:plan.commit,results,statisticalGatesMet:results.every(x=>x.statisticalGate),independentReviewRequired:true,certified:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){try{console.log(JSON.stringify(evaluate(JSON.parse(readFileSync(process.argv[2],"utf8")),JSON.parse(readFileSync(process.argv[3],"utf8"))),null,2));}catch(e){console.error(e.message);process.exitCode=1;}}
