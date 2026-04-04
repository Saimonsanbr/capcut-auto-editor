precision highp float;
precision highp int;

uniform mediump sampler2D u_inputTexture;
uniform vec3 u_redVec3;
uniform vec3 u_greenVec3;
uniform vec3 u_blueVec3;

varying vec2 v_uv;

void main()
{
    mediump vec4 _19 = texture2D(u_inputTexture, v_uv);
    vec4 _t1 = _19;
    vec3 _24 = _19.xyz;
    _t1.x = dot(_24, u_redVec3);
    _t1.y = dot(_24, u_greenVec3);
    _t1.z = dot(_24, u_blueVec3);
    gl_FragData[0] = clamp(_t1, vec4(0.0), vec4(1.0));
}

