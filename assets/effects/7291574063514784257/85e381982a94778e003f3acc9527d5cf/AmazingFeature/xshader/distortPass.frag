precision highp float;

uniform sampler2D inputImageTexture;
varying vec2 uv;


uniform float u_CutoutPoints[10];

uniform float iTime;
float getNum(int i){
    if(i==0){
        return u_CutoutPoints[0];
    }
    else if(i==1){
        return u_CutoutPoints[1];
    }
    else if(i==2){
        return u_CutoutPoints[2];
    }
    else if(i==3){
        return u_CutoutPoints[3];
    }
    else if(i==4){
        return u_CutoutPoints[4];
    }
    else if(i==5){
        return u_CutoutPoints[5];
    }
    else if(i==6){
        return u_CutoutPoints[6];
    }
    else if(i==7){
        return u_CutoutPoints[7];
    }
    else if(i==8){
        return u_CutoutPoints[8];
    }
    else if(i==9){
        return u_CutoutPoints[9];
    }
    else{
        return u_CutoutPoints[0];
    }
}


void main()
{
    float t = (1.0-uv.y)*1084.;
    int p =0;
    for(int i = 0;i<=8;i++)
    {
        if(getNum(i)<t&&t<getNum(i+1)){
            p=i;
            break;
        }
        
    }
    float t0 = getNum(p);
    float t1 = getNum(p+1);
    float T = (t- t0)/(t1-t0);
    float y = mix(float(p)/9.,float(p+1)/9.,T);
    vec2 newUV = uv;
    newUV.y = 1.0-y;
    vec4 col = texture2D(inputImageTexture,newUV);

    gl_FragColor = vec4(col);
}
