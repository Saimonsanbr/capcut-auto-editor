precision highp float;

varying vec2 uv;
varying vec2 uRenderSize;
uniform sampler2D inputImageTexture;
//uniform sampler2D inputImageTexture2;
//uniform float uniAlpha;
uniform float uTime;
uniform float slider_value;

// 2D Random
float random (vec2 st) {
    return fract(sin(dot(st.xy,vec2(12.9898,78.233)))* 43758.5453123);
}

float noise (vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

void main() 
{
    float strengthPower = 1.0*slider_value;
    float strength = 16.0 * strengthPower;
    float x = (uv.x + 4.0) * (uv.y + 224.0) * (mod(uTime,10.0)+3.0);
    vec4 grain =vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01) - 0.005) * strength;
    vec4 color1 = texture2D(inputImageTexture,uv);

    vec4 resultColor = color1 + grain;
    resultColor.a = color1.a;
    gl_FragColor = resultColor;
}



// float hash12(vec2 p)
// {
// 	vec3 p3  = fract(vec3(p.xyx) * .1031);
//     p3 += dot(p3, p3.yzx + 33.33);
//     return fract((p3.x + p3.y) * p3.z);
// }
// vec3 hash33(vec3 p3)
// {
// 	p3 = fract(p3 * vec3(.1031, .1030, .0973));
//     p3 += dot(p3, p3.yxz+33.33);
//     return fract((p3.xxy + p3.yxx)*p3.zyx);
// }


// //----------------------------------------------------------------------------------------
// float hashOld12(vec2 p)
// {
// 	return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
// }

// vec3 hashOld33( vec3 p )
// {
// 	p = vec3( dot(p,vec3(127.1,311.7, 74.7)),
// 			  dot(p,vec3(269.5,183.3,246.1)),
// 			  dot(p,vec3(113.5,271.9,124.6)));

// 	return fract(sin(p)*43758.5453123);
// }

// //----------------------------------------------------------------------------------------
// void main()
// {
    
// 	vec2 position = uv;

// 	float a = 0.0, b = a;
//     for (int t = 0; t < 1; t++)
//     {
//         float v = float(t+1)*.152;
//         vec2 pos = (position * v + uTime * 1500. + 50.0);
//         a += hash12(pos);
//     	b += hashOld12(pos);
//     }
//     vec3 col = vec3(mix(b, a, step(uv.x, .5))) / float(1);


//     col = mix(vec3(.4, 0.0, 0.0), col, smoothstep(.5, .495, uv.x) + smoothstep(.5, .505, uv.x));
// 	gl_FragColor = vec4(col, 1.0);
    
// }
