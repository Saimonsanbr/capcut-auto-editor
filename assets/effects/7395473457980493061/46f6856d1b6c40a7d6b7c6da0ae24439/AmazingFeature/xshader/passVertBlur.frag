precision highp float;

uniform sampler2D inputTexture;
uniform sampler2D inputImageTexture;
varying vec2 uv;


uniform float timeIntensity;
uniform float vertR;
uniform float numIntensity;
uniform float blurIns;
uniform float filterIns;
uniform sampler2D filterTex;
uniform sampler2D noiseTex;
uniform float noiseIns;


uniform vec4 u_ScreenParams;
uniform float sizeIns_1;
uniform float sizeIns_2;
uniform float centerX;
uniform float centerY;

vec4 neighborColor(int i,float dis){
    // float vertR = 20.;
	float blurSize=vertR * timeIntensity*dis * numIntensity*blurIns;
	float rescale = max(u_ScreenParams.x, u_ScreenParams.y) / 1280.;
	vec2 unit=vec2(blurSize/u_ScreenParams.x,blurSize/u_ScreenParams.y) * rescale;
	vec2 uv1 = uv + unit * vec2(0., i);
	vec2 uv2 = uv - unit * vec2(0., i);
	vec4 result = texture2D(inputTexture, uv1)
				+ texture2D(inputTexture, uv2);
	if (i < 2) {
		result *= .19;
	}
	else if (i < 3) {
		result *= .17;
	}
	else if (i < 4) {
		result *= .15;
	}
	else if (i < 5) {
		result *= .13;
	}
	else if (i < 6) {
		result *= .11;
	}
	else if (i < 7) {
		result *= .08;
	}
	else if (i < 8) {
		result *= .05;
	}
	else if (i < 9) {
		result *= .02;
	}
	return result;
}

float neighborWeight(int i) {
	float result = 0.;
	if (i < 2) {
		result = .19 * 2.;
	}
	else if (i < 3) {
		result = .17 * 2.;
	}
	else if (i < 4) {
		result = .15 * 2.;
	}
	else if (i < 5) {
		result = .13 * 2.;
	}
	else if (i < 6) {
		result = .11 * 2.;
	}
	else if (i < 7) {
		result = .08 * 2.;
	}
	else if (i < 8) {
		result = .05 * 2.;
	}
	else if (i < 9) {
		result = .02 * 2.;
	}
	return result * 10.;
}
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
	vec2 disUV = uv-vec2(centerX,centerY);
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

    float half_gaussian_weight[9];
	half_gaussian_weight[0]=.2;//0.137401;
	half_gaussian_weight[1]=.19;//0.125794;
	half_gaussian_weight[2]=.17;//0.106483;
	half_gaussian_weight[3]=.15;//0.080657;
	half_gaussian_weight[4]=.13;//0.054670;
	half_gaussian_weight[5]=.11;//0.033159;
	half_gaussian_weight[6]=.08;//0.017997;
	half_gaussian_weight[7]=.05;//0.008741;
	half_gaussian_weight[8]=.02;//0.003799;
	vec4 curColor=texture2D(inputTexture,uv);
	vec4 resultColor=vec4(0.);
	
	vec4 centerPixel=curColor*half_gaussian_weight[0];
	resultColor += centerPixel;
	float weight=half_gaussian_weight[0] * mix(10., 1., timeIntensity*dis * numIntensity);
	float i = 1.;
	float blurSize=vertR;
	for(int i=1;i<=8;i++){

		resultColor += neighborColor(i,dis);
		weight += neighborWeight(i);
	}
	resultColor /= weight / 10.; 
	resultColor = clamp(resultColor,0.0,1.0);
	// resultColor.rgb = pow(resultColor.rgb,vec3(mix(1.0,2.0,timeIntensity)));
	// resultColor.rgb = pow(resultColor.rgb,vec3(2.0));
	float noise = texture2D(noiseTex,uv).r;
	resultColor = takeEffectFilter(filterTex,resultColor,mix(0.0,filterIns,timeIntensity*dis));
	// float gray = max(max(resultColor.r,resultColor.g),resultColor.b);
	float gray = dot(resultColor.rgb,vec3(0.299 ,0.587,0.114));
	resultColor.rgb = mix(resultColor.rgb,resultColor.rgb*(noise*1.0+0.0)
	,noiseIns*gray*mix(0.0,1.,pow(timeIntensity*dis,1.5)));
	// filterTex
	gl_FragColor=vec4(resultColor);
}
