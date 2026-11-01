precision highp float;
varying highp vec2 uv0;
uniform sampler2D u_InputTex;
uniform vec2 u_Center;
uniform vec4 u_ScreenParams;
uniform float u_Amount;
uniform float u_Quality;
float normpdf(in float x, in float sigma)
{
	return 0.39894*exp(-0.5*x*x/(sigma*sigma))/sigma;
}
void main()
{
    const int SAMPLES = 32;
    float quality = clamp(u_Quality * 0.01, 0.1, 1.0) * 12.0;
    float amount = u_Amount * u_ScreenParams.x / 720.0;
    vec2 uv = uv0;
    vec2 dir = normalize(uv - u_Center);
    float x = length(uv - u_Center);
    dir = dir / u_ScreenParams.x * 8.0 * sign(amount) / quality;
    float sigma = (abs(amount) * 0.2 * quality + 1.0) * x;
    float weight = normpdf(0.0, sigma);
    vec4  res = texture2D(u_InputTex, uv) * weight;
    float sumWeight = weight;
    float s = (quality * abs(amount) * 0.5 + 1.0) * x;
    for (float i = 1.0; i < 1000.0; i += 1.0)
    {
        if (i >= s) break;
        weight = normpdf(float(i), sigma);
        vec4 tmp = (texture2D(u_InputTex, uv - float(i) * dir)) * weight;
        res += tmp;
        sumWeight += weight;
    }
    gl_FragColor = vec4(res / sumWeight);
}
