precision highp float;
varying vec2 uv;

uniform sampler2D inputImageTexture;

uniform int baseTexWidth;
uniform int baseTexHeight;
uniform float value;
uniform float radius;

void main(void) 
{
    float ratio = float(float(baseTexWidth) / float(baseTexHeight));

    vec2 uv2 = uv;
    vec2 uv3 = uv;
	uv3 -= .5;
	vec2 scale = vec2(1, 1);
	if (ratio < 1.) {
		scale.x *= ratio;
	} else {
		scale.y /= ratio;
	}
	uv3 *= scale;
	uv3 += .5;

	vec2 center = vec2(.5, .5);
	vec2 d = uv3 - center;
    float r0 = sqrt(dot(center, center));
	float r = sqrt(dot(d, d));

	float power = (2.0 * 3.141592 / (2.0 * r0)) * (value - 0.5);

	float bind = mix(r0, mix(center.x, center.y, step(1., ratio)), step(power, 0.));

	if (power > 0.0) {
        uv2 = center + mix(normalize(d) * tan(r * power) * bind / tan(bind * power), d, smoothstep(0., radius, r)) * (1. / scale);
    } else if (power < 0.0) {
		uv2 = center + mix(normalize(d) * atan(r * -power * 10.0) * bind / atan(-power * bind * 10.0), d, smoothstep(0., radius, r)) * (1. / scale);
    }

	// uv2 -= .5;
	// float d = length(uv2);
    // float z = sqrt(pow(radius, 2.) - d * d);
    // float r = atan(d, z) / (3.14159 * .5);
    // float phi = atan(uv2.y, uv2.x);
	// float mask = 1. - step(radius, d);
    // uv2 = mix(uv2, vec2(r * cos(phi), r * sin(phi)) * radius, mask) + .5;

	vec4 col = texture2D(inputImageTexture, uv2);
	gl_FragColor = col;
}
