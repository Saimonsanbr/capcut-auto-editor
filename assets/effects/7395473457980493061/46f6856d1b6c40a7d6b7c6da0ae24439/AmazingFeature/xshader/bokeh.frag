precision highp float;
varying highp vec2 uv0;
uniform sampler2D u_albedo;
// uniform sampler2D blingTex;
uniform sampler2D colorTex;
uniform vec4 u_ScreenParams;
uniform float blurIntensity;
uniform float timeIntensity;
// uniform float colorIntensity;
uniform float lightIns;
uniform float sizeIns_1;
uniform float sizeIns_2;

uniform float centerX;
uniform float centerY;

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z +  (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

#define PI 3.1415926

vec2 rot(float angle, vec2 uv)
{
    float theta = angle * PI / 180.;
    mat2 r = mat2(cos(theta), -sin(theta), sin(theta), cos(theta));
    return uv * r;
}

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(62.9898,78.233)))*
        437598.5453123);
}

float noise(vec2 st) {
    vec2 pi = floor(st);
    vec2 pf = fract(st);

    // Four corners in 2D of a tile
    float a = random(pi);
    float b = random(pi + vec2(1.0, 0.0));
    float c = random(pi + vec2(0.0, 1.0));
    float d = random(pi + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 w = pf*pf*(3.0-2.0*pf);
    // w = smoothstep(0.,1.,pf);

    // Mix 4 coorners percentages
    return mix(a, b, w.x) +
            (c - a)* w.y * (1.0 - w.x) +
            (d - b) * w.x * w.y;
}

float noise_sum(vec2 p)
{
    float pf = 0.0;
    p = p * 4.0;
    pf += 1.0000 * noise(p); p = 2.0 * p;
    pf += 0.5000 * noise(p); p = 2.0 * p;
    pf += 0.2500 * noise(p); p = 2.0 * p;
    pf += 0.1250 * noise(p); p = 2.0 * p;
    // pf += 0.0625 * noise(p); p = 2.0 * p;

    return pf / 1.875;
    return pf / 1.9375;
}

float hash21(vec2 p){
    vec3 p3 = fract(p.yxy*234.5);
    p3+=dot(p3,p3.yzx+15.4);
    return fract((p3.x+p3.y)*p3.z);
}

void main()
{
    vec2 disUV = uv0-vec2(centerX,centerY);
    if(u_ScreenParams.x<u_ScreenParams.y){
        disUV.x*=u_ScreenParams.x/u_ScreenParams.y;
    }
    else
    {
        disUV.y*=u_ScreenParams.y/u_ScreenParams.x;
    }
    disUV.y/=mix(1.,1.3,step(0.,disUV.y));
    float dis = length(disUV);
    dis = smoothstep(sizeIns_1,sizeIns_2,dis);
    float amount = 40.0;
    amount += 0.9987*500.0;
    vec4 curColor = texture2D(u_albedo, uv0);
	vec2 screenSize = u_ScreenParams.xy;
	float rescale = min(screenSize.x, screenSize.y) / 720.;
	screenSize /= rescale;
	vec2 unit = 1. / screenSize * .5;
    vec4 resultColor=curColor; 
	vec3 maxColor = vec3(0.);//curColor.rgb;
	vec3 sumWeight = vec3(0.);//pow(curColor.rgb, vec3(9.));
	vec3 sumColor = resultColor.rgb * sumWeight;
	for (float i = -9.; i <= 9.; i += 4.0) {
		for (float j = -9.; j <= 9.; j += 4.0) {
            if(timeIntensity<0.01) break;
			vec2 tempVec = vec2(i, j);
			if (dot(tempVec, tempVec) >= 50.) continue;
            vec3 factor = vec3(1.);
            vec2 newUv = vec2(i + 9., j + 9.) / 18.;
            float alpha = 1.;//texture2D(blingTex, newUv).a;
            vec2 tempUv = uv0 + blurIntensity * timeIntensity*dis  * vec2(i, j) * unit;
            vec2 tempUv1 = uv0 + blurIntensity * timeIntensity*dis  * vec2(i, j) * unit * 1.7;
            // vec4 blingColor = vec4(1.);
            // factor = mix(vec3(1.), blingColor.rgb, pow(blurIntensity / 10., 1.) * colorIntensity * (1. - pow(1. - timeIntensity, 3.)));
			vec3 tempColor = texture2D(u_albedo, tempUv).rgb;
			maxColor = max(maxColor, tempColor * factor);
			sumColor += tempColor * (pow(tempColor * factor, vec3(9.)) * amount + .4);
			sumWeight+= pow(tempColor * factor, vec3(9.)) * amount + .4;
		}
	}

    for (float i = 0.; i <= 360.; i += 15.) {
        if(timeIntensity<0.01) break;
        vec2 tempVec = rot(i, vec2(7., 0.));
        vec3 factor = vec3(1.);
        // vec2 newUV = (tempVec + 9.) / 18.;
        float alpha = 1.;
        vec2 tempUv = uv0 + blurIntensity * timeIntensity*dis  * tempVec * unit;
        vec2 tempUv1 = uv0 + blurIntensity * timeIntensity*dis  * tempVec * unit * 1.7;
        // vec4 blingColor = vec4(1.);
        // factor = mix(vec3(1.), blingColor.rgb, pow(blurIntensity / 10., 1.) * colorIntensity * (1. - pow(1. - timeIntensity, 3.)));
        vec3 tempColor = texture2D(u_albedo, tempUv).rgb;
        maxColor = max(maxColor, tempColor * factor);
        sumColor += tempColor * (pow(tempColor * factor, vec3(9.)) * amount + .4);
		sumWeight+= pow(tempColor * factor, vec3(9.)) * amount + .4;
    }
	resultColor.rgb = clamp(sumColor / sumWeight, 0., 1.);
	resultColor.rgb = mix(resultColor.rgb, maxColor, clamp(resultColor.rgb * lightIns, 0., 1.));
    if(timeIntensity<0.01)
        resultColor=curColor; 
    gl_FragColor = resultColor;
}
