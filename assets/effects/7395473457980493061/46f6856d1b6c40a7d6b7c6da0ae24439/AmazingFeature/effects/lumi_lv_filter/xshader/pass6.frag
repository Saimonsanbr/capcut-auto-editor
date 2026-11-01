precision highp float;
varying vec2 uv0;
varying vec2 uv1;
uniform float uniAlpha;
uniform sampler2D inputImageTexture;
uniform sampler2D inputImageTexture2;
uniform float flipY;

vec4 getColor(sampler2D filterTex, vec2 uv)
{
  if (flipY > 0.5)
  {
    return texture2D(filterTex, vec2(uv.x, 1.0 - uv.y));
  }
  else
  {
    return texture2D(filterTex, uv);
  } 
}

vec4 lm_take_effect_filter(sampler2D filterTex,vec4 inputColor,float uniAlpha)
{
  highp vec4 textureColor= inputColor;	
  highp float blueColor=textureColor.b*63.;
  
  highp vec2 quad1;
  quad1.y=floor(floor(blueColor)/8.);
  quad1.x=floor(blueColor)-(quad1.y*8.);
  
  highp vec2 quad2;
  quad2.y=floor(ceil(blueColor)/8.);
  quad2.x=ceil(blueColor)-(quad2.y*8.);
  
  highp vec2 texPos1;
  texPos1.x=(quad1.x*1./8.)+.5/512.+((1./8.-1./512.)*textureColor.r);
  texPos1.y=(quad1.y*1./8.)+.5/512.+((1./8.-1./512.)*textureColor.g);
  
  highp vec2 texPos2;
  texPos2.x=(quad2.x*1./8.)+.5/512.+((1./8.-1./512.)*textureColor.r);
  texPos2.y=(quad2.y*1./8.)+.5/512.+((1./8.-1./512.)*textureColor.g);
  
  vec4 newColor1=getColor(filterTex,texPos1);
  vec4 newColor2=getColor(filterTex,texPos2);
  vec4 newColor=mix(newColor1,newColor2,fract(blueColor));
  newColor = mix(textureColor,vec4(newColor.rgb,textureColor.w),uniAlpha);

  return newColor;
}

void main()
{
  if (uniAlpha < 0.01)
  {
    gl_FragColor = texture2D(inputImageTexture,uv0);
    return;
  }
  else
  {
    vec4 curColor = texture2D(inputImageTexture,uv0);
    vec4 resultColor = lm_take_effect_filter(inputImageTexture2,curColor,uniAlpha);
    resultColor.rgb = mix(curColor.rgb, resultColor.rgb, curColor.a);
    resultColor.a = curColor.a;
    gl_FragColor = resultColor;
  }
}