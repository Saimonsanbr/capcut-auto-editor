precision highp float;

attribute vec3 attPosition;
attribute vec2 attUV;

varying vec2 uv;

void main() {
    gl_Position = vec4(attPosition,1.0);
    uv = attPosition.xy*0.5+0.5;
}
