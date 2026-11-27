#include <stdint.h>
#include <wasm_simd128.h>
static uint8_t digit[32], mulpacked[27][32];
static uint8_t d[65536], s[65536];
static unsigned mul(unsigned a,unsigned b){unsigned x[3]={a%3,a/3%3,a/9},y[3]={b%3,b/3%3,b/9},c[5]={0};for(int i=0;i<3;i++)for(int j=0;j<3;j++)c[i+j]+=x[i]*y[j];for(int i=4;i>=3;i--){c[i-2]+=c[i];c[i-3]+=2*c[i];}return c[0]%3+3*(c[1]%3)+9*(c[2]%3);}
static unsigned packed(unsigned a){return (a%3)|((a/3%3)<<2)|((a/9)<<4);}
__attribute__((export_name("init"))) void init(void){for(unsigned i=0;i<27;i++){digit[i]=packed(i);for(unsigned c=0;c<27;c++)mulpacked[c][i]=packed(mul(c,i));}}
__attribute__((export_name("dst_ptr"))) uintptr_t dst_ptr(void){return (uintptr_t)d;}
__attribute__((export_name("src_ptr"))) uintptr_t src_ptr(void){return (uintptr_t)s;}
static v128_t lookup(v128_t x,const uint8_t *t){return wasm_v128_or(wasm_i8x16_swizzle(wasm_v128_load(t),x),wasm_i8x16_swizzle(wasm_v128_load(t+16),wasm_i8x16_sub(x,wasm_i8x16_splat(16))));}
static v128_t mod3(v128_t a,v128_t b){v128_t z=wasm_i8x16_add(a,b);return wasm_i8x16_sub(z,wasm_v128_and(wasm_u8x16_ge(z,wasm_i8x16_splat(3)),wasm_i8x16_splat(3)));}
__attribute__((export_name("axpy"))) int axpy(unsigned n,unsigned c){if(n>65536||c>=27)return -1;if(!c)return 0;unsigned i=0;v128_t mask=wasm_i8x16_splat(3);for(;i+16<=n;i+=16){v128_t a=lookup(wasm_v128_load(d+i),digit),b=lookup(wasm_v128_load(s+i),mulpacked[c]);v128_t z0=mod3(wasm_v128_and(a,mask),wasm_v128_and(b,mask));v128_t z1=mod3(wasm_v128_and(wasm_u8x16_shr(a,2),mask),wasm_v128_and(wasm_u8x16_shr(b,2),mask));v128_t z2=mod3(wasm_u8x16_shr(a,4),wasm_u8x16_shr(b,4));v128_t v=wasm_i8x16_add(z0,wasm_i8x16_add(wasm_i8x16_add(z1,wasm_i8x16_shl(z1,1)),wasm_i8x16_add(z2,wasm_i8x16_shl(z2,3))));wasm_v128_store(d+i,v);}for(;i<n;i++){unsigned a=d[i],b=mul(c,s[i]);d[i]=(a%3+b%3)%3+3*((a/3%3+b/3%3)%3)+9*((a/9+b/9)%3);}return 0;}