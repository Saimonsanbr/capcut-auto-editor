precision highp float;

uniform sampler2D inputImageTexture;
uniform float offset_x;
uniform float offset_y;
uniform vec4 u_ScreenParams;
varying vec2 texCoordinate;
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
    vec4 resultColor = vec4(1.0);

    vec2 distortionCoord_1[3];
    vec2 coord_map;
    
    coord_map.x = texCoordinate.x;
    coord_map.y = texCoordinate.y;
    vec3 refraction_1_x = vec3( 1.0-offset_x*dis*(1.0-coord_map.x), 1.0, 1.0+offset_x*dis*(1.0-coord_map.x));
    vec3 refraction_1_y = vec3( 1.0-offset_y*dis*(1.0-coord_map.y), 1.0, 1.0+offset_y*dis*(1.0-coord_map.y));
    
    distortionCoord_1[0][0] = refraction_1_x[0]*coord_map.x;
    distortionCoord_1[0][1] = refraction_1_y[0]*coord_map.y;
    distortionCoord_1[1][0] = refraction_1_x[1]*coord_map.x;
    distortionCoord_1[1][1] = refraction_1_y[1]*coord_map.y;
    distortionCoord_1[2][0] = refraction_1_x[2]*coord_map.x;
    distortionCoord_1[2][1] = refraction_1_y[2]*coord_map.y;
    vec4 color_b = texture2D(inputImageTexture,distortionCoord_1[0]);
    resultColor.b = color_b.b;
    vec4 color_g = texture2D(inputImageTexture,distortionCoord_1[1]);
    resultColor.g = color_g.g;
    vec4 color_r = texture2D(inputImageTexture,distortionCoord_1[2]);
    resultColor.r = color_r.r;
    resultColor.a = (color_b.a+color_g.a+color_r.a)*0.333333;
    resultColor.rgb = clamp(resultColor.rgb, vec3(0.0), vec3(resultColor.a));

    resultColor.rgb = clamp(resultColor.rgb, 0.0, resultColor.a);
    gl_FragColor = resultColor;
    // gl_FragColor = clamp(gl_FragColor, 0.0, gl_FragColor.a);
}