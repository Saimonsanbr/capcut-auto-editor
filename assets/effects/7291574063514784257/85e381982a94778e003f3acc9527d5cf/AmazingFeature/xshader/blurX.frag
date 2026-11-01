precision highp float;

uniform sampler2D inputImageTexture;
varying vec2 uv;
uniform vec4 u_ScreenParams;
uniform float blurSize;


float normpdf(in float x, in float sigma)
{
	return 0.39894*exp(-0.5*x*x/(sigma*sigma))/sigma;
}
float mirror(float x){
    return abs(mod(x-1.0,2.0)-1.0);
}
vec2 mirror(vec2 uv){
    return vec2(mirror(uv.x),mirror(uv.y));
}
void main()
{
    vec2 mySize = u_ScreenParams.xy/min(u_ScreenParams.x,u_ScreenParams.y)*1080.;
    vec2 offset = vec2(blurSize,0)/mySize;
    float weight0 = normpdf(0.,5.);
    vec4 col = texture2D(inputImageTexture,uv)*weight0;
    float sunWeight = weight0;
    for(int i =1;i<=10;i++){
        float j =float(i);
        float tempWeight = normpdf(j,5.);
        col+=tempWeight*texture2D(inputImageTexture,mirror(uv+offset*j));
        col+=tempWeight*texture2D(inputImageTexture,mirror(uv-offset*j));
        
        sunWeight+=2.*tempWeight;
    }
    col/=sunWeight;
    gl_FragColor = col;
}
