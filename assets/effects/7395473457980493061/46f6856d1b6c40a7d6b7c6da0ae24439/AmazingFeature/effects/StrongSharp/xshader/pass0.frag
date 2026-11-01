precision highp float;
uniform sampler2D inputImageTexture;
varying vec2 texCoordinate;

uniform int inputWidth;
uniform int inputHeight;

#define M_PI    3.14159265
#define radius  2
float standardGaussianWeights[radius+1];
void initGaussianWeight(float sigma)
{
	float sumOfWeights = 0.0;
	for(int i = 0;i <= radius;i++)
	{
	    standardGaussianWeights[i] = (1.0 / sqrt(2.0 * M_PI * pow(sigma, 2.0))) 
	    	* exp(-pow(float(i), 2.0) / (2.0 * pow(sigma, 2.0)));
	    if (i == 0)
	    {
	        sumOfWeights += standardGaussianWeights[i];
	    }
	    else
	    {
	        sumOfWeights += 2.0 * standardGaussianWeights[i];
	    }        	
	}

	for(int i = 0;i <= radius;i++)
	{
        standardGaussianWeights[i] = standardGaussianWeights[i] / sumOfWeights;      	
	}	
}


void main() 
{
    float texelWidthOffset = 1.0/float(inputWidth);
    float texelHeightOffset = 1.0/float(inputHeight);
    initGaussianWeight(2.0);
    float blur_kernel[2*radius + 1];  
    for(int i=0;i<2*radius+1;i++)
    {
        int idx = int( abs(float(radius)-float(i)) );
        blur_kernel[i] = standardGaussianWeights[idx];
    }  

    // gauss blur
    vec4 result_color = vec4(0.0);
    float r = float(radius);
    for(float i=-r;i<=r;i=i+1.0)
    {
        for(float j=-r;j<=r;j=j+1.0)
        {
            vec4 t_color = texture2D(inputImageTexture, texCoordinate+vec2(i*texelWidthOffset, j*texelHeightOffset) );
            result_color += blur_kernel[int(i+r)] * blur_kernel[int(j+r)] * t_color;
        }
    }
    gl_FragColor = result_color;
}