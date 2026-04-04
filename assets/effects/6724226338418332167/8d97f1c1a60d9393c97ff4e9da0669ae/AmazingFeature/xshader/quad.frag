precision lowp float;
varying highp vec2 uv0;
uniform sampler2D u_albedo;

uniform int inputHeight;
uniform int inputWidth;

uniform float progress;

uniform sampler2D inputImageTexture;
uniform sampler2D inputImageTexture2;

uniform float zoom_quickness;

#define EPSILON 0.000001   
vec2 zoomNear(vec2 uv, float amount){
    vec2 UV = vec2(0.0);
    if(amount < 0.5-EPSILON){       //correct critical precision
        UV = 0.5 + ((uv - 0.5)*(1.0 + amount));
    }else{
        UV = 0.5 + ((uv - 0.5)*(amount));
    }
    return UV;
}

vec3 blur(sampler2D Tex, vec2 uv, float iTime, float pixelStep){
    
    vec2 dir = uv - 0.5;//方向
    // float dist = length(dir);
    // dir = normalize(dir);//单位向量
    vec3 color = vec3(0.0);
    const int len = 10;
    for(int i= -len; i <= len; i++){
        vec2 blurCoord = uv + pixelStep*float(i)*dir*2.0*iTime;
        blurCoord = abs(blurCoord);
        if(blurCoord.x > 1.0){
            blurCoord.x = 2.0 - blurCoord.x;
        }
        if(blurCoord.y > 1.0){
            blurCoord.y = 2.0 - blurCoord.y;
        }
        color += texture2D(Tex, blurCoord).rgb;
    }
    color /= float(2*len+1);
    return color;
}
float easeInOutQuint(float t) 
{ 
    return t<0.5 ? 16.0*t*t*t*t*t : 1.0+16.0*(--t)*t*t*t*t; 
} 
void main()
{
    // gl_FragColor = texture2D(u_albedo, uv0);

    float pixelStep = 10.0/float(inputWidth)*0.5;
    float TT = easeInOutQuint(progress);
	// float progress = clamp(TT, 0.0, 1.0);
    // float progress = mod(timer, 4.0);

    // float nQuick = clamp(zoom_quickness, 0.0, 1.0);
    vec2 uv1 = zoomNear(uv0, TT);
    
    if(TT <= 0.5){
        vec3 colorA = blur(inputImageTexture, uv1, TT, pixelStep).rgb;
        gl_FragColor = vec4(colorA, 1.0);
    }else{
        vec3 colorB = blur(inputImageTexture2, uv1, 1.0 - TT, pixelStep).rgb;
        gl_FragColor = vec4(colorB, 1.0);
    }
}

