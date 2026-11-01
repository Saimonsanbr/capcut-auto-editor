precision highp float;
uniform sampler2D inputTexture;
uniform vec4 u_ScreenParams;
uniform vec3 ColorRadius;
uniform vec3 ColorSigma;
uniform float MaxRadius;
uniform int edgeMode;
varying highp vec2 uv0;

vec2 vec4ToVec2(vec4 val)
{
    float a = val.x + val.y / 255.0;
    float b = val.z + val.w / 255.0;
    return vec2(a, b);
}

vec4 vec2ToVec4(vec2 val)
{
    float a = floor(val.x * 255.0) / 255.0;
    float b = fract(val.x * 255.0);
    float c = floor(val.y * 255.0) / 255.0;
    float d = fract(val.y * 255.0);
    return vec4(a, b, c, d);
}

vec2 getS(float a, float b)
{
    vec2 s = vec2(1.0);
    if (edgeMode == 0)
    {
        s.x = step(0.0, a) * step(a, 1.0);
        s.y = step(0.0, b) * step(b, 1.0);
    }
    return s;
}

vec4 neighborColor(float i)
{
    vec2 unit = 1.0 / u_ScreenParams.xy;
#ifdef AE_HORZ
    vec2 uv1 = uv0 + unit * vec2(i, 0.);
    vec2 uv2 = uv0 - unit * vec2(i, 0.);
    vec2 s = getS(uv1.x, uv2.x);
    return texture2D(inputTexture, uv1) * s.x + texture2D(inputTexture, uv2) * s.y;
#else
    vec2 uv1 = uv0 + unit * vec2(0., i);
    vec2 uv2 = uv0 - unit * vec2(0., i);
    vec2 s = getS(uv1.y, uv2.y);
    return vec4(vec4ToVec2(texture2D(inputTexture, uv1)),0.0,0.0) * s.x 
            + vec4(vec4ToVec2(texture2D(inputTexture, uv2)),0.0,0.0) * s.y;
#endif

}

float Gaussian(float x, float sigmaSquare)
{
    return exp(-(x * x) / sigmaSquare);
}

#define ITERATIONS 1024.0
vec4 blurColor(vec4 color)
{
    vec4 weight = vec4(1.0);
    vec4 w = vec4(0.0);
    bool loopFlag = true;
    float maxR = max(max(ColorRadius.r, ColorRadius.g), ColorRadius.b);
    float stepI = max(1.0, maxR / MaxRadius);
    float i = 1.0;
    for (float j = 1.0; j <= ITERATIONS; j += 1.0)
    {
        if (i > ITERATIONS) break;
        loopFlag = i <= ColorRadius.r || i <= ColorRadius.g || i <= ColorRadius.b;
        if (i > MaxRadius*stepI || !loopFlag)
        {
            break;
        }
        w.r = step(i, ColorRadius.r) * Gaussian(float(i), ColorSigma.r);
        w.g = step(i, ColorRadius.g) * Gaussian(float(i), ColorSigma.g);
        w.b = step(i, ColorRadius.b) * Gaussian(float(i), ColorSigma.b);
        color += neighborColor(i) * w;
        weight += w * 2.;

        i += stepI;
    }
    color /= weight;
    return color;
}

void main()
{
#ifdef AE_HORZ
    vec4 curColor = texture2D(inputTexture, uv0);
#else
    vec4 curColor = vec4(0.0);
    curColor.rg = vec4ToVec2(texture2D(inputTexture, uv0));
#endif
    gl_FragColor = vec2ToVec4(blurColor(curColor).rg);
}
