precision highp float;
varying highp vec2 uv0;
uniform sampler2D u_InputTex;
uniform float u_Convergence;
uniform float u_Radius;
uniform vec2 u_Center;
uniform float sizeIns_1;
uniform float sizeIns_2;
uniform vec4 u_ScreenParams;
uniform float centerX;
uniform float centerY;

vec2 uvProtect(vec2 uv)
{
    return step(vec2(0.0), uv) * step(uv, vec2(1.0));
}

vec3 barrel(vec2 uv, float radius, float convergence)
{
    vec2 distortionCenter = u_Center;
    vec2 tuv = (uv - distortionCenter);
    tuv.x *= u_ScreenParams.x / u_ScreenParams.y;
    float distortion_k1 = -convergence * 203.0875 / pow(radius, 2.0);
    float distortion_k2 = 0.0;
    float rr = length(tuv);
    float r2 = rr * (1.0 + distortion_k1 * (rr * rr) + distortion_k2 * (rr * rr * rr));
    float theta = atan(tuv.x, tuv.y);
    float distortion_x = sin(theta) * r2 * 1.0;
    float distortion_y = cos(theta) * r2 * 1.0;
    vec2 dest_uv = vec2(distortion_x, distortion_y);
    dest_uv.x *= u_ScreenParams.y / u_ScreenParams.x;
    dest_uv += distortionCenter;
    return vec3(dest_uv, rr);
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
    vec2 uv = uv0;
    float r = u_Radius * pow(1.6, u_ScreenParams.x / u_ScreenParams.y - 1.0);
    vec3 x = barrel(uv0, r, u_Convergence*dis);
    uv = x.xy;
    vec2 uvp = uvProtect(uv);
    gl_FragColor = texture2D(u_InputTex, uv) * uvp.x * uvp.y * smoothstep(r * 0.007 + 0.001, r * 0.007 - 0.001, x.z);
}
