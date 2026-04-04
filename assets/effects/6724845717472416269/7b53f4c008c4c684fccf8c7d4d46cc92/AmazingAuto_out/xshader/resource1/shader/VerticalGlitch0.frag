precision mediump float;
varying highp vec2 texCoord;
#define textureCoordinate texCoord

uniform sampler2D inputImageTexture;
uniform sampler2D inputImageTexture2;

uniform lowp float progress;

void main() {
    
    lowp vec4 basicLayerPixelValue   = texture2D(inputImageTexture, textureCoordinate);
    lowp vec4 blendLayerPixelValue   = texture2D(inputImageTexture2, textureCoordinate);
    lowp vec4 result                 = mix(basicLayerPixelValue,blendLayerPixelValue,progress);
    gl_FragColor                     = vec4(result.rgb,1.0);
}
// DO_NOT_PATCH_ME