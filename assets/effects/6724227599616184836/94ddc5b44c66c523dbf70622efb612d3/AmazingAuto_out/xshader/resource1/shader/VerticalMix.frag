precision highp float;
varying vec2 texCoord;
#define uv0 texCoord

uniform int inputHeight;
uniform int inputWidth;

uniform sampler2D TexA;
uniform sampler2D TexB;

uniform float progress;

// vec2 direction = vec2(0.0, 1.0);

void main(void)
{
//     vec2 uv = uv0;
//     // uv.y = 1.0 - uv.y;
// //    float iTime = mod(timer, 4.0);
    float iTime = clamp(progress, 0.0, 1.0);
//     vec2 p = uv + (1.0 - iTime)*sign(direction);
    // vec2 f = fract(p);
    vec4 from = vec4(0.0);
    vec4 to = vec4(0.0);
    from = texture2D(TexA, uv0);
    to = texture2D(TexB, uv0);

    if(iTime <= 0.50){
        gl_FragColor = from;
    }else{
        gl_FragColor = to;
    }

// gl_FragColor = from;
    // vec4 res = mix(from, to, step(0.0, p.y)*step(p.y, 1.0)*step(0.0, p.x)*step(p.x, 1.0));
    gl_FragColor.a = 1.0;
//    fragColor = texture(prevPass,inData.v_texcoord);
}

// DO_NOT_PATCH_ME