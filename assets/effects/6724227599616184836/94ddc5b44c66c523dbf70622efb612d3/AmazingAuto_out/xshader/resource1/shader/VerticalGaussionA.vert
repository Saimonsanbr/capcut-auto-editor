precision highp float;

attribute vec3 attPosition;
attribute vec2 attUV;

varying vec2 texCoord;

void main() {
    gl_Position = vec4(attPosition,1.0);
    texCoord = attUV.xy;
}

// DO_NOT_PATCH_ME