precision highp float;
varying vec2 texCoord;
#define uv0 texCoord

uniform sampler2D inputImageTexture;
#define Img inputImageTexture

uniform int inputHeight;
uniform int inputWidth;

uniform float progress;

float GuassWeight(float dist, float stdDev)
{
    return exp(-dist/(2.0*stdDev*stdDev*100.0));
}

float easeInOutQuint(float t) 
{ 
    return t<0.5 ? 16.0*t*t*t*t*t : 1.0+16.0*(--t)*t*t*t*t; 
}

void main(void)
{
    const int  radius = 15;
    float stepSize = 1.25;
    vec2 uv = uv0;
    vec2 screenSize  = vec2(inputWidth, inputHeight);
    float half_gaussian_weight[radius + 1];       
    vec3 srcTex = texture2D(Img, uv).rgb;
    
    for(int i=0; i<= radius; i++){
        half_gaussian_weight[i] = GuassWeight(float(i), 2.0);
    }


    vec3 sum            = vec3(0.0);
    vec3 result         = vec3(0.0);

    vec2 center = vec2(0.5, 0.5);
    float dis = distance(uv, center);

    // float stepSize = 2.0;
    float TT = easeInOutQuint(progress);
    float iTime = clamp(TT, 0.5, 1.0);
    iTime = (iTime - 0.5)*2.0;
    iTime *= stepSize;
    // float iTime = mod(timer, 1.0)*10.0;

    vec2 unit_uv        = vec2(1.0/screenSize.x,1.0/screenSize.y)*stepSize*(stepSize - iTime);

    vec3 centerPixel    = texture2D(Img, uv).rgb*half_gaussian_weight[0];
    float  sum_weight   = half_gaussian_weight[0];
    
    //vertical
    for(int i=radius;i>=1;i--)
    // for(int i=1;i<=radius;i++)
    {
        vec2 curBottomCoordinate    = uv+vec2(float(i), 0.0)*unit_uv;
        vec2 curTopCoordinate       = uv+vec2(float(-i), 0.0)*unit_uv;
        sum+=texture2D(Img,curBottomCoordinate).rgb*half_gaussian_weight[i];
        sum+=texture2D(Img,curTopCoordinate).rgb*half_gaussian_weight[i];
        sum_weight+=half_gaussian_weight[i]*2.0;
    }
    result = (sum+centerPixel)/sum_weight;

    // if(iTime > 9.0){
    //     result = texture2D(Img, uv).rgb;
    // }
    
    gl_FragColor = vec4(vec3(result), 1.0);
}
// DO_NOT_PATCH_ME