precision lowp float;
varying highp vec2 uv0;
uniform sampler2D u_InputTex;
uniform sampler2D u_OutputTex;
void main()
{
    gl_FragColor = texture2D(u_OutputTex, uv0);
}
