precision highp float;
precision highp int;

uniform mediump sampler2D u_horizontalImage;
uniform mediump sampler2D u_verticalImage;
uniform float u_horizontalFlag;
uniform float u_verticalFlag;
uniform float u_horizontalType;
uniform float u_horizontalIntensity;
uniform float u_verticalType;
uniform float u_verticalIntensity;
uniform vec4 u_ScreenParams;
uniform float u_edgeType;
uniform mediump sampler2D u_InputTexture;

varying vec2 uv0;

float _f2(vec4 _p0, float _p1)
{
    if (_p1 < 0.5)
    {
        return _p0.x;
    }
    else
    {
        if (_p1 < 1.5)
        {
            return _p0.y;
        }
        else
        {
            if (_p1 < 2.5)
            {
                return _p0.z;
            }
        }
    }
    return _p0.w;
}

float _f0(vec2 _p0)
{
    vec2 _t0 = step(vec2(0.0), _p0) * step(_p0, vec2(1.0));
    return _t0.x * _t0.y;
}

vec4 _f1(mediump sampler2D _p0, inout vec2 _p1)
{
    _p1 = mod(_p1, vec2(2.0));
    _p1 = mix(_p1, vec2(2.0) - _p1, step(vec2(1.0), _p1));
    return texture2D(_p0, fract(_p1));
}

void main()
{
    vec4 _t1 = texture2D(u_horizontalImage, uv0);
    vec4 _t2 = texture2D(u_verticalImage, uv0);
    if (u_horizontalFlag < 0.5)
    {
        _t1 = vec4(0.5);
    }
    if (u_verticalFlag < 0.5)
    {
        _t2 = vec4(0.5);
    }
    vec4 param = _t1;
    float param_1 = u_horizontalType;
    vec4 param_2 = _t2;
    float param_3 = u_verticalType;
    vec2 _167 = vec2(uv0.x + (((_f2(param, param_1) - 0.5) * 2.0) * u_horizontalIntensity), uv0.y + (((((_f2(param_2, param_3) - 0.5) * 2.0) * u_verticalIntensity) * u_ScreenParams.x) / u_ScreenParams.y));
    if (u_edgeType < 0.5)
    {
        vec2 param_4 = _167;
        gl_FragData[0] = texture2D(u_InputTexture, _167) * _f0(param_4);
    }
    else
    {
        vec2 param_5 = _167;
        vec4 _186 = _f1(u_InputTexture, param_5);
        gl_FragData[0] = _186;
    }
}

