precision highp float;
varying vec2 texCoord;
#define uv0 texCoord

uniform sampler2D inputImageTexture2;

uniform float progress;

float easeInOutQuint(float t) 
{ 
    return t<0.5 ? 16.0*t*t*t*t*t : 1.0+16.0*(--t)*t*t*t*t; 
}

void main(void)
{
    vec2 uv1 = uv0;
    float TT = easeInOutQuint(progress);
    float iTime = clamp(TT, 0.5, 1.0);
    // float iTime = mod(timer, 1.0);
    vec4 from = vec4(0.0);
//    vec4 to = vec4(0.0);
    iTime = (iTime - 0.5)*2.0;
    
    if(uv0.x < iTime){
        uv1.x = iTime - uv0.x;
    }else{
        uv1.x = uv0.x - iTime;
    }
    uv1.x = 1.0 - uv1.x;
    from = texture2D(inputImageTexture2, uv1);

    gl_FragColor = from;
}

// DO_NOT_PATCH_ME