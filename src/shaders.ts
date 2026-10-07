export const mainLogoVert =  `
attribute vec3 color;varying vec2 vUv;varying vec3 vNormal;varying vec3 vViewPos;varying vec3 vColor;uniform float uTime;uniform float uHideQuad;uniform float uVisionRotate;uniform float uServiceIn;uniform float uServiceRotate;uniform float uScreenAspectRatio;mat2 rotate(float rad){return mat2(cos(rad),sin(rad),-sin(rad),cos(rad));}
#define PI 3.14159265359
#define TPI 6.28318530718
#define HPI 1.57079632679
void main(void){vec3 pos=position;vec3 nml=normal;mat2 rot;float vis=step(0.95,uHideQuad);pos.xz*=rotate((uVisionRotate*0.15+uServiceRotate*0.5)*HPI);pos.yz*=rotate(uVisionRotate*-0.1-uServiceRotate*0.2);vec4 mvPosition=modelViewMatrix*vec4(pos,1.0);vec4 orthoPos=projectionMatrix*mvPosition;orthoPos.xyz/=orthoPos.w;orthoPos.w=1.0;vec3 scPos=position;
#ifdef IS_OUTLINE
scPos.xyz-=nml*0.001*smoothstep(0.0,0.2,uServiceIn);
#endif
scPos.xz*=rotate(HPI);vec4 screenPos=vec4(scPos.x*(20.5+(1.0/uScreenAspectRatio*3.0)),scPos.y*(7.0+uScreenAspectRatio*8.0)-0.22,orthoPos.z,1.0);vec4 finalPosition=mix(orthoPos,screenPos,uServiceRotate);gl_Position=finalPosition;vUv=uv;vNormal=normalMatrix*nml;vViewPos=-mvPosition.xyz;vColor=color;}`;

export const mainLogoFrag =  `
uniform sampler2D uTrnsTex;uniform sampler2D uNoiseTex;uniform samplerCube uEnvMap;uniform vec2 uTrnsWinRes;uniform float uHideQuad;uniform float uKvOutVisibility;uniform float uScrollOutro;uniform float uRoughness;uniform float uNoiseScale;uniform vec3 uMaterialColor;varying vec2 vUv;varying vec3 vNormal;varying vec3 vViewPos;varying vec3 vColor;
#define PI 3.14159265359
#define TPI 6.28318530718
#define HPI 1.57079632679
float random(vec2 p){return fract(sin(dot(p.xy,vec2(12.9898,78.233)))*43758.5453);}
#define SMPLAES 8
float ggx(float dNH,float roughness){float a2=roughness*roughness;a2=a2*a2;float dNH2=dNH*dNH;if(dNH2<=0.0)return 0.0;return a2/(PI*pow(dNH2*(a2-1.0)+1.0,2.0));}float fresnel(float d){float f0=0.1;return f0+(1.0-f0)*pow(1.0-d,5.0);}void main(void){vec3 c=vec3(0.0);vec2 trnsUv=gl_FragCoord.xy/uTrnsWinRes.xy;vec4 noise=texture2D(uNoiseTex,vUv*uNoiseScale);vec4 noise2=texture2D(uNoiseTex,vUv*1.0+(noise.xy-0.5)*2.0);float roughness=smoothstep(0.3,0.8,noise2.y)*uRoughness;vec3 normal=normalize(vNormal);float refractPower=0.1;vec2 refractNormal=normal.xy*(1.0-normal.z*0.7);vec2 refractUv=trnsUv;vec3 refractCol=vec3(0.0);for(int i=0;i<SMPLAES;i++){float slide=0.005+random(trnsUv+float(i)*0.2)*0.007;vec2 roughnessDir=vec2(random(trnsUv+float(i)*0.1)-0.5,random(trnsUv+float(i)*0.2)-0.5)*roughness*0.3;vec2 refractUvR=roughnessDir+refractUv-refractNormal*(refractPower+slide*1.0);vec2 refractUvG=roughnessDir+refractUv-refractNormal*(refractPower+slide*2.0);vec2 refractUvB=roughnessDir+refractUv-refractNormal*(refractPower+slide*4.0);vec3 bg=vec3(texture2D(uTrnsTex,refractUvR).x,texture2D(uTrnsTex,refractUvG).y,texture2D(uTrnsTex,refractUvB).z);refractCol+=bg*0.9;}refractCol/=float(SMPLAES);c+=(refractCol);vec3 viewDir=normalize(vViewPos);vec3 L=normalize(vec3(-1.0,0.8,-1.0));vec3 H=normalize(viewDir+L);float dNH=dot(normal,H);float spec=ggx(dNH,0.003+roughness*0.4);c+=spec;float F=fresnel(dot(viewDir,normal));c+=mix(c,textureCube(uEnvMap,reflect(viewDir,normal)).rgb,F*0.9)*(1.0-F);c*=1.2;c*=uMaterialColor/255.0;gl_FragColor=vec4(c,1.0);}`;

export const mainLogoOutlineFrag =  `
varying vec2 vUv;void main(void){
#ifdef IS_BASE
gl_FragColor=vec4(vec3(vec3(0.8431372549019608,0.8588235294117647,0.8627450980392157)),0.0);
#endif
#ifdef IS_OUTLINE
gl_FragColor=vec4(vec3(1.0),1.0);
#endif
}`;

export const mainLogoScreenFrag =  `
varying vec2 vUv;uniform sampler2D uSceneTex;uniform sampler2D uNoiseTex;uniform vec2 uScreenResolution;uniform float uServiceIn;uniform float uScreenNoiseScale;float random(vec2 p){return fract(sin(dot(p.xy,vec2(12.9898,78.233)))*43758.5453);}vec2 lens_distortion(vec2 r,float alpha){return r*(1.0-alpha*dot(r,r));}uniform float uVisionRotate;void main(void){vec2 geoUV=vUv;geoUV.x-=0.5;geoUV.x*=0.15;geoUV.x+=0.5;vec2 screenUv=gl_FragCoord.xy/uScreenResolution.xy;vec2 uv=mix(geoUV,screenUv,pow(uServiceIn,0.2));vec2 effectUv=geoUV;vec4 n1=texture2D(uNoiseTex,effectUv*uScreenNoiseScale);vec4 n2=texture2D(uNoiseTex,effectUv*0.3*uScreenNoiseScale+n1.xy*(2.3+random(screenUv)*0.2));vec3 effectCol=n2.xyz;vec3 sceneCol=vec3(0.0);float serviceInInv=(1.0-uServiceIn);for(int i=0;i<5;i++){float fi=(float(i)/5.0);vec2 distortedUv=uv;distortedUv.xy+=(n2.xy-0.5)*serviceInInv;float distortPower=serviceInInv*5.0+fi*0.2*serviceInInv;sceneCol.x+=texture2D(uSceneTex,lens_distortion(distortedUv-0.5,1.0*distortPower)+0.5).x;sceneCol.y+=texture2D(uSceneTex,lens_distortion(distortedUv-0.5,1.05*distortPower)+0.5).y;sceneCol.z+=texture2D(uSceneTex,lens_distortion(distortedUv-0.5,1.1*distortPower)+0.5).z;}sceneCol/=5.0;sceneCol*=1.0+serviceInInv*3.0;sceneCol*=mix(0.5+effectCol*1.0,vec3(1.0),uServiceIn);vec2 warpUv=vUv;warpUv.x-=0.5;warpUv.x*=0.5;warpUv.x+=0.5;warpUv.y+=0.05;float w=smoothstep(0.0,0.0+1.0*smoothstep(0.0,1.0,n2.z),-n2.y+uServiceIn*2.0);vec3 outCol=vec3(effectCol.xyz);outCol=mix(outCol,sceneCol,w);gl_FragColor=vec4(outCol,smoothstep(0.0,0.1,uVisionRotate));}`;

export const bgVert =  `
varying vec2 vUv;void main(void){gl_Position=vec4(position.xy,1.0,1.0);vUv=uv;}`;

export const bgFrag =  `
varying vec2 vUv;uniform sampler2D uNoiseTex;uniform float uNoise;uniform vec2 uScreenResolution;uniform vec2 uMousePos;float random(vec2 p){return fract(sin(dot(p.xy,vec2(12.9898,78.233)))*43758.5453);}void main(void){vec3 o=vec3(0.0);vec4 noise=texture2D(uNoiseTex,vUv*1.0)+random(vUv)*0.2;float rnd=(0.6+random(vUv)*0.4);o.x+=smoothstep(0.5,1.0,noise.x);o.y+=smoothstep(0.2,1.0,noise.y);o.z+=smoothstep(0.0,1.0,noise.z);o.xyz*=vec3(0.3,0.4,0.6)*0.3;o+=vec3(0.01,0.025,0.06);vec2 cuv=vUv-0.5;float len=length(cuv);o.xyz*=smoothstep(0.9,0.3,len);o*=smoothstep(1.0,0.0,length(vUv-0.5+vec2(-0.3,0.0)))*0.8;vec2 fragUv=gl_FragCoord.xy/uScreenResolution.xy;gl_FragColor=vec4(o,1.0);}`;

export const gridVert =  `
varying vec2 vUv;uniform vec3 uScale;uniform float uTime;uniform float uScroll;
#define PI 3.14159265359
#define TPI 6.28318530718
#define HPI 1.57079632679
mat2 rotate(float rad){return mat2(cos(rad),sin(rad),-sin(rad),cos(rad));}
#ifdef IS_GRID
#endif
#ifdef IS_CROSS
attribute vec2 instanceId;
#endif
void main(void){vec2 localPos=position.xy;
#ifdef IS_CROSS
vec2 loopPos=instanceId.xy;loopPos.y=mod(loopPos.y+uScroll*0.1,1.0);localPos=(loopPos-0.5)*1.0;
#endif
float theta=localPos.x*PI;vec3 roundedPos=vec3(0.0);
#ifdef IS_ROUND
roundedPos=vec3(sin(theta)*0.5*uScale.x,localPos.y*uScale.y*1.5,-cos(theta)*uScale.x*0.5);
#endif
#ifdef IS_FLAT
roundedPos=vec3(localPos.x*uScale.x,localPos.y*uScale.y,0.0);
#endif
vec3 pos=vec3(0.0);
#ifdef IS_GRID
pos=roundedPos;
#endif
#ifdef IS_CROSS
pos=position*0.15;
#ifdef IS_ROUND
pos.xz*=rotate(-theta);
#endif
pos+=roundedPos;
#endif
gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0);vUv=uv;}`;

export const gridFrag =  `
varying vec2 vUv;uniform vec2 uGrid;uniform float uTime;uniform float uThumbnailScroll;void main(void){float line=0.0;vec2 gridUv=vUv*uGrid;gridUv.x*=0.6;gridUv.x+=uTime+uThumbnailScroll*2.5;line+=smoothstep(0.48,0.5,abs(fract(gridUv.x)-0.5));line=max(line,smoothstep(0.48,0.5,abs(fract(gridUv.y)-0.5)));
#ifdef IS_DARK
gl_FragColor=vec4(vec3(0.0),0.7);
#else
gl_FragColor=vec4(vec3(1.0),0.5);
#endif
gl_FragColor.a*=line*0.2;}`;

export const gridFrag_1 =  `
varying vec2 vUv;uniform vec2 uGrid;uniform float uTime;uniform float uScroll;uniform sampler2D uFluidsTex;void main(void){float line=0.0;vec2 gridUv=vUv*uGrid;gridUv.y-=uScroll*1.5;float lineThreshold=0.45;
#ifndef IS_DARK
#ifdef IS_THIN_LIGHT
lineThreshold=0.44;
#else
lineThreshold=0.46;
#endif
#endif
line+=smoothstep(lineThreshold,0.5,abs(fract(gridUv.x)-0.5));line=max(line,smoothstep(lineThreshold,0.5,abs(fract(gridUv.y)-0.5)));
#ifdef IS_DARK
gl_FragColor=vec4(vec3(0.0),0.1);
#else
vec4 fluids=texture2D(uFluidsTex,vUv);vec3 col=vec3(1.0);col.xy-=fluids.xy*0.005;gl_FragColor=vec4(col,0.5);
#endif
#ifdef IS_THIN_LIGHT
gl_FragColor.a*=line*0.05;
#else
gl_FragColor.a*=line*0.2;
#endif
}`;

export const crossFrag =  `
varying vec2 vUv;uniform float uTime;void main(void){float line=0.0;vec2 gridUv=vUv-0.5;float w=0.08;line+=smoothstep(w,0.01,abs(gridUv.x));line=max(line,smoothstep(w,w*0.1,abs(gridUv.y)));
#ifdef IS_DARK
gl_FragColor=vec4(vec3(0.0),1.0);
#else
gl_FragColor=vec4(vec3(1.0),0.7);
#endif
gl_FragColor.a*=line*0.6;}`;

export const crossFrag_1 =  `
varying vec2 vUv;void main(void){float line=0.0;vec2 gridUv=vUv-0.5;float w=0.08;line+=smoothstep(w,0.01,abs(gridUv.x));line=max(line,smoothstep(w,w*0.1,abs(gridUv.y)));
#ifdef IS_DARK
gl_FragColor=vec4(vec3(0.0),0.2);
#else
gl_FragColor=vec4(vec3(1.0),0.3);
#ifdef IS_THIN_LIGHT
gl_FragColor.a*=0.5;
#endif
#endif
gl_FragColor.a*=line;}`;

export const bgQuadVert =  `
attribute vec3 instancePosition;attribute vec2 instanceScale;attribute vec4 instanceID;attribute float instanceDepth;uniform float uTime;uniform vec3 uScale;uniform sampler2D uFluidsTex;uniform float uUVShift;uniform float uUVShiftPower;uniform float uUVShiftHash;uniform float uBlackOut;uniform float uBlackOutHash;uniform float uPatternSelect;uniform float uPatternSelectType;uniform float uWorks1Aspect;uniform float uWorks2Aspect;uniform float uScreenAspectRatio;uniform float uScroll;uniform float uScrollPageLerp;uniform float uScrollPage;uniform float uHide;uniform float uWorksTitleProgress;varying vec2 vWorksUv1;varying vec2 vWorksUv2;varying float vDisplayWorks;varying vec2 vUv;varying vec2 vScreenUv;varying vec2 vGlobalUv;varying vec3 vScreenOffsetPos;varying vec3 vNormal;varying float vSideFace;varying float vEmitSide;varying float vBlackOut;varying float vPatternSelect;varying vec4 vInstanceID;varying vec2 vWorksTitleUv;mat2 rotate(float rad){return mat2(cos(rad),sin(rad),-sin(rad),cos(rad));}float random(vec2 p){return fract(sin(dot(p.xy,vec2(12.9898,78.233)))*43758.5453);}
#define PI 3.14159265359
#define TPI 6.28318530718
#define HPI 1.57079632679
float cubicIn(float t){return t*t*t;}float cubicOut(float t){float f=t-1.0;return f*f*f+1.0;}float cubicInOut(float t){return t<0.5? 4.0*t*t*t: 0.5*pow(2.0*t-2.0,3.0)+1.0;}float circularIn(float t){return 1.0-sqrt(1.0-t*t);}float circularOut(float t){return sqrt((2.0-t)*t);}float circularInOut(float t){return t<0.5? 0.5*(1.0-sqrt(1.0-4.0*t*t)): 0.5*(sqrt((3.0-2.0*t)*(2.0*t-1.0))+1.0);}float quarticIn(float t){return pow(t,4.0);}float quarticOut(float t){return pow(t-1.0,3.0)*(1.0-t)+1.0;}float quarticInOut(float t){return t<0.5?+8.0*pow(t,4.0):-8.0*pow(t-1.0,4.0)+1.0;}float exponentialIn(float t){return t==0.0 ? t : pow(2.0,10.0*(t-1.0));}float exponentialOut(float t){return t==1.0 ? t : 1.0-pow(2.0,-10.0*t);}float exponentialInOut(float t){return t==0.0||t==1.0? t: t<0.5?+0.5*pow(2.0,(20.0*t)-10.0):-0.5*pow(2.0,10.0-(t*20.0))+1.0;}void main(void){vec3 pos=position;float hide=smoothstep(0.2,0.8,-instanceID.z+uHide*2.0);pos*=1.0-hide;pos.xy*=1.0-0.003*pow(2.0,instanceDepth);pos.xy*=instanceScale;pos.xz*=rotate((instanceID.x-0.5)*hide*PI*2.0);pos.y+=hide*0.05*instanceID.z;vec3 pos2=pos;vec4 offsetMVPosition=modelViewMatrix*vec4(instancePosition*uScale,1.0);vec4 offsetScreenPosition=projectionMatrix*offsetMVPosition;offsetScreenPosition.xyz/=offsetScreenPosition.w;vScreenOffsetPos=offsetScreenPosition.xyz;vec4 fluids=texture2D(uFluidsTex,offsetScreenPosition.xy*0.5+0.5);vec2 screenPosUv=(offsetScreenPosition.xy*0.5+0.5);float displayWorks=smoothstep(0.0,0.3,-(screenPosUv.x)+(uScroll*float(WORKS_NUM))*1.6);float worksUvShiftW=smoothstep(0.0,0.4,-(screenPosUv.x)+(uScroll*float(WORKS_NUM))*1.6);float fadeOut=smoothstep(1.0,0.9,uScroll);vDisplayWorks=displayWorks*fadeOut;vPatternSelect=0.0;if(uPatternSelectType==0.0){vPatternSelect=step(0.5,uPatternSelect);}else if(uPatternSelectType==1.0){float fade=step(instanceID.x,uPatternSelect);vPatternSelect=fade;}else if(uPatternSelectType==2.0){float fade=smoothstep(0.0,1.0,-(instancePosition.x+0.5)+uPatternSelect*2.0);fade=exponentialOut(fade);vPatternSelect=fade;pos.xz*=rotate(fade*TPI);}float r=smoothstep(vScreenOffsetPos.y*0.5+0.5-0.4,vScreenOffsetPos.y*0.5+0.5+0.4,uScrollPage*(1.0+0.4*2.0)-0.4);pos+=instancePosition;pos2+=instancePosition;pos2.x*=uScale.x;pos2.y*=uScale.y;float roundTheta=pos.x*PI;vec3 resultPos=pos;resultPos.x*=0.0;resultPos.xz*=rotate(HPI);resultPos.z-=uScale.x/2.0;resultPos.y*=uScale.y*1.5;resultPos.xz*=rotate(-roundTheta);vec4 mvPosition=modelViewMatrix*vec4(resultPos,1.0);gl_Position=projectionMatrix*mvPosition;vSideFace=abs(normal.z);vEmitSide=length(fluids.xy);vUv=uv;vGlobalUv=instancePosition.xy+0.5+(uv-0.5)*instanceScale;vec4 screenUVMVPosition=modelViewMatrix*vec4(pos2*0.5,1.0);vec4 screenUVScreenPosition=projectionMatrix*screenUVMVPosition;vScreenUv=screenUVScreenPosition.xy/screenUVScreenPosition.w*0.5+0.5;float shiftUvHash=floor(uUVShiftHash*5.0)/5.0;vec2 us=vec2(random(instanceID.xy+shiftUvHash),random(instanceID.xy+shiftUvHash+10.0))-0.5;us*=(uUVShiftPower)*step(random(instanceID.xy+shiftUvHash),uUVShift);vScreenUv+=us;float blackOutHash=floor(uBlackOutHash*5.0)/5.0;vBlackOut=step(random(instanceID.xy+blackOutHash),uBlackOut);vec2 worksUvShift=vec2(0.0,0.0+random(instanceID.yz)-0.5)*1.0;float worksTitleScale=max(1.0,0.8/uScreenAspectRatio*2.0);vec2 worksTitleUv=vScreenUv;worksTitleUv-=0.5;worksTitleUv*=worksTitleScale;worksTitleUv.x*=uScreenAspectRatio;worksTitleUv*=rotate(-0.15);worksTitleUv.y*=4.5;worksTitleUv.x*=1.2;worksTitleUv*=rotate(-0.015);worksTitleUv.x-=-0.18+uWorksTitleProgress*0.3;worksTitleUv+=0.5;vWorksTitleUv=worksTitleUv;float slide=0.5;vWorksUv1=vScreenUv-us-worksUvShift*pow((1.0,uScrollPageLerp),2.0);vWorksUv1.x=vWorksUv1.x;vWorksUv1.x-=uScrollPageLerp*slide;vWorksUv2=vScreenUv-us-worksUvShift*pow((1.0,1.0-uScrollPageLerp),2.0);vWorksUv2.x=vWorksUv2.x;vWorksUv2.x+=(1.0-uScrollPageLerp)*slide;if(uScreenAspectRatio<uWorks1Aspect){vWorksUv1.x-=0.5;vWorksUv1.x*=uScreenAspectRatio/uWorks1Aspect;vWorksUv1.x+=0.5;}else{vWorksUv1.y-=0.5;vWorksUv1.y/=uScreenAspectRatio/uWorks1Aspect;vWorksUv1.y+=0.5;}if(uScreenAspectRatio<uWorks2Aspect){vWorksUv2.x-=0.5;vWorksUv2.x*=uScreenAspectRatio/uWorks2Aspect;vWorksUv2.x+=0.5;}else{vWorksUv2.y-=0.5;vWorksUv2.y/=uScreenAspectRatio/uWorks2Aspect;vWorksUv2.y+=0.5;}vInstanceID=instanceID;}`;

export const bgQuadFrag =  `
uniform float uTime;uniform vec2 uScreenResolution;uniform sampler2D uLogoTex;uniform sampler2D uPatternCurrent;uniform sampler2D uPatternNext;uniform float uLogoDisplayType;uniform float uScrollPage;uniform sampler2D uWorks1Tex;uniform float uWorks1Loaded;uniform sampler2D uWorks2Tex;uniform float uWorks2Loaded;uniform sampler2D uWorksTitleTex;uniform float uWorksTitleProgress;uniform float uHideQuad;varying vec2 vUv;varying vec2 vGlobalUv;varying float vSideFace;varying float vEmitSide;varying vec2 vScreenUv;varying float vBlackOut;varying float vPatternSelect;varying vec4 vInstanceID;varying vec2 vWorksTitleUv;varying vec2 vWorksUv1;varying vec2 vWorksUv2;varying float vDisplayWorks;
#define PI 3.14159265359
#define TPI 6.28318530718
#define HPI 1.57079632679
float random(vec2 p){return fract(sin(dot(p.xy,vec2(12.9898,78.233)))*43758.5453);}vec3 hsv2rgb(vec3 hsv){return((clamp(abs(fract(hsv.x+vec3(0,2,1)/3.)*6.-3.)-1.,0.,1.)-1.)*hsv.y+1.)*hsv.z;}vec3 rgb2hsv(vec3 rgb){vec4 K=vec4(0.0,-1.0/3.0,2.0/3.0,-1.0);vec4 p=mix(vec4(rgb.bg,K.wz),vec4(rgb.gb,K.xy),step(rgb.b,rgb.g));vec4 q=mix(vec4(p.xyw,rgb.r),vec4(rgb.r,p.yzx),step(p.x,rgb.r));float d=q.x-min(q.w,q.y);float e=1.0e-10;return vec3(abs(q.z+(q.w-q.y)/(6.0*d+e)),d/(q.x+e),q.x);}void main(void){vec4 o=vec4(0.0,0.0,0.0,1.0);vec2 fragUV=gl_FragCoord.xy/uScreenResolution;float wtVisibility=smoothstep(0.1,0.3,uWorksTitleProgress)*smoothstep(1.0,0.9,uWorksTitleProgress);vec4 pat1=texture2D(uPatternCurrent,vScreenUv);vec4 pat2=texture2D(uPatternNext,vScreenUv);o.xyz=mix(pat1.xyz,pat2.xyz,vPatternSelect);o.xyz*=(1.0-wtVisibility*0.5);o.xyz*=(1.0-vBlackOut);vec2 logoUv=vScreenUv;if(uLogoDisplayType==0.0){logoUv=vGlobalUv;logoUv-=0.5;logoUv.y*=1204.0/250.0;logoUv*=1.0;logoUv+=0.5;vec2 tileUv=logoUv.xy*2.0;tileUv.x+=sin(floor(tileUv.y)*3.0+uTime)*0.1;logoUv=fract(tileUv)*1.3;}else if(uLogoDisplayType==1.0){logoUv=vGlobalUv;logoUv-=0.5;logoUv.y*=1204.0/250.0;logoUv*=1.1;logoUv+=0.5;vec2 tileUv=logoUv.xy*1.0;tileUv.x+=uTime*0.05*sign(floor(tileUv.y));logoUv=fract(tileUv)*1.0;if(abs(floor(tileUv.y))<0.5){logoUv=vec2(0.0);}}else if(uLogoDisplayType==2.0){logoUv=vUv;logoUv-=0.5;logoUv.x/=1204.0/250.0;logoUv+=0.5;logoUv.y-=uTime*0.5*vInstanceID.x;logoUv.y=fract(logoUv.y);logoUv-=0.5;logoUv*=1.3+vInstanceID.z*5.0;logoUv+=0.5;logoUv.x-=0.38;if(logoUv.x>0.23||logoUv.x<0.00||logoUv.y>1.0||logoUv.y<0.0||vInstanceID.y<0.0){logoUv=vec2(0.0);}}vec4 logo=texture2D(uLogoTex,logoUv);float logoW=step(0.5,logo.w)*step(0.0,logoUv.y)*step(logoUv.y,1.0);o.xyz+=logoW*0.2*(1.0-wtVisibility);float hideKv=smoothstep(0.0,1.0,-vInstanceID.x+uHideQuad*2.0);vec2 flashUv=(vUv-0.5)*vec2(1.0,1.0+hideKv*50.0);o.xyz=mix(o.xyz,(o.xyz+0.1)*20.0*vInstanceID.z,step(0.01,hideKv));float turnOff=1.0;turnOff*=step(length(flashUv.y)+hideKv*0.9,1.0);turnOff*=step(length(flashUv.x)+pow(hideKv,3.0),1.0);o.xyz*=turnOff;vec2 worksTitleUv=vWorksTitleUv;vec3 worksTitleCol=texture2D(uWorksTitleTex,worksTitleUv).xyz;worksTitleCol*=wtVisibility;float num=float(WORKS_NUM);float numP=float(WORKS_NUM+1);vec3 t1=(texture2D(uWorks1Tex,vWorksUv1).xyz)*uWorks1Loaded;vec3 t2=(texture2D(uWorks2Tex,vWorksUv2).xyz)*uWorks2Loaded;float blurSize=0.03;vec3 worksCol=mix(t1,t2,smoothstep(fragUV.x-blurSize,fragUV.x+blurSize,uScrollPage*(1.0+blurSize*2.0)-blurSize));worksCol*=mix(1.0,(random(gl_FragCoord.xy/1000.0)),0.1)*1.0;vec3 worksColHSV=rgb2hsv(worksCol);worksCol=hsv2rgb(vec3(worksColHSV.x,worksColHSV.y*2.0,worksColHSV.z));o.xyz=mix(o.xyz,worksCol,vDisplayWorks);o.w+=vDisplayWorks;o.w=min(o.w,1.0);o.xyz*=smoothstep(1.9,0.1,length(vUv-0.5));o.xyz+=worksTitleCol*step(worksTitleUv.x,1.0)*step(0.01,worksTitleUv.x)*1.0;float dotw=smoothstep(0.5,0.2,length(fract(vGlobalUv.xy*1800.0*vec2(1.0,1.0)*0.23)-0.5));dotw=mix(dotw,1.0,0.6)*0.9;o.xyz*=dotw;o.xyz*=smoothstep(0.55,0.05,length(vGlobalUv-0.5));o.xyz*=vSideFace;o.xyz+=(1.0-vSideFace)*0.8*vEmitSide*(mix(0.05,1.0,turnOff)+vDisplayWorks);o.xyz*=0.5;gl_FragColor=o;}`;

export const pattern1Frag =  `
uniform sampler2D uNoiseTex;uniform float uNoise;uniform float uContour;uniform float uTheme;uniform int uPatternType;varying vec2 vUv;float random(vec2 p){return fract(sin(dot(p.xy,vec2(12.9898,78.233)))*43758.5453);}void main(void){vec3 o=vec3(0.0);vec2 uv=vUv;vec4 noise=texture2D(uNoiseTex,uv*1.0);o.x+=smoothstep(0.5,1.0,noise.x);o.y+=smoothstep(0.2,1.0,noise.y);o.z+=smoothstep(0.0,1.0,noise.z);o.xyz*=vec3(0.3,0.4,0.6)*2.0;gl_FragColor=vec4(o,1.0);}`;

export const pattern2Frag =  `
uniform sampler2D uNoiseTex;uniform sampler2D uFluidsTex;varying vec2 vUv;float random(vec2 p){return fract(sin(dot(p.xy,vec2(12.9898,78.233)))*43758.5453);}void main(void){vec3 o=vec3(0.0);vec2 uv=vUv;vec4 noise=texture2D(uNoiseTex,uv*1.0);float w=fract(noise.w*9.0);w=step(0.5,w);o+=w;gl_FragColor=vec4(o,1.0);}`;

export const pattern3Frag =  `
uniform sampler2D uNoiseTex;varying vec2 vUv;float random(vec2 p){return fract(sin(dot(p.xy,vec2(12.9898,78.233)))*43758.5453);}vec3 hsv2rgb(vec3 hsv){return((clamp(abs(fract(hsv.x+vec3(0,2,1)/3.)*6.-3.)-1.,0.,1.)-1.)*hsv.y+1.)*hsv.z;}vec3 rgb2hsv(vec3 rgb){vec4 K=vec4(0.0,-1.0/3.0,2.0/3.0,-1.0);vec4 p=mix(vec4(rgb.bg,K.wz),vec4(rgb.gb,K.xy),step(rgb.b,rgb.g));vec4 q=mix(vec4(p.xyw,rgb.r),vec4(rgb.r,p.yzx),step(p.x,rgb.r));float d=q.x-min(q.w,q.y);float e=1.0e-10;return vec3(abs(q.z+(q.w-q.y)/(6.0*d+e)),d/(q.x+e),q.x);}void main(void){vec3 o=vec3(0.0);vec2 uv=vUv;vec4 noise=texture2D(uNoiseTex,uv*1.0);vec3 c=vec3(0.34509803921568627,0.09803921568627451,0.9921568627450981)*vec3(0.6,0.6,1.0);c=mix(c,vec3(0.6980392156862745,0.9294117647058824,1.),smoothstep(0.5,0.9,noise.w));c=mix(c,vec3(0.9921568627450981,0.37254901960784315,0.047058823529411764),smoothstep(0.5,1.0,noise.y));o+=vec3(c);gl_FragColor=vec4(o,1.0);}`;

export const noiseFrag =  `
uniform sampler2D uTex;uniform float uScreenAspectRatio;varying vec2 vUv;uniform float uTime;vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}float noise3D(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}void main(void){float tn=uTime*0.1;float t=uTime*0.1;vec2 aspUv=vUv*vec2(uScreenAspectRatio,1.0)-0.5;vec2 nuv=aspUv*0.5;float n1=noise3D(vec3(nuv+1234.0,tn+0.0));float n2=noise3D(vec3(nuv+5678.0,tn+10.0));vec2 uv=aspUv*0.6+vec2(n1,n2)*0.7;vec4 col=vec4(0.0);col.x+=noise3D(vec3(uv+1.0,t+0.0));col.y+=noise3D(vec3(uv+2.0,t+1.0));col.z+=noise3D(vec3(uv+3.0,t+2.0));col.w+=noise3D(vec3(aspUv+noise3D(vec3(nuv+1234.0,t*0.)),t*0.05+3.0));col=col*0.5+0.5;gl_FragColor=col;}`;

export const worksThumbnailVert =  `
uniform float uTexAspect;uniform float uPosX;uniform float uScrollVelocity;
#define MESH_ASPECT ( 16.0 / 9.0 )
varying vec2 vUv;varying vec2 vMeshUv;varying float vFunya;varying vec3 vNormal;varying vec3 vNormalGeo;varying float vFront;varying vec3 vMVPosition;varying vec3 vRefDir;mat2 rotate(float rad){return mat2(cos(rad),sin(rad),-sin(rad),cos(rad));}
#define PI 3.14159265359
#define TPI 6.28318530718
#define HPI 1.57079632679
void main(void){vFunya=abs(uScrollVelocity);vec3 pos=position;pos+=length(position.xy)*vec3(1.0,-0.1,0.0)*vec3(vec2(min(0.1,uScrollVelocity*0.0)),0.0);pos.z*=0.2;pos.z+=cos(pos.x/4.0*PI/2.0*0.5)*1.5-1.0;vUv=uv;vMeshUv=uv;if(uTexAspect<=MESH_ASPECT){vUv.y-=0.5;vUv.y*=uTexAspect/MESH_ASPECT;vUv.y+=0.5;}else{vUv.x-=0.5;vUv.x/=uTexAspect/MESH_ASPECT;vUv.x+=0.5;}vec4 mvPosition=modelViewMatrix*vec4(pos,1.0);gl_Position=projectionMatrix*mvPosition;vNormalGeo=normal;vNormal=normal*normalMatrix;vFront=step(0.5,normal.z);vMVPosition=mvPosition.xyz;vRefDir=reflect(-vMVPosition,normalize(vNormal));vRefDir.yz*=rotate(0.2);vRefDir.xy*=rotate(-0.9);vRefDir.xz*=rotate(0.3);}`;

export const worksThumbnailFrag =  `
uniform sampler2D uTex;uniform samplerCube uEnvMap;uniform float uLoaded;uniform float uPosX;uniform float uWorksProgress;uniform float uAlpha;uniform float uScrollVelocity;varying vec2 vUv;varying vec2 vMeshUv;varying float vFunya;varying vec3 vNormal;varying vec3 vNormalGeo;varying float vFront;varying vec3 vMVPosition;varying vec3 vRefDir;mat2 rotate(float rad){return mat2(cos(rad),sin(rad),-sin(rad),cos(rad));}uniform float uTime;float sdBox(in vec2 p,in vec2 b){vec2 d=abs(p)-b;return length(max(d,0.0))+min(max(d.x,d.y),0.0);}float opRound(in vec2 p,in float r){return sdBox(p,vec2(0.5))-r;}vec2 lens_distortion(vec2 r,float alpha){return r*(1.0-alpha*dot(r,r));}void main(void){vec2 uv=vUv;vec2 meshCuv=(vMeshUv-0.5);vec2 moveUVOffset=vec2(0.0);moveUVOffset.x-=uScrollVelocity*1.0;vec2 normalOffset=vec2(0.0);float frontDir=dot(normalize(vNormal),vec3(0.0,0.0,1.0));normalOffset-=vNormal.xy*0.5*smoothstep(0.8,1.0,frontDir);vec4 col=vec4(0.0);if(vFront<0.5){uv.x*=0.01;uv.x+=1.0-vNormalGeo.x*0.19;uv.x+=-vNormal.x*0.5;}for(int i=0;i<4;i++){float fi=float(i)/4.0;vec2 cuv=uv-0.5;cuv*=1.3;cuv.x*=0.9;float distBase=0.1+fi*0.03;col.x+=texture2D(uTex,lens_distortion(cuv,distBase+0.1)+0.5+normalOffset*1.0).x;col.y+=texture2D(uTex,lens_distortion(cuv,distBase+0.12)+0.5+normalOffset*1.01).y;col.z+=texture2D(uTex,lens_distortion(cuv,distBase+0.14)+0.5+normalOffset*1.02).z;}col.xyz/=4.0;col.w=1.0;col.xyz*=smoothstep(0.9,0.49,length(meshCuv));col.w*=uLoaded;col.w*=uAlpha;col.xyz=mix(col.xyz,vec3(smoothstep(0.0,0.2,vRefDir.x)),0.05);gl_FragColor=col;}`;

export const worksTitleVert =  `
#define linearstep(edge0, edge1, x) min(max(((x) - (edge0)) / ((edge1) - (edge0)), 0.0), 1.0)
#define PI 3.14159265359
#define TPI 6.28318530718
#define HPI 1.57079632679
mat2 rotate(float rad){return mat2(cos(rad),sin(rad),-sin(rad),cos(rad));}uniform float uProgress;varying vec2 vUv;varying float vAlpha;varying vec3 vPos;varying vec4 vGLPosition;void main(void){vec3 pos=vec3(0.0);float rotMul=TPI*1.3;float theta=rotMul+position.x*TPI;theta-=(uProgress*3.0)*rotMul;float clampedTheta=clamp(theta,-TPI-PI,PI);float rad=3.0;pos.x=sin(clampedTheta+PI)*rad;pos.z=cos(clampedTheta+PI)*rad;pos.y=position.y;float viewIn=max(0.0,theta-PI);float viewOut=min(0.0,theta+TPI+PI);pos.x+=viewIn*2.0;pos.x+=viewOut*2.0;pos.xy*=rotate(0.2);vec4 mvPosition=modelViewMatrix*vec4(pos,1.0);gl_Position=projectionMatrix*mvPosition;vUv=uv;vAlpha=smoothstep(2.5,0.0,viewIn)*smoothstep(-2.5,0.0,viewOut);vPos=pos;vGLPosition=gl_Position;}`;

export const worksTitleFrag =  `
uniform float uProgress;uniform sampler2D uTex;uniform float uTime;varying vec2 vUv;varying float vAlpha;varying vec3 vPos;varying vec4 vGLPosition;void main(void){vec4 texCol=texture2D(uTex,vUv*vec2(4.0,1.0)+vec2(uTime*0.1-uProgress*13.0,0.0));float p3=uProgress*3.0;float alphadayo=smoothstep(1.0,0.0,p3);alphadayo+=smoothstep(2.0,3.0,p3);texCol.w*=smoothstep(0.0,0.2*alphadayo,vUv.x);texCol.w*=smoothstep(1.0,1.0-0.2*alphadayo,vUv.x);gl_FragColor=vec4(vec3(1.0),texCol.w*vAlpha);gl_FragDepth=vGLPosition.z;if(vPos.z>0.4){gl_FragDepth=0.0;}}`;

export const thumbnailFrag =  `
uniform sampler2D uTextureA;uniform sampler2D uTextureB;uniform float uTextureAlpha;uniform float uMixWeight;uniform float uServiceIn;varying vec2 vUv;varying vec3 vNormal;void main(void){vec2 uv=vUv;vec4 texColorA=texture2D(uTextureA,uv);vec4 texColorB=texture2D(uTextureB,uv);vec4 mixedColor=mix(texColorA,texColorB,uMixWeight);
#ifndef IS_STELLLA
mixedColor.w*=smoothstep(1.0,0.3,length(vUv-0.5));
#endif
mixedColor.rgb*=0.7;gl_FragColor=vec4(mixedColor.rgb,mixedColor.a*uTextureAlpha*smoothstep(0.5,1.0,uServiceIn));}`;

export const logo2DVert =  `
varying vec2 vUv;void main(void){vec3 pos=position;vec4 mvPosition=modelViewMatrix*vec4(pos,1.0);gl_Position=projectionMatrix*mvPosition;vUv=uv;}`;

export const logo2DFrag =  `
varying vec2 vUv;uniform sampler2D uTex;uniform float uVisibility;
#define PI 3.14159265359
#define TPI 6.28318530718
#define HPI 1.57079632679
void main(void){vec4 logo=texture2D(uTex,vUv);vec4 o=vec4(0.0);o=logo;o.xyz*=1.5;o.w*=uVisibility;gl_FragColor=o;}`;

export const notFoundVert =  `
uniform float uTime;uniform float uVisibility;varying vec2 vUv;varying float vVisibility;varying vec3 vNormal;mat2 rotate(float rad){return mat2(cos(rad),sin(rad),-sin(rad),cos(rad));}void main(){vUv=uv;vVisibility=uVisibility;float rotationAngle=uTime*1.0;mat2 rot=rotate(rotationAngle);vec3 pos=position;pos.xz*=rot;vec3 nml=normal;nml.xz*=rot;gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0);vNormal=normalize(normalMatrix*nml);}`;

export const notFoundFrag =  `
uniform float uTime;varying vec2 vUv;varying float vVisibility;varying vec3 vNormal;void main(){vec3 col=vec3(0.0,0.0,0.0);col.xyz+=vNormal*0.5+0.5;col=vec3(dot(col.xyz,normalize(vec3(1.0,1.0,1.0))))*0.4;gl_FragColor=vec4(col,1.0);}`;

export const quadVert =  `
out vec2 vUv;void main(void){vec3 pos=position;gl_Position=vec4(pos.xy,0.0,1.0);vUv=uv;}`;

export const outFrag =  `
uniform sampler2D uBackBuffer;varying vec2 vUv;void main(void){vec4 col=texture2D(uBackBuffer,vUv);gl_FragColor=col;}`;

export const copyFrag =  `
uniform sampler2D uBackBuffer;varying vec2 vUv;void main(void){vec4 col=texture2D(uBackBuffer,vUv);gl_FragColor=col;}`;

export const passThroughFrag =  `
uniform sampler2D tex;varying vec2 vUv;void main(){gl_FragColor=texture2D(tex,vUv);}`;

export const blurFrag =  `
in vec2 vUv;uniform sampler2D uBackBuffer;uniform vec2 uResolution;uniform bool uIsVertical;uniform float blurRange;layout(location=0)out vec4 outColor;uniform float[GAUSS_WEIGHTS]uWeights;void main(void){vec2 coord=vec2(gl_FragCoord.xy);vec3 sum=uWeights[0]*texture(uBackBuffer,vUv).rgb;for(int i=1;i<GAUSS_WEIGHTS;i++){vec2 offset=(uIsVertical ? vec2(0,i): vec2(i,0))*0.0;sum+=uWeights[i]*texture(uBackBuffer,vUv+offset/uResolution).rgb;sum+=uWeights[i]*texture(uBackBuffer,vUv-offset/uResolution).rgb;}outColor=vec4(sum,1.0);}`;

export const topSceneMixerFrag =  `
uniform float uScreenAspectRatio;uniform float uSPWeight;uniform vec2 uResolution;uniform sampler2D uMainSceneTex;uniform sampler2D uMissionVisionSceneTex;uniform sampler2D uServiceSceneTex;uniform sampler2D uNoiseTex;uniform sampler2D uFluidsTex;uniform float uVisibleMissionVision;uniform float uVisibleMissionVisionMotionBlur;uniform float uVisibleService;in vec2 vUv;layout(location=0)out vec4 outColor;
#define PI 3.14159265359
#define TPI 6.28318530718
#define HPI 1.57079632679
void main(void){vec2 uv=vUv;vec2 cuv=uv-0.5;float len=length(cuv);vec3 o=vec3(0.0);vec4 fluids=texture2D(uFluidsTex,uv);float fluidsLength=length(fluids.xy);vec3 mainSceneCol=texture(uMainSceneTex,uv+fluids.xy*0.01).xyz;mainSceneCol.xyz*=smoothstep(1.2,0.0,len);mainSceneCol*=1.0+fluidsLength*0.8;o+=mainSceneCol;vec3 missionVisionSceneCol=texture(uMissionVisionSceneTex,uv-fluids.xy*0.01).xyz;float range=1.0/uResolution.y+abs(uVisibleMissionVisionMotionBlur)*0.2;float missionVisionSelector=0.0;float round=-cos((uv.x-0.5)*2.0*PI/2.0)*uVisibleMissionVisionMotionBlur*(1.0-uSPWeight*0.8);if(uVisibleMissionVisionMotionBlur>0.0){missionVisionSelector=smoothstep(0.0,range,-vUv.y+uVisibleMissionVision*(1.0+range)+round);}else{missionVisionSelector=smoothstep(0.0,range,-vUv.y+uVisibleMissionVision*1.0+round);}float missionFluidsThreshold=0.4+(uVisibleService*10.0);float missionVisionFluids=smoothstep(missionFluidsThreshold,missionFluidsThreshold+0.01,fluidsLength);missionVisionSceneCol.xyz*=1.0+length(fluids.xyz)*0.1*missionFluidsThreshold;missionVisionSceneCol.xyz*=smoothstep(1.5,0.3,len);o=mix(o,missionVisionSceneCol,missionVisionSelector);vec3 serviceSceneCol=texture(uServiceSceneTex,uv+fluids.xy*0.01).xyz;serviceSceneCol*=1.0+fluidsLength*0.8;serviceSceneCol.xyz*=smoothstep(1.5,0.3,len);o=mix(o.xyz,serviceSceneCol,step(0.9999,uVisibleService));outColor=vec4(o.xyz,1.0);}`;

export const supageSceneMixerFrag =  `
uniform sampler2D uBackBuffer;uniform sampler2D uSubpageSceneTex;uniform float uSubPageSelector;uniform sampler2D uFluidsTex;in vec2 vUv;layout(location=0)out vec4 outColor;void main(void){vec2 uv=vUv;vec2 cuv=uv-0.5;float len=length(cuv);vec3 o=vec3(0.0);vec4 mainScene=texture(uBackBuffer,uv);vec4 subPage=texture(uSubpageSceneTex,uv);vec4 fluids=texture2D(uFluidsTex,uv);float fluidsLength=length(fluids.xy);subPage.xyz*=1.0+fluidsLength*0.8;subPage.xyz*=smoothstep(1.5,0.3,len);o.xyz=mix(mainScene.xyz,subPage.xyz,uSubPageSelector);outColor=vec4(o.xyz,1.0);}`;

export const topSceneCompositeFrag =  `
uniform sampler2D uBackBuffer;uniform sampler2D uBloomTexture[4];uniform float cameraNear;uniform float cameraFar;uniform sampler2D uFluidsTex;uniform sampler2D uNotFoundSceneTex;uniform float uNotFoundVisibility;uniform sampler2D uAsciiTexture;uniform float uScreenAspectRatio;uniform float uSPWeight;in vec2 vUv;layout(location=0)out vec4 outColor;vec2 lens_distortion(vec2 r,float alpha){return r*(1.0-alpha*dot(r,r));}vec3 filmic(vec3 x){vec3 X=max(vec3(0.0),x-0.004);vec3 result=(X*(6.2*X+0.5))/(X*(6.2*X+1.7)+0.06);return pow(result,vec3(2.2));}void main(void){vec3 col=vec3(0.0,0.0,0.0);vec2 uv=vUv;vec2 cuv=uv-0.5;float len=length(cuv);vec4 fluids=texture2D(uFluidsTex,uv);uv-=(fluids.xy)*0.001;col=texture(uBackBuffer,uv).xyz;vec2 res=vec2(70.0)*(1.0-uSPWeight*0.3);if(uScreenAspectRatio>1.0){res.x*=uScreenAspectRatio;}else{res.y*=1.0/uScreenAspectRatio;}vec2 notFoundUv=floor(uv*res)/res;vec2 asciiUv=fract(uv*res);vec4 notFoundColor=texture(uNotFoundSceneTex,notFoundUv);vec4 asciiFluid=texture2D(uFluidsTex,notFoundUv);float asciiLevel=notFoundColor.x+length(asciiFluid.xy)*0.2;asciiLevel=min(1.0,asciiLevel*1.9);asciiUv.y=1.0-asciiUv.y;asciiUv.x+=15.0-(floor(asciiLevel*15.0));asciiUv.x/=16.0;vec4 asciiColor=texture(uAsciiTexture,asciiUv);col*=1.0-uNotFoundVisibility*0.6;col=mix(col,vec3(1.0),asciiColor.x*uNotFoundVisibility*0.5);
#pragma unroll_loop_start
for(int i=0;i<3;i++){col+=texture(uBloomTexture[UNROLLED_LOOP_INDEX],uv).xyz*(0.5+float(UNROLLED_LOOP_INDEX)*0.5)*0.15;}
#pragma unroll_loop_end
col.xyz*=1.3;outColor=vec4(col,1.0);}`;

export const finalCompositeFrag =  `
uniform sampler2D uBackBuffer;uniform sampler2D uThumbnailSceneTex;uniform sampler2D uLoadingSVGTex;uniform float uTransition;uniform float uLoaded;uniform float uScreenAspectRatio;uniform float uTime;in vec2 vUv;layout(location=0)out vec4 outColor;
#define PI 3.14159265359
#define TPI 6.28318530718
#define HPI 1.57079632679
void main(void){vec2 uv=vUv;vec2 cuv=vUv-0.5;vec4 col=vec4(0.0,0.0,0.0,1.0);if(uLoaded<0.999){if(uScreenAspectRatio>1.0){cuv.y/=uScreenAspectRatio;}else{cuv.x*=uScreenAspectRatio;}float r=smoothstep(0.0,0.2+uLoaded*0.7,-length(cuv)+uLoaded*1.4);vec2 sceneUv=uv;sceneUv-=0.5;sceneUv*=(0.5+uLoaded*0.5);sceneUv+=0.5;sceneUv-=(sin(r*PI))*normalize(cuv)*0.1;vec2 luv=uv-sin(r*PI)*normalize(cuv)*0.1;vec4 backbufferCol=texture(uBackBuffer,sceneUv);vec4 thumbnailCol=texture(uThumbnailSceneTex,sceneUv);col=backbufferCol;col.rgb=mix(col.rgb,thumbnailCol.rgb,thumbnailCol.w*(1.0-uTransition));vec2 loadingUv=luv;loadingUv.y=1.0-loadingUv.y;loadingUv-=0.5;float gradMask=1.0;if(uScreenAspectRatio>1.0){loadingUv.y/=uScreenAspectRatio;loadingUv*=1.0/0.8;gradMask=smoothstep(0.5,0.4,abs(loadingUv.x));}else{loadingUv.x*=uScreenAspectRatio;}loadingUv+=0.5;vec3 loadingSVG=texture(uLoadingSVGTex,loadingUv).xyz*gradMask;col.rgb=mix(loadingSVG,col.rgb,smoothstep(0.0,0.5,r));}else{vec4 backbufferCol=texture(uBackBuffer,uv);vec4 thumbnailCol=texture(uThumbnailSceneTex,uv);col=backbufferCol;col.rgb=mix(col.rgb,thumbnailCol.rgb,thumbnailCol.w*(1.0-uTransition));}outColor=vec4(col.xyz,1.0);}`;

export const fxaaFrag =  `
uniform sampler2D uBackBuffer;uniform vec2 uResolution;uniform vec2 uResolutionInv;in vec2 vUv;layout(location=0)out vec4 outColor;vec4 texOffset(sampler2D tex,vec2 uv,vec2 offsetPixel,vec2 resolutionInv){return texture(tex,uv+offsetPixel*resolutionInv);}
#define FXAA_REDUCE_MIN ( 1.0 / 128.0 )
#define FXAA_REDUCE_MUL ( 1.0 / 8.0 )
#define FXAA_SPAN_MAX 8.0
void main(void){vec3 rgbNW=texOffset(uBackBuffer,vUv,vec2(-1.0,1.0),uResolutionInv).xyz;vec3 rgbNE=texOffset(uBackBuffer,vUv,vec2(1.0,1.0),uResolutionInv).xyz;vec3 rgbSW=texOffset(uBackBuffer,vUv,vec2(-1.0,-1.0),uResolutionInv).xyz;vec3 rgbSE=texOffset(uBackBuffer,vUv,vec2(1.0,-1.0),uResolutionInv).xyz;vec3 rgbM=texture(uBackBuffer,vUv).xyz;vec3 luma=vec3(0.299,0.587,0.114);float lumaNW=dot(rgbNW,luma);float lumaNE=dot(rgbNE,luma);float lumaSW=dot(rgbSW,luma);float lumaSE=dot(rgbSE,luma);float lumaM=dot(rgbM,luma);float lumaMin=min(lumaM,min(min(lumaNW,lumaNE),min(lumaSW,lumaSE)));float lumaMax=max(lumaM,max(max(lumaNW,lumaNE),max(lumaSW,lumaSE)));vec2 dir;dir.x=-((lumaNW+lumaNE)-(lumaSW+lumaSE));dir.y=((lumaNW+lumaSW)-(lumaNE+lumaSE));float dirReduce=max((lumaNW+lumaNE+lumaSW+lumaSE)*(0.25*FXAA_REDUCE_MUL),FXAA_REDUCE_MIN);float rcpDirMin=1.0/(min(abs(dir.x),abs(dir.y))+dirReduce);dir=min(vec2(FXAA_SPAN_MAX,FXAA_SPAN_MAX),max(vec2(-FXAA_SPAN_MAX,-FXAA_SPAN_MAX),dir*rcpDirMin))*uResolutionInv.xy;vec3 rgbA=(1.0/2.0)*(texture(uBackBuffer,vUv+dir*(1.0/3.0-0.5)).xyz+texture(uBackBuffer,vUv+dir*(2.0/3.0-0.5)).xyz);vec3 rgbB=rgbA*0.5+0.25*(texture(uBackBuffer,vUv+dir*-0.5).xyz+texture(uBackBuffer,vUv+dir*0.5).xyz);float lumaB=dot(rgbB,luma);if((lumaB<lumaMin)||(lumaB>lumaMax)){outColor=vec4(rgbA,1.0);}else{outColor=vec4(rgbB,1.0);};}`;

export const bloomBrightFrag =  `
uniform sampler2D uBackBuffer;uniform float threshold;in vec2 vUv;layout(location=0)out vec4 outColor;void main(void){vec4 c=texture(uBackBuffer,vUv);vec3 f;f.x=max(0.0,c.x-threshold);f.y=max(0.0,c.y-threshold);f.z=max(0.0,c.z-threshold);outColor=vec4(vec3(c)*f,1.0);}`;

export const bloomBlurFrag =  `
in vec2 vUv;uniform sampler2D uBloomBackBuffer;uniform vec2 uResolution;uniform bool uIsVertical;uniform float blurRange;layout(location=0)out vec4 outColor;uniform float[GAUSS_WEIGHTS]uWeights;void main(void){vec2 coord=vec2(gl_FragCoord.xy);vec3 sum=uWeights[0]*texture(uBloomBackBuffer,vUv).rgb;for(int i=1;i<GAUSS_WEIGHTS;i++){vec2 offset=(uIsVertical ? vec2(0,i): vec2(i,0))*2.0;sum+=uWeights[i]*texture(uBloomBackBuffer,vUv+offset/uResolution).rgb;sum+=uWeights[i]*texture(uBloomBackBuffer,vUv-offset/uResolution).rgb;}outColor=vec4(sum,1.0);}`;

export const comShaderVelocity =  `
uniform float uTime;uniform vec2 dataSize;uniform sampler2D dataTex;uniform sampler2D curlTex;uniform vec2 pointerPos;uniform vec2 pointerVec;uniform float pointerSize;uniform float screenAspect;uniform vec2 uElmListPos[5];uniform vec2 uElmListVel[5];uniform vec2 uElmListSize[5];float random(vec2 p){return fract(sin(dot(p.xy,vec2(12.9898,78.233)))*43758.5453);}vec2 smapleVelocity(sampler2D tex,vec2 uv,vec2 resolution){vec2 offset=vec2(0.0,0.0);float w=1.0;return w*texture2D(tex,uv+offset/resolution).xy;}float samplePressure(sampler2D tex,vec2 uv,vec2 resolution){vec2 offset=vec2(0.0,0.0);float w=1.0;if(uv.x<0.0){offset.x=1.0;w=-1.0;}else if(uv.x>1.0){offset.x=-1.0;w=-1.0;}if(uv.y<0.0){offset.y=1.0;w=-1.0;}else if(uv.y>1.0){offset.y=-1.0;w=-1.0;}return w*texture2D(tex,uv+offset/resolution).z;}void main(){vec2 uv=gl_FragCoord.xy/dataSize;vec2 offsetX=vec2(1.0,0.0);vec2 offsetY=vec2(0.0,1.0);float l=smapleVelocity(curlTex,(gl_FragCoord.xy-offsetX)/dataSize,dataSize).x;float r=smapleVelocity(curlTex,(gl_FragCoord.xy+offsetX)/dataSize,dataSize).x;float t=smapleVelocity(curlTex,(gl_FragCoord.xy-offsetY)/dataSize,dataSize).x;float b=smapleVelocity(curlTex,(gl_FragCoord.xy+offsetY)/dataSize,dataSize).x;float c=texture2D(curlTex,uv).x;vec2 force=0.5*vec2(abs(b)-abs(t),abs(r)-abs(l));force/=length(force)+0.0001;force*=1.0*c;force.y*=-1.0;vec4 data=texture2D(dataTex,uv);vec2 pointerUv=uv;pointerUv-=pointerPos;if(screenAspect<1.0){pointerUv.x*=screenAspect;}else{pointerUv.y/=screenAspect;}float pv=length(pointerVec);pv=smoothstep(0.01,1.0,pv);float pointerW=smoothstep(0.01+0.1*min(0.5,pv),0.0,length(pointerUv));vec2 vel=vec2(0.0,0.0);vec2 velPower=pointerVec*30.0;if(screenAspect<1.0){velPower.x/=screenAspect;}else{velPower.y*=screenAspect;}velPower=min(abs(velPower),vec2(2.0))*sign(velPower);vel+=pointerW*velPower;gl_FragColor=vec4(data.xy+vel+force,data.zw);}`;

export const comShaderAdvect =  `
uniform vec2 dataSize;uniform sampler2D dataTex;uniform float velocityAttenuation;uniform float pressureAttenuation;vec2 sampleVelocity(sampler2D tex,vec2 uv,vec2 resolution){vec2 offset=vec2(0.0,0.0);float w=1.0;return w*texture2D(tex,uv+offset/resolution).xy;}float samplePressure(sampler2D tex,vec2 uv,vec2 resolution){vec2 offset=vec2(0.0,0.0);if(uv.x<0.0){offset.x=1.0;}else if(uv.x>1.0){offset.x=-1.0;}if(uv.y<0.0){offset.y=1.0;}else if(uv.y>1.0){offset.y=-1.0;}return texture2D(tex,uv+offset/resolution).z;}void main(){vec2 uv=gl_FragCoord.xy/dataSize;vec2 p=gl_FragCoord.xy-sampleVelocity(dataTex,uv,dataSize);gl_FragColor=vec4(sampleVelocity(dataTex,p/dataSize,dataSize)*velocityAttenuation,samplePressure(dataTex,uv,dataSize)*pressureAttenuation,0.0);}`;

export const comShaderDivergence =  `
uniform vec2 dataSize;uniform sampler2D dataTex;vec2 sampleData(sampler2D tex,vec2 uv,vec2 resolution){vec2 offset=vec2(0.0,0.0);float w=1.0;return w*texture2D(tex,uv+offset/resolution).xy;}void main(){vec4 data=texture2D(dataTex,gl_FragCoord.xy/dataSize);vec2 offsetX=vec2(1.0,0.0);vec2 offsetY=vec2(0.0,1.0);vec2 l=sampleData(dataTex,(gl_FragCoord.xy-offsetX)/dataSize,dataSize);vec2 r=sampleData(dataTex,(gl_FragCoord.xy+offsetX)/dataSize,dataSize);vec2 t=sampleData(dataTex,(gl_FragCoord.xy-offsetY)/dataSize,dataSize);vec2 b=sampleData(dataTex,(gl_FragCoord.xy+offsetY)/dataSize,dataSize);float divergence=((r.x-l.x)+(b.y-t.y))*0.5;gl_FragColor=vec4(data.xyz,divergence);}`;

export const comShaderGradientSubtract =  `
precision mediump float;precision mediump sampler2D;
#define GLSLIFY 1
uniform vec2 dataSize;uniform sampler2D dataTex;float sampleData(sampler2D tex,vec2 uv,vec2 resolution){vec2 offset=vec2(0.0,0.0);return texture2D(tex,uv+offset/resolution).z;}void main(){vec2 uv=gl_FragCoord.xy/dataSize;float l=sampleData(dataTex,(gl_FragCoord.xy-vec2(1.0,0.0))/dataSize,dataSize);float r=sampleData(dataTex,(gl_FragCoord.xy+vec2(1.0,0.0))/dataSize,dataSize);float t=sampleData(dataTex,(gl_FragCoord.xy-vec2(0.0,1.0))/dataSize,dataSize);float b=sampleData(dataTex,(gl_FragCoord.xy+vec2(0.0,1.0))/dataSize,dataSize);vec4 data=texture2D(dataTex,uv);data.xy-=vec2(r-l,b-t);gl_FragColor=data;}`;

export const comShaderCurl =  `
uniform sampler2D dataTex;uniform vec2 dataSize;uniform float curl;vec2 sampleData(sampler2D tex,vec2 uv,vec2 res){vec2 offset=vec2(0.0,0.0);float w=1.0;return w*texture2D(tex,uv+offset/res).xy;}void main(){vec2 uv=gl_FragCoord.xy/dataSize;vec2 offsetX=vec2(1.0,0.0);vec2 offsetY=vec2(0.0,1.0);float l=sampleData(dataTex,(gl_FragCoord.xy-offsetX)/dataSize,dataSize).y;float r=sampleData(dataTex,(gl_FragCoord.xy+offsetX)/dataSize,dataSize).y;float t=sampleData(dataTex,(gl_FragCoord.xy-offsetY)/dataSize,dataSize).x;float b=sampleData(dataTex,(gl_FragCoord.xy+offsetY)/dataSize,dataSize).x;float c=(r-l-b+t);gl_FragColor=vec4(curl*c,0.0,0.0,1.0);}`;

export const comShadePressure =  `
uniform float alpha;uniform float beta;uniform vec2 dataSize;uniform sampler2D dataTex;float sampleData(sampler2D tex,vec2 uv,vec2 resolution){vec2 offset=vec2(0.0,0.0);return texture2D(tex,uv+offset/resolution).z;}void main(){vec4 data=texture2D(dataTex,gl_FragCoord.xy/dataSize);float l=sampleData(dataTex,(gl_FragCoord.xy-vec2(1.0,0.0))/dataSize,dataSize);float r=sampleData(dataTex,(gl_FragCoord.xy+vec2(1.0,0.0))/dataSize,dataSize);float t=sampleData(dataTex,(gl_FragCoord.xy-vec2(0.0,1.0))/dataSize,dataSize);float b=sampleData(dataTex,(gl_FragCoord.xy+vec2(0.0,1.0))/dataSize,dataSize);float divergence=data.w;float pressure=((l+r+t+b)-divergence)*0.25;gl_FragColor=vec4(data.xy,pressure,divergence);}`;

export const planeVert =  `
varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.0);}`;

export const planeFrag =  `
uniform float uTime;uniform float uVisibility;uniform vec2 uResolution;uniform float uAspectRatio;uniform sampler2D uNoiseTex;varying vec2 vUv;float random(vec2 p){return fract(sin(dot(p.xy,vec2(12.9898,78.233)))*43758.5453);}void main(){vec2 uv=vUv;vec2 centeredUv=(uv-0.5)*2.0;if(uAspectRatio>1.0){centeredUv.x*=uAspectRatio;}else{centeredUv.y/=uAspectRatio;}vec4 noise=texture2D(uNoiseTex,uv);vec3 color=vec3(0.0);color.xyz=vec3(noise.x*0.3,noise.y*0.5,noise.z);color.xyz*=smoothstep(1.0,0.1,length(centeredUv))*0.3;color.xyz*=1.0-random(uv)*0.1;gl_FragColor=vec4(color,uVisibility);}`;

export const serviceTitleFrag =  `
uniform sampler2D uServiceTitleTex;uniform sampler2D uPrevTexture;uniform sampler2D uNextTexture;uniform float uTextureBlend;uniform float uHasPrevTexture;uniform float uHasNextTexture;varying vec2 vUv;uniform float uServiceIn;uniform float uThumbnailScroll;uniform float uTime;void main(void){vec2 serviceTitleUv=vUv;serviceTitleUv.y*=4.5;serviceTitleUv.x*=1.1;serviceTitleUv.x+=uThumbnailScroll*0.2+uTime*0.015;serviceTitleUv.x=fract(serviceTitleUv.x)*1.1;serviceTitleUv.y=fract(serviceTitleUv.y);float titleCol=texture2D(uServiceTitleTex,serviceTitleUv).w;titleCol*=mix(0.8,(1.0-vUv.x)*0.0,uServiceIn);vec2 texUv=vUv;texUv.x-=0.5;texUv.x*=0.7;texUv.x+=0.5;vec3 prevTexture=vec3(0.0);vec3 nextTexture=vec3(0.0);if(uHasPrevTexture>0.5){prevTexture=texture2D(uPrevTexture,texUv+vec2(uTextureBlend*0.05,0.0)).rgb;}if(uHasNextTexture>0.5){nextTexture=texture2D(uNextTexture,texUv-vec2((1.0-uTextureBlend)*0.05,0.0)).rgb;}vec3 blendedTexture=mix(prevTexture,nextTexture,uTextureBlend);vec3 col=vec3(0.0);col+=blendedTexture*(1.0-vUv.x)*0.4;col+=titleCol;gl_FragColor=vec4(col,1.0);}`;

export const domMeshVert =  `
varying vec2 vUvMesh;varying vec2 vUv;uniform vec2 screenSpacePos;uniform vec2 screenSpaceSize;uniform float uTexAspect;uniform float uMeshAspect;uniform float uWindowAspect;uniform vec2 uMovement;varying float vMovementPower;varying vec2 vFunya;uniform float uIsLoading;uniform int uLoadingType;
#define LOADING_TYPE_DEFAULT 0
#define LOADING_TYPE_CENTER 1
void main(void){vec3 pos=position;vec2 finalScreenSpaceSize=screenSpaceSize;vUv=uv;vUvMesh=uv;if(uTexAspect>uMeshAspect){vUv-=0.5;vUv.x*=uMeshAspect;vUv.x/=uTexAspect;vUv+=0.5;}else{vUv-=0.5;vUv.y/=uMeshAspect;vUv.y*=uTexAspect;vUv+=0.5;}float loading=uIsLoading;if(loading>0.0){if(uLoadingType==LOADING_TYPE_CENTER){vec2 wideScreenSize=vec2(0.5);if(uWindowAspect<uTexAspect){wideScreenSize.y*=uWindowAspect/uTexAspect;}else{wideScreenSize.x/=uWindowAspect/(uTexAspect);}float wideScreenSizeAspect=wideScreenSize.x/wideScreenSize.y;finalScreenSpaceSize=mix(screenSpaceSize,wideScreenSize,loading);vec2 collectedUv=vUv;collectedUv.x-=0.5;collectedUv.x*=(uMeshAspect/uTexAspect);collectedUv.x*=wideScreenSizeAspect/(uTexAspect/uWindowAspect);collectedUv.x+=0.5;vUv=mix(vUv,collectedUv,loading);}}pos.xy*=finalScreenSpaceSize.xy;float lengthMovement=length(uMovement);vec2 normalizedMovement=lengthMovement>0.0 ? normalize(uMovement): vec2(0.0);vMovementPower=lengthMovement*10.0;vec2 funya=(0.2+length(position.xy)*0.8)*normalizedMovement*vMovementPower*0.1;vFunya=funya;pos.xy-=funya;pos.xy+=screenSpacePos.xy;gl_Position=vec4(pos.xy,0.9,1.0);}`;

export const domMeshFrag =  `
uniform sampler2D uTex;uniform float uVisibility;uniform float uTransition;uniform vec2 screenSpacePos;uniform vec2 screenSpaceSize;uniform float uWindowAspect;uniform vec2 uMovement;varying float vMovementPower;varying vec2 vUv;varying vec2 vUvMesh;varying vec2 vFunya;uniform float uIsLoading;uniform int uLoadingType;
#define LOADING_TYPE_DEFAULT 0
#define LOADING_TYPE_CENTER 1
float sdBox(in vec2 p,in vec2 b){vec2 d=abs(p)-b;return length(max(d,0.0))+min(max(d.x,d.y),0.0);}float opRound(in vec2 p,in float r){return sdBox(p,vec2(0.5))-r;}void main(void){float visibilityInv=1.0-uVisibility;vec2 uv=vUv;vec2 cuv=uv-0.5;vec2 meshCuv=vUvMesh-0.5;uv-=0.5;uv*=0.95-visibilityInv*0.05;uv+=screenSpacePos*0.05;uv+=0.5;vec2 uvOffset=vec2(0.0);uvOffset.x-=vFunya.x*(1.0/screenSpaceSize.x)*length(meshCuv)*0.5;uvOffset.y-=vFunya.y*(1.0/screenSpaceSize.y)*smoothstep(0.0,1.0,length(meshCuv))*0.5;vec4 col=vec4(0.0);col.x=texture2D(uTex,uv+uvOffset*0.5).x;col.y=texture2D(uTex,uv+uvOffset*1.0).y;col.z=texture2D(uTex,uv+uvOffset*1.5).z;col.w=1.0;col.w*=1.0-uTransition;if(uIsLoading>0.0){if(uLoadingType==LOADING_TYPE_CENTER){col.w*=mix(1.0,0.7,uIsLoading);}else{col.w*=mix(1.0,0.7,uIsLoading);}}float radiusEffect=0.2;if(uLoadingType==LOADING_TYPE_CENTER){radiusEffect=0.1;}float meshAspect=screenSpaceSize.x/screenSpaceSize.y;float radius=visibilityInv*0.3;radius+=uIsLoading*radiusEffect;radius+=vMovementPower*0.3;vec2 radiusCuv=meshCuv*2.0;radiusCuv.x*=meshAspect*uWindowAspect;vec2 rectSize=vec2(1.0-radius);rectSize.x*=meshAspect;rectSize.x*=uWindowAspect;if(uIsLoading>0.0&&uLoadingType!=LOADING_TYPE_CENTER){}col.w*=uVisibility;gl_FragColor=col;}`;

export const postVert = quadVert;
