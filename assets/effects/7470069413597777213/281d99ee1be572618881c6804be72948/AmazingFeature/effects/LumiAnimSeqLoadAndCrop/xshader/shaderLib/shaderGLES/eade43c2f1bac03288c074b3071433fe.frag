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
    float _172 = sin(_p1);
    float _175 = cos(_p1);
    _p0 = mat2(vec2(_175, _172), vec2(-_172, _175)) * _p0;
    _p0.y *= (u_ScreenParams.x / u_ScreenParams.y);
    _p0 /= _p4;
    _p0 += vec2(0.5);
    _p0 += _p3;
    return _p0;
}

vec2 _f2(vec2 _p0)
{
    vec2 _125 = mod(_p0, vec2(1.0));
    return _125 + (vec2(1.0) - step(vec2(0.0), _125));
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
    float _99 = _t2.w;
    vec3 _100 = texture2D(u_seqTexture, vec2((_p0.x * 0.5) + 0.5, _p0.y)).xyz * _99;
    _t2.x = _100.x;
    _t2.y = _100.y;
    _t2.z = _100.z;
    return _t2;
}

float _f3(vec2 _p0)
{
    vec2 _t4 = step(vec2(0.0), _p0) * step(_p0, vec2(1.0));
    return _t4.x * _t4.y;
}

void main()
{
    bool _217 = abs(u_scale.x) < 9.9999997473787516355514526367188e-05;
    bool _225;
    if (!_217)
    {
        _225 = abs(u_scale.y) < 9.9999997473787516355514526367188e-05;
    }
    else
    {
        _225 = _217;
    }
    if (_225)
    {
        gl_FragData[0] = vec4(0.0);
        return;
    }
    vec2 param = uv0;
    float param_1 = u_rotation;
    vec2 param_2 = u_position;
    vec2 param_3 = u_pivot;
    vec2 param_4 = u_scale;
    vec2 _248 = _f4(param, param_1, param_2, param_3, param_4);
    vec2 _t8 = _248;
    float _255 = u_seqTexSize.x / u_seqTexSize.y;
    float _261 = u_ScreenParams.x / u_ScreenParams.y;
    vec2 _t11 = _248;
    if (u_cropType == 1)
    {
        if (_255 > _261)
        {
            _t11.y = _t8.y;
            _t11.x = ((_t8.x - 0.5) * (_261 / _255)) + 0.5;
        }
        else
        {
            _t11.x = _t8.x;
            _t11.y = ((_t8.y - 0.5) * (_255 / _261)) + 0.5;
        }
    }
    else
    {
        if (u_cropType == 2)
        {
            if (_255 < _261)
            {
                _t11.y = _t8.y;
                _t11.x = ((_t8.x - 0.5) * (_261 / _255)) + 0.5;
            }
            else
            {
                _t11.x = _t8.x;
                _t11.y = ((_t8.y - 0.5) * (_255 / _261)) + 0.5;
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
    vec4 _392 = _f0(param_7);
    vec4 _t16 = _392;
    if (u_edgeType == 3)
    {
        vec2 param_8 = _t11;
        _t16 *= _f3(param_8);
    }
    vec4 _404 = _t16;
    vec4 _405 = _404 * u_opacity;
    _t16 = _405;
    gl_FragData[0] = _405;
}

