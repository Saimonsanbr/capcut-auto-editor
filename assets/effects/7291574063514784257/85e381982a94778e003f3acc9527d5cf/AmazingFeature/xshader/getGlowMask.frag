precision highp float;

uniform sampler2D inputImageTexture;
varying vec2 uv;
uniform sampler2D filterTex;


vec4 takeEffectFilter(sampler2D myfilter,vec4 inputColor,float how)
{

    highp float blueColor=inputColor.b*63.;

    highp vec2 quad1;
    quad1.y=floor(floor(blueColor)/8.);
    quad1.x=floor(blueColor)-(quad1.y*8.);

    highp vec2 quad2;
    quad2.y=floor(ceil(blueColor)/8.);
    quad2.x=ceil(blueColor)-(quad2.y*8.);

    highp vec2 texPos1;
    texPos1.x=(quad1.x*1./8.)+.5/512.+((1./8.-1./512.)*inputColor.r);
    texPos1.y=(quad1.y*1./8.)+.5/512.+((1./8.-1./512.)*inputColor.g);

    highp vec2 texPos2;
    texPos2.x=(quad2.x*1./8.)+.5/512.+((1./8.-1./512.)*inputColor.r);
    texPos2.y=(quad2.y*1./8.)+.5/512.+((1./8.-1./512.)*inputColor.g);

    lowp vec4 newColor1=texture2D(myfilter,texPos1);
    lowp vec4 newColor2=texture2D(myfilter,texPos2);
    lowp vec4 newColor=mix(newColor1,newColor2,fract(blueColor));
    newColor = mix(inputColor,vec4(newColor.rgb,inputColor.w),how);
    return newColor;

}
void main()
{
    vec4 col = texture2D(inputImageTexture, uv);
    vec4 maskCol = takeEffectFilter(filterTex,col,1.0);
    gl_FragColor = maskCol;
}
