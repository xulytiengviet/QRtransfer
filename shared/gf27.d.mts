export function add(a:number,b:number):number;
export function mul(a:number,b:number):number;
export function rawBlockLen(wire:number):number;
export function valid(k:number,w:number,total:number):boolean;
export class GF27Encoder {constructor(payload:Uint8Array,blockLen:number,sessionId:number);readonly k:number;readonly blockLen:number;encode(seq:number):Uint8Array;}
export class GF27Decoder {constructor(k:number,blockLen:number,sessionId:number,totalLen:number);readonly k:number;readonly blockLen:number;readonly totalLen:number;readonly sessionId:number;readonly isComplete:boolean;solvedCount:number;framesNew:number;framesDup:number;framesRedundant:number;addFrame(seq:number,block:Uint8Array):void;assemble():Uint8Array|null;}