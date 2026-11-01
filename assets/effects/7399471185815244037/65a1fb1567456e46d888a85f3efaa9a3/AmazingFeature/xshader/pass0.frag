precision highp float;
varying vec2 uv0;

uniform sampler2D inputImageTexture;

uniform float time;

uniform float count;    //[0~1]
uniform float noiseAmount;  //[0~2]
uniform float linesAmount;  //[0~2]
uniform float height;
uniform float intensity;

#define PI 3.14159265359

highp float rand( vec2 uv)
{
    const float a=12.9898;
    const float b=78.233;
    const float c=43758.5453;
    float dt=dot(uv.xy,vec2(a,b));
    float sn=mod(dt,PI);
    return fract(sin(sn)*c);
}

vec4 scanlines()
{
    vec2 vUv=uv0;
    vec4 cTextureScreen=texture2D(inputImageTexture,vUv) * (1. + intensity);
    float dx=rand(vUv+time);
    vec3 cResult=cTextureScreen.rgb*dx*noiseAmount;
    float lineAmount=height*1.8*count;
    vec2 sc=vec2(sin(vUv.y*lineAmount),cos(vUv.y*lineAmount));
    cResult+=cTextureScreen.rgb*vec3(sc.x,sc.y,sc.x)*linesAmount;
    cResult=cTextureScreen.rgb+(cResult);
    vec4 resultColor=vec4(cResult,cTextureScreen.a);
    // resultColor.a = 1.0;
    return resultColor;
}

void main(void)
{
    vec4 curColor=texture2D(inputImageTexture,uv0);
    vec4 resultColor=scanlines();
    
    gl_FragColor=resultColor;
}
