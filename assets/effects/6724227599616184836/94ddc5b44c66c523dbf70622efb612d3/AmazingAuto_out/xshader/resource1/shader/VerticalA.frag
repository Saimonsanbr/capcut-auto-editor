precision highp float;
varying vec2 texCoord;
#define uv0 texCoord


uniform sampler2D inputImageTexture;

uniform float progress;

float easeInOutQuint(float t) 
{ 
    return t<0.5 ? 16.0*t*t*t*t*t : 1.0+16.0*(--t)*t*t*t*t; 
}

void main(void)
{
    float TT = easeInOutQuint(progress);
    float iTime = clamp(TT*2.0, 0.0, 1.0);
    // float iTime = mod(timer, 1.0);
    vec4 from = vec4(0.0);
    
    vec2 uv = uv0;
    if(uv0.x <= iTime){
        uv.x = iTime - uv0.x;
    }else{
        uv.x = uv0.x - iTime;
    }
    from = texture2D(inputImageTexture, uv);

    gl_FragColor = from;
}

// DO_NOT_PATCH_ME