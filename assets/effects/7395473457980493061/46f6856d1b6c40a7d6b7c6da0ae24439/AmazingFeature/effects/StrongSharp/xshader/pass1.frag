precision highp float;
uniform sampler2D inputImageTexture1;
uniform sampler2D inputImageTexture2;
uniform float strength;
uniform float inputScale;
varying vec2 texCoordinate;
uniform vec4 u_ScreenParams;
uniform float sizeIns_1;
uniform float sizeIns_2;
uniform float centerX;
uniform float centerY;

void main() {
    vec2 disUV = texCoordinate-vec2(centerX,centerY);
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

    vec4 raw_color = texture2D(inputImageTexture1, texCoordinate);
    vec4 blur_color = texture2D(inputImageTexture2, texCoordinate);
    float strengthScale = strength*dis;
    strengthScale = strengthScale*inputScale;
    vec4 resultColor = vec4(raw_color.rgb + (raw_color.rgb - blur_color.rgb) * strengthScale , raw_color.a);
    gl_FragColor = resultColor;
}