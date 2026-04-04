
attribute vec2 a_position;
varying vec2 uv0;
attribute vec2 a_texcoord0;

void main()
{
    gl_Position = sign(vec4(a_position, 0.0, 1.0));
    uv0 = a_texcoord0;
}

