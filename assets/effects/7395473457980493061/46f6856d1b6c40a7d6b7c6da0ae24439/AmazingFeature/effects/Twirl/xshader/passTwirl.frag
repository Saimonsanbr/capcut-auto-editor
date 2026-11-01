precision highp float;
varying highp vec2 uv0;
uniform sampler2D u_albedo;
uniform vec4 u_ScreenParams;
uniform float radius;
uniform float angle;
uniform vec2 center;
uniform float sizeIns_1;
uniform float sizeIns_2;
uniform float centerX;
uniform float centerY;

vec2 flip_uv(vec2 uv)
{
    return abs(mod(uv + 1., 2.) - 1.0);
}
vec4 lm_twirl(sampler2D tex,vec2 uv,vec2 center, float radius,float angle)
{
    vec2 tc=uv;
    tc-=center;
    float ratio = u_ScreenParams.x / u_ScreenParams.y;
    if (ratio < 1.) tc.x *= ratio;
    else tc.y /= ratio;
    float dist=length(tc);
    radius *= mix(1., 1.25, smoothstep(0., .45, 16. / 9. / max(ratio, 1. / ratio) - 1.));
    if(dist<radius)
    {
        float percent= dist / (radius);
        percent = smoothstep(0., 1., percent);
        percent = 1. - percent;
        float theta = percent*radians(angle);
        float s=sin(theta);
        float c=cos(theta);
        
        tc=vec2(dot(tc,vec2(c,-s)),dot(tc,vec2(s,c)));
    }
    if (ratio < 1.) tc.x /= ratio;
    else tc.y *= ratio;
    tc+=center;
    tc=flip_uv(tc);
    vec4 resultColor=texture2D(tex,tc) * step(tc.x, 1.) * step(tc.y, 1.) * step(0., tc.x) * step(0., tc.y);
    return resultColor;
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
    gl_FragColor = lm_twirl(u_albedo, uv0, center, radius / 100., angle*dis);
}
