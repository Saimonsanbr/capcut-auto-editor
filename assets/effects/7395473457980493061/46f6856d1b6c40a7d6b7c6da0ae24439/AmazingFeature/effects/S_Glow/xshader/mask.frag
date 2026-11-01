precision highp float;
uniform sampler2D inputTexture;
uniform vec3 color;
uniform float threshold;
uniform float glowFromAlpha;
varying highp vec2 uv0;

#define EPSILON 0.000001

/*
float sigmoid(float x, float k, float c)
{
    return 1.0 / (1.0 + exp(-k * (x - c)));
}
*/

float smooth(float x, float th)
{
    return x <= th ? 0.0 : (x - th) / (1.0 - th);
}

void main()
{
    vec4 inputColor = texture2D(inputTexture, uv0);
    inputColor.rgb /= (inputColor.a+0.0001);

    inputColor.rgb = mix(inputColor.rgb, vec3(1.0), glowFromAlpha);

    // float luminance = dot(inputColor.rgb, vec3(0.299, 0.587, 0.114));
    // float brightness = sigmoid(luminance, 10.0, threshold * 1.1);
    // float brightness = smoothstep(-0.1, 0.1, luminance - (threshold));
    float r = smooth(inputColor.r, threshold + color.r);
    float g = smooth(inputColor.g, threshold + color.g);
    float b = smooth(inputColor.b, threshold + color.b);
    float a = smooth(inputColor.a, threshold);
    float brightness = (r + g + b) / max(inputColor.r + inputColor.g + inputColor.b, EPSILON);
    gl_FragColor = vec4(inputColor.rgb * brightness, 1.0) * a;
}
