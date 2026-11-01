precision highp float;

attribute vec3 attPosition;
attribute vec2 attUV;
uniform mat4 u_MVP;
varying vec2 uv;

void main() {
    gl_Position = vec4(attPosition,1.0);
    uv = attUV;
}
