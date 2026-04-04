precision highp float;

varying vec2 uv;
uniform sampler2D inputImageTexture;
uniform sampler2D inputImageTextureBlend_9_16;
uniform sampler2D inputImageTextureBlend_16_9;
uniform sampler2D inputImageTextureBlend_3_4;
uniform sampler2D inputImageTextureBlend_4_3;
uniform sampler2D inputImageTextureBlend_1_1;

uniform int baseTexWidth;
uniform int baseTexHeight;
uniform float effects_adjust_texture;

#define RESULT_14_DEVIDE_9     1.55556
#define RESULT_10_DEVIDE_9     1.11111
#define RESULT_8_DEVIDE_9      0.88889
#define RESULT_10_DEVIDE_16    0.625     
void main() 
{

    lowp vec4 color1 = texture2D(inputImageTexture,uv);

    //blend 
    lowp vec4 blendColor = color1;
    float aspectRatio = float(baseTexHeight)/float(baseTexWidth);

    if(aspectRatio > RESULT_14_DEVIDE_9)
        blendColor = texture2D(inputImageTextureBlend_9_16,uv);
    else if (aspectRatio > RESULT_10_DEVIDE_9) 
        blendColor = texture2D(inputImageTextureBlend_3_4,uv);
    else if (aspectRatio > RESULT_8_DEVIDE_9) 
        blendColor = texture2D(inputImageTextureBlend_1_1,uv);
    else if (aspectRatio > RESULT_10_DEVIDE_16) 
        blendColor = texture2D(inputImageTextureBlend_4_3,uv);
    else
        blendColor = texture2D(inputImageTextureBlend_16_9,uv);

    lowp vec4 resultColor = mix(color1,blendColor,blendColor.a*effects_adjust_texture);

    gl_FragColor = vec4(resultColor.rgb,1.0);
}

