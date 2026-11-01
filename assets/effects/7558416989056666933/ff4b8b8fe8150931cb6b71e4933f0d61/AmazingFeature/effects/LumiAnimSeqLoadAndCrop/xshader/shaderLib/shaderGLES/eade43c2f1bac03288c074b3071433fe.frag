precision highp float;
precision highp int;

uniform mediump int u_yFlip;
uniform mediump int u_convertAlpha;
uniform mediump sampler2D u_seqTexture;
uniform vec4 u_ScreenParams;
uniform vec2 u_scale;
uniform float u_rotation;
uniform vec2 u_position;
uniform vec2 u_pivot;
uniform vec2 u_seqTexSize;
uniform mediump int u_cropType;
uniform mediump int u_edgeType;
uniform float u_opacity;

varying vec2 uv0;

vec2 _f4(inout vec2 _p0, float _p1, vec2 _p2, vec2 _p3, vec2 _p4)
{
    _p0 -= _p2;
    _p0 -= vec2(0.5);
    _p0.y *= (u_ScreenParams.y / u_ScreenParams.x);
    float _169 = sin(_p1);
    float _172 = cos(_p1);
    _p0 = mat2(vec2(_172, _169), vec2(-_169, _172)) * _p0;
    _p0.y *= (u_ScreenParams.x / u_ScreenParams.y);
    _p0 /= _p4;
    _p0 += vec2(0.5);
    _p0 += _p3;
    return _p0;
}

vec2 _f2(vec2 _p0)
{
    vec2 _122 = mod(_p0, vec2(1.0));
    return _122 + (vec2(1.0) - step(vec2(0.0), _122));
}

vec2 _f1(vec2 _p0)
{
    return abs(mod(_p0 - vec2(1.0), vec2(2.0)) - vec2(1.0));
}

vec4 _f0(inout vec2 _p0)
{
    if (u_yFlip == 1)
    {
        _p0 = vec2(_p0.x, 1.0 - _p0.y);
    }
    if (u_convertAlpha == 0)
    {
        return texture2D(u_seqTexture, _p0);
    }
    vec4 _t2;
    _t2.w = texture2D(u_seqTexture, vec2(_p0.x * 0.5, _p0.y)).x;
    mediump vec3 _97 = texture2D(u_seqTexture, vec2((_p0.x * 0.5) + 0.5, _p0.y)).xyz;
    _t2.x = _97.x;
    _t2.y = _97.y;
    _t2.z = _97.z;
    return _t2;
}

float _f3(vec2 _p0)
{
    vec2 _t4 = step(vec2(0.0), _p0) * step(_p0, vec2(1.0));
    return _t4.x * _t4.y;
}

void main()
{
    bool _214 = abs(u_scale.x) < 9.9999997473787516355514526367188e-05;
    bool _222;
    if (!_214)
    {
        _222 = abs(u_scale.y) < 9.9999997473787516355514526367188e-05;
    }
    else
    {
        _222 = _214;
    }
    if (_222)
    {
        gl_FragData[0] = vec4(0.0);
        return;
    }
    vec2 param = uv0;
    float param_1 = u_rotation;
    vec2 param_2 = u_position;
    vec2 param_3 = u_pivot;
    vec2 param_4 = u_scale;
    vec2 _245 = _f4(param, param_1, param_2, param_3, param_4);
    vec2 _t8 = _245;
    float _252 = u_seqTexSize.x / u_seqTexSize.y;
    float _258 = u_ScreenParams.x / u_ScreenParams.y;
    vec2 _t11 = _245;
    if (u_cropType == 1)
    {
        if (_252 > _258)
        {
            _t11.y = _t8.y;
            _t11.x = ((_t8.x - 0.5) * (_258 / _252)) + 0.5;
        }
        else
        {
            _t11.x = _t8.x;
            _t11.y = ((_t8.y - 0.5) * (_252 / _258)) + 0.5;
        }
    }
    else
    {
        if (u_cropType == 2)
        {
            if (_252 < _258)
            {
                _t11.y = _t8.y;
                _t11.x = ((_t8.x - 0.5) * (_258 / _252)) + 0.5;
            }
            else
            {
                _t11.x = _t8.x;
                _t11.y = ((_t8.y - 0.5) * (_252 / _258)) + 0.5;
            }
        }
        else
        {
            if (u_cropType == 3)
            {
                _t11 -= vec2(0.5);
                _t11.x *= (u_ScreenParams.x / u_seqTexSize.x);
                _t11.y *= (u_ScreenParams.y / u_seqTexSize.y);
                _t11 += vec2(0.5);
            }
        }
    }
    if (u_edgeType == 0)
    {
        vec2 param_5 = _t11;
        _t11 = _f2(param_5);
    }
    else
    {
        if (u_edgeType == 1)
        {
            vec2 param_6 = _t11;
            _t11 = _f1(param_6);
        }
    }
    vec2 param_7 = _t11;
    vec4 _389 = _f0(param_7);
    vec4 _t16 = _389;
    if (u_edgeType == 3)
    {
        vec2 param_8 = _t11;
        _t16 *= _f3(param_8);
    }
    vec4 _401 = _t16;
    vec4 _402 = _401 * u_opacity;
    _t16 = _402;
    gl_FragData[0] = _402;
}

