precision highp float;
precision highp int;

uniform mediump int u_enableMatte;
uniform mediump sampler2D u_maskTexture;
uniform mediump int u_matteMode;
uniform mediump int u_blendMode;
uniform mediump int u_layerType;
uniform mediump int u_hasMatte;
uniform float u_layerOpacity;
uniform mediump int u_hasBlend;
uniform mediump int u_hasBaseTexture;
uniform mediump sampler2D u_baseTexure;
uniform mediump int u_hasSourceTexture;
uniform mediump int u_hasTrs;
uniform mat4 u_mvMat;
uniform mat4 u_pMat;
uniform float u_mirrorEdge;
uniform mediump sampler2D u_sourceTexture;
uniform float u_alpha;

varying vec2 uv0;

vec3 _2202;

vec4 _f7(vec3 _p0, vec3 _p1, vec3 _p2, vec3 _p3, vec3 _p4)
{
    vec3 _404 = _p3 - _p2;
    vec3 _408 = _p4 - _p2;
    vec3 _412 = cross(_p1, _408);
    float _416 = dot(_404, _412);
    if (_416 <= 1.0000000116860974230803549289703e-07)
    {
        return vec4(-1.0);
    }
    vec3 _428 = _p0 - _p2;
    float _434 = dot(_428, _412) / _416;
    if ((_434 < 0.0) || (_434 > 1.0))
    {
        return vec4(-1.0);
    }
    vec3 _446 = cross(_428, _404);
    float _452 = dot(_p1, _446) / _416;
    bool _454 = _452 < 0.0;
    bool _462;
    if (!_454)
    {
        _462 = (_434 + _452) > 1.0;
    }
    else
    {
        _462 = _454;
    }
    if (_462)
    {
        return vec4(-1.0);
    }
    return vec4(_434, _452, dot(_408, _446) / _416, 1.0);
}

vec2 _f8(mat4 _p0, mat4 _p1, vec2 _p2)
{
    vec4 _505 = _p1 * vec4((_p2 * 2.0) - vec2(1.0), 0.0, 1.0);
    vec4 _t16 = _505;
    vec3 _521 = normalize((_505.xyz / vec3(_t16.w)) - vec3(0.0));
    vec3 _524 = (_p0 * vec4(10.0, -10.0, 0.0, 1.0)).xyz;
    vec3 _527 = _524 + vec3(9.9999997473787516355514526367188e-06, 0.0, 0.0);
    vec3 _529 = (_p0 * vec4(-10.0, 10.0, 0.0, 1.0)).xyz;
    vec3 _531 = _529 + vec3(0.0, 9.9999997473787516355514526367188e-06, 0.0);
    vec3 param = vec3(0.0);
    vec3 param_1 = _521;
    vec3 _538 = (_p0 * vec4(-10.0, -10.0, 0.0, 1.0)).xyz;
    vec3 param_2 = _538;
    vec3 param_3 = _527;
    vec3 param_4 = _531;
    vec4 _t20 = _f7(param, param_1, param_2, param_3, param_4);
    vec3 _545 = _529 - vec3(9.9999997473787516355514526367188e-06, 0.0, 0.0);
    vec3 _548 = _524 - vec3(0.0, 9.9999997473787516355514526367188e-06, 0.0);
    vec3 param_5 = vec3(0.0);
    vec3 param_6 = _521;
    vec3 param_7 = _545;
    vec3 param_8 = _548;
    vec3 _557 = (_p0 * vec4(10.0, 10.0, 0.0, 1.0)).xyz;
    vec3 param_9 = _557;
    vec4 _t21 = _f7(param_5, param_6, param_7, param_8, param_9);
    vec3 param_10 = vec3(0.0);
    vec3 param_11 = _521;
    vec3 param_12 = _538;
    vec3 param_13 = _531;
    vec3 param_14 = _527;
    vec4 _t22 = _f7(param_10, param_11, param_12, param_13, param_14);
    vec3 param_15 = vec3(0.0);
    vec3 param_16 = _521;
    vec3 param_17 = _545;
    vec3 param_18 = _557;
    vec3 param_19 = _548;
    vec4 _t23 = _f7(param_15, param_16, param_17, param_18, param_19);
    vec2 _729 = (((((((vec2(-4.5) * ((1.0 - _t20.x) - _t20.y)) + (vec2(5.5, -4.5) * _t20.x)) + (vec2(-4.5, 5.5) * _t20.y)) * step(0.0, _t20.w)) + ((((vec2(-4.5, 5.5) * ((1.0 - _t21.x) - _t21.y)) + (vec2(5.5, -4.5) * _t21.x)) + (vec2(5.5) * _t21.y)) * (step(_t20.w, 0.0) * step(0.0, _t21.w)))) + ((((vec2(-4.5) * ((1.0 - _t22.x) - _t22.y)) + (vec2(-4.5, 5.5) * _t22.x)) + (vec2(5.5, -4.5) * _t22.y)) * ((step(_t20.w, 0.0) * step(_t21.w, 0.0)) * step(0.0, _t22.w)))) + ((((vec2(-4.5, 5.5) * ((1.0 - _t23.x) - _t23.y)) + (vec2(5.5) * _t23.x)) + (vec2(5.5, -4.5) * _t23.y)) * (((step(_t20.w, 0.0) * step(_t21.w, 0.0)) * step(_t22.w, 0.0)) * step(0.0, _t23.w)))) + (vec2(-10000.0) * (((step(_t20.w, 0.0) * step(_t21.w, 0.0)) * step(_t22.w, 0.0)) * step(_t23.w, 0.0)));
    return _729;
}

vec2 _f10(vec2 _p0)
{
    return abs(mod(_p0 - vec2(1.0), vec2(2.0)) - vec2(1.0));
}

float _f9(vec2 _p0)
{
    vec2 _t29 = step(vec2(0.0), _p0) * step(_p0, vec2(1.0));
    return _t29.x * _t29.y;
}

float _f5(vec3 _p0)
{
    return dot(_p0, vec3(0.2989999949932098388671875, 0.58700001239776611328125, 0.114000000059604644775390625));
}

vec4 _f11(vec4 _p0)
{
    vec4 _t30 = vec4(0.0);
    if (u_enableMatte == 1)
    {
        _t30 = texture2D(u_maskTexture, uv0);
    }
    float _t31 = _t30.w;
    if (u_matteMode == 1)
    {
        vec3 param = _t30.xyz;
        _t31 = _f5(param);
    }
    else
    {
        if (u_matteMode == 2)
        {
            _t31 = 1.0 - _t30.w;
        }
        else
        {
            if (u_matteMode == 3)
            {
                vec3 param_1 = _t30.xyz;
                _t31 = 1.0 - _f5(param_1);
            }
        }
    }
    return _p0 * _t31;
}

float _f1(float _p0, float _p1)
{
    float _199;
    if (_p0 < 0.5)
    {
        _199 = _p1 - (((1.0 - (2.0 * _p0)) * _p1) * (1.0 - _p1));
    }
    else
    {
        float _218;
        if (_p1 < 0.25)
        {
            _218 = _p1 + ((((2.0 * _p0) - 1.0) * _p1) * ((((16.0 * _p1) - 12.0) * _p1) + 3.0));
        }
        else
        {
            _218 = _p1 + (((2.0 * _p0) - 1.0) * (sqrt(_p1) - _p1));
        }
        _199 = _218;
    }
    return _199;
}

vec3 _f2(vec3 _p0, vec3 _p1)
{
    float param = _p0.x;
    float param_1 = _p1.x;
    float param_2 = _p0.y;
    float param_3 = _p1.y;
    float param_4 = _p0.z;
    float param_5 = _p1.z;
    return vec3(_f1(param, param_1), _f1(param_2, param_3), _f1(param_4, param_5));
}

float _f3(float _p0, float _p1)
{
    float _283;
    if (_p0 < 0.5)
    {
        _283 = (2.0 * _p0) * _p1;
    }
    else
    {
        _283 = 1.0 - ((2.0 * (1.0 - _p0)) * (1.0 - _p1));
    }
    return _283;
}

vec3 _f4(vec3 _p0, vec3 _p1)
{
    float param = _p0.x;
    float param_1 = _p1.x;
    float param_2 = _p0.y;
    float param_3 = _p1.y;
    float param_4 = _p0.z;
    float param_5 = _p1.z;
    return vec3(_f3(param, param_1), _f3(param_2, param_3), _f3(param_4, param_5));
}

float _f13(vec3 _p0)
{
    return max(_p0.x, max(_p0.y, _p0.z)) - min(_p0.x, min(_p0.y, _p0.z));
}

vec3 _f12(inout vec3 _p0, float _p1)
{
    if (_p0.z > _p0.x)
    {
        _p0.y = ((_p0.y - _p0.x) * _p1) / (_p0.z - _p0.x);
        _p0.z = _p1;
    }
    else
    {
        _p0.y = 0.0;
        _p0.z = 0.0;
    }
    _p0.x = 0.0;
    return _p0;
}

vec3 _f14(inout vec3 _p0, float _p1)
{
    bool _867 = _p0.x <= _p0.y;
    bool _875;
    if (_867)
    {
        _875 = _p0.x <= _p0.z;
    }
    else
    {
        _875 = _867;
    }
    if (_875)
    {
        if (_p0.y <= _p0.z)
        {
            vec3 param = _p0;
            float param_1 = _p1;
            vec3 _889 = _f12(param, param_1);
            _p0 = _889;
        }
        else
        {
            vec3 param_2 = _p0.xzy;
            float param_3 = _p1;
            vec3 _896 = _f12(param_2, param_3);
            _p0 = vec3(_896.x, _896.z, _896.y);
        }
    }
    else
    {
        bool _904 = _p0.y <= _p0.x;
        bool _912;
        if (_904)
        {
            _912 = _p0.y <= _p0.z;
        }
        else
        {
            _912 = _904;
        }
        if (_912)
        {
            if (_p0.x <= _p0.z)
            {
                vec3 param_4 = _p0.yxz;
                float param_5 = _p1;
                vec3 _927 = _f12(param_4, param_5);
                _p0 = vec3(_927.y, _927.x, _927.z);
            }
            else
            {
                vec3 param_6 = _p0.yzx;
                float param_7 = _p1;
                vec3 _936 = _f12(param_6, param_7);
                _p0 = vec3(_936.z, _936.x, _936.y);
            }
        }
        else
        {
            if (_p0.x <= _p0.y)
            {
                vec3 param_8 = _p0.zxy;
                float param_9 = _p1;
                vec3 _952 = _f12(param_8, param_9);
                _p0 = vec3(_952.y, _952.z, _952.x);
            }
            else
            {
                vec3 param_10 = _p0.zyx;
                float param_11 = _p1;
                vec3 _961 = _f12(param_10, param_11);
                _p0 = vec3(_961.z, _961.y, _961.x);
            }
        }
    }
    return _p0;
}

vec3 _f6(inout vec3 _p0, inout float _p1)
{
    vec3 param = _p0;
    _p0 += vec3(_p1 - _f5(param));
    vec3 param_1 = _p0;
    _p1 = _f5(param_1);
    float _354 = min(_p0.x, min(_p0.y, _p0.z));
    float _357 = _p0.x;
    float _359 = _p0.y;
    float _361 = _p0.z;
    float _363 = max(_357, max(_359, _361));
    if (_354 < 0.0)
    {
        _p0 = mix(vec3(_p1, _p1, _p1), _p0, vec3(_p1 / (_p1 - _354)));
    }
    if (_363 > 1.0)
    {
        _p0 = mix(vec3(_p1, _p1, _p1), _p0, vec3((1.0 - _p1) / (_363 - _p1)));
    }
    return _p0;
}

vec3 _f15(vec3 _p0, vec3 _p1)
{
    vec3 param = _p1;
    vec3 param_1 = _p0;
    float param_2 = _f13(param);
    vec3 _973 = _f14(param_1, param_2);
    vec3 param_3 = _p1;
    vec3 param_4 = _973;
    float param_5 = _f5(param_3);
    vec3 _979 = _f6(param_4, param_5);
    return _979;
}

vec3 _f16(vec3 _p0, vec3 _p1)
{
    vec3 param = _p0;
    vec3 param_1 = _p1;
    float param_2 = _f13(param);
    vec3 _988 = _f14(param_1, param_2);
    vec3 param_3 = _p1;
    vec3 param_4 = _988;
    float param_5 = _f5(param_3);
    vec3 _994 = _f6(param_4, param_5);
    return _994;
}

vec3 _f17(vec3 _p0, vec3 _p1)
{
    vec3 param = _p1;
    vec3 param_1 = _p0;
    float param_2 = _f5(param);
    vec3 _1003 = _f6(param_1, param_2);
    return _1003;
}

float _f21(float _p0, float _p1)
{
    if (_p1 >= 1.0)
    {
        return 1.0;
    }
    else
    {
        if (_p0 <= 0.0)
        {
            return 0.0;
        }
        else
        {
            return 1.0 - min(1.0, (1.0 - _p1) / _p0);
        }
    }
}

vec3 _f22(vec3 _p0, vec3 _p1)
{
    float param = _p0.x;
    float param_1 = _p1.x;
    float param_2 = _p0.y;
    float param_3 = _p1.y;
    float param_4 = _p0.z;
    float param_5 = _p1.z;
    return vec3(_f21(param, param_1), _f21(param_2, param_3), _f21(param_4, param_5));
}

float _f23(float _p0, float _p1)
{
    return max(0.0, (_p1 + _p0) - 1.0);
}

vec3 _f24(vec3 _p0, vec3 _p1)
{
    float param = _p0.x;
    float param_1 = _p1.x;
    float param_2 = _p0.y;
    float param_3 = _p1.y;
    float param_4 = _p0.z;
    float param_5 = _p1.z;
    return vec3(_f23(param, param_1), _f23(param_2, param_3), _f23(param_4, param_5));
}

float _f25(float _p0, float _p1)
{
    if (_p1 <= 0.0)
    {
        return 0.0;
    }
    if (_p0 >= 1.0)
    {
        return 1.0;
    }
    else
    {
        return min(1.0, _p1 / (1.0 - _p0));
    }
}

vec3 _f26(vec3 _p0, vec3 _p1)
{
    float param = _p0.x;
    float param_1 = _p1.x;
    float param_2 = _p0.y;
    float param_3 = _p1.y;
    float param_4 = _p0.z;
    float param_5 = _p1.z;
    return vec3(_f25(param, param_1), _f25(param_2, param_3), _f25(param_4, param_5));
}

float _f27(float _p0, float _p1)
{
    return min(1.0, _p1 + _p0);
}

vec3 _f28(vec3 _p0, vec3 _p1)
{
    float param = _p0.x;
    float param_1 = _p1.x;
    float param_2 = _p0.y;
    float param_3 = _p1.y;
    float param_4 = _p0.z;
    float param_5 = _p1.z;
    return vec3(_f27(param, param_1), _f27(param_2, param_3), _f27(param_4, param_5));
}

float _f29(float _p0, float _p1)
{
    float _1191;
    if (_p0 <= 0.5)
    {
        float param = _p1;
        float param_1 = 2.0 * _p0;
        _1191 = _f21(param, param_1);
    }
    else
    {
        float param_2 = _p1;
        float param_3 = 2.0 * (_p0 - 0.5);
        _1191 = _f25(param_2, param_3);
    }
    return _1191;
}

vec3 _f30(vec3 _p0, vec3 _p1)
{
    float param = _p0.x;
    float param_1 = _p1.x;
    float param_2 = _p0.y;
    float param_3 = _p1.y;
    float param_4 = _p0.z;
    float param_5 = _p1.z;
    return vec3(_f29(param, param_1), _f29(param_2, param_3), _f29(param_4, param_5));
}

float _f31(float _p0, float _p1)
{
    float _1237;
    if (_p0 <= 0.5)
    {
        float param = _p1;
        float param_1 = 2.0 * _p0;
        _1237 = _f23(param, param_1);
    }
    else
    {
        float param_2 = _p1;
        float param_3 = 2.0 * (_p0 - 0.5);
        _1237 = _f27(param_2, param_3);
    }
    return _1237;
}

vec3 _f32(vec3 _p0, vec3 _p1)
{
    float param = _p0.x;
    float param_1 = _p1.x;
    float param_2 = _p0.y;
    float param_3 = _p1.y;
    float param_4 = _p0.z;
    float param_5 = _p1.z;
    return vec3(_f31(param, param_1), _f31(param_2, param_3), _f31(param_4, param_5));
}

float _f33(float _p0, float _p1)
{
    float _1283;
    if (_p0 <= 0.5)
    {
        _1283 = min(_p1, 2.0 * _p0);
    }
    else
    {
        _1283 = max(_p1, 2.0 * (_p0 - 0.5));
    }
    return _1283;
}

vec3 _f34(vec3 _p0, vec3 _p1)
{
    float param = _p0.x;
    float param_1 = _p1.x;
    float param_2 = _p0.y;
    float param_3 = _p1.y;
    float param_4 = _p0.z;
    float param_5 = _p1.z;
    return vec3(_f33(param, param_1), _f33(param_2, param_3), _f33(param_4, param_5));
}

float _f35(float _p0, float _p1)
{
    return float((_p1 + _p0) >= 1.0);
}

vec3 _f36(vec3 _p0, vec3 _p1)
{
    float param = _p0.x;
    float param_1 = _p1.x;
    float param_2 = _p0.y;
    float param_3 = _p1.y;
    float param_4 = _p0.z;
    float param_5 = _p1.z;
    return vec3(_f35(param, param_1), _f35(param_2, param_3), _f35(param_4, param_5));
}

float _f37(float _p0, float _p1)
{
    float _1356;
    if (_p0 > 0.0)
    {
        _1356 = min(1.0, _p1 / _p0);
    }
    else
    {
        _1356 = 1.0;
    }
    return _1356;
}

vec3 _f38(vec3 _p0, vec3 _p1)
{
    float param = _p0.x;
    float param_1 = _p1.x;
    float param_2 = _p0.y;
    float param_3 = _p1.y;
    float param_4 = _p0.z;
    float param_5 = _p1.z;
    return vec3(_f37(param, param_1), _f37(param_2, param_3), _f37(param_4, param_5));
}

vec3 _f20(vec3 _p0, vec3 _p1)
{
    vec3 param = _p0;
    vec3 param_1 = _p1;
    float param_2 = _f5(param);
    vec3 _1039 = _f6(param_1, param_2);
    return _1039;
}

vec3 _f19(vec3 _p0, vec3 _p1)
{
    vec3 param = _p1;
    vec3 param_1 = _p0;
    bvec3 _1029 = bvec3(_f5(param) > _f5(param_1));
    return vec3(_1029.x ? _p1.x : _p0.x, _1029.y ? _p1.y : _p0.y, _1029.z ? _p1.z : _p0.z);
}

vec3 _f18(vec3 _p0, vec3 _p1)
{
    vec3 param = _p1;
    vec3 param_1 = _p0;
    bvec3 _1016 = bvec3(_f5(param) <= _f5(param_1));
    return vec3(_1016.x ? _p1.x : _p0.x, _1016.y ? _p1.y : _p0.y, _1016.z ? _p1.z : _p0.z);
}

float _f0(vec2 _p0)
{
    return fract(sin(dot(_p0, vec2(12.98980045318603515625, 78.233001708984375))) * 43758.546875);
}

vec4 _f39(inout vec4 _p0, inout vec4 _p1)
{
    float _1392 = _p0.w;
    vec4 _1394 = _p0;
    vec3 _1397 = _1394.xyz / vec3(max(_1392, 9.9999997473787516355514526367188e-06));
    _p0.x = _1397.x;
    _p0.y = _1397.y;
    _p0.z = _1397.z;
    float _1405 = _p1.w;
    vec4 _1407 = _p1;
    vec3 _1410 = _1407.xyz / vec3(max(_1405, 9.9999997473787516355514526367188e-06));
    _p1.x = _1410.x;
    _p1.y = _1410.y;
    _p1.z = _1410.z;
    vec4 _t32 = _p1;
    if (u_blendMode == 1)
    {
        vec3 _1428 = _p0.xyz + _p1.xyz;
        _t32.x = _1428.x;
        _t32.y = _1428.y;
        _t32.z = _1428.z;
    }
    else
    {
        if (u_blendMode == 2)
        {
            vec3 _1444 = _p0.xyz * _p1.xyz;
            _t32.x = _1444.x;
            _t32.y = _1444.y;
            _t32.z = _1444.z;
        }
        else
        {
            if (u_blendMode == 3)
            {
                vec3 _1461 = abs(_p0.xyz - _p1.xyz);
                _t32.x = _1461.x;
                _t32.y = _1461.y;
                _t32.z = _1461.z;
            }
            else
            {
                if (u_blendMode == 4)
                {
                    float _1477;
                    if (_p1.x < 0.5)
                    {
                        _1477 = (2.0 * _p1.x) * _p0.x;
                    }
                    else
                    {
                        _1477 = 1.0 - ((2.0 * (1.0 - _p1.x)) * (1.0 - _p0.x));
                    }
                    float _1500;
                    if (_p1.y < 0.5)
                    {
                        _1500 = (2.0 * _p1.y) * _p0.y;
                    }
                    else
                    {
                        _1500 = 1.0 - ((2.0 * (1.0 - _p1.y)) * (1.0 - _p0.y));
                    }
                    float _1523;
                    if (_p1.z < 0.5)
                    {
                        _1523 = (2.0 * _p1.z) * _p0.z;
                    }
                    else
                    {
                        _1523 = 1.0 - ((2.0 * (1.0 - _p1.z)) * (1.0 - _p0.z));
                    }
                    vec3 _1543 = vec3(_1477, _1500, _1523);
                    _t32.x = _1543.x;
                    _t32.y = _1543.y;
                    _t32.z = _1543.z;
                }
                else
                {
                    if (u_blendMode == 5)
                    {
                        vec3 _1560 = min(_p0.xyz, _p1.xyz);
                        _t32.x = _1560.x;
                        _t32.y = _1560.y;
                        _t32.z = _1560.z;
                    }
                    else
                    {
                        if (u_blendMode == 6)
                        {
                            vec3 _1577 = max(_p0.xyz, _p1.xyz);
                            _t32.x = _1577.x;
                            _t32.y = _1577.y;
                            _t32.z = _1577.z;
                        }
                        else
                        {
                            if (u_blendMode == 7)
                            {
                                vec3 param = _p0.xyz;
                                vec3 param_1 = _p1.xyz;
                                vec3 _1596 = _f2(param, param_1);
                                _t32.x = _1596.x;
                                _t32.y = _1596.y;
                                _t32.z = _1596.z;
                            }
                            else
                            {
                                if (u_blendMode == 8)
                                {
                                    vec3 param_2 = _p0.xyz;
                                    vec3 param_3 = _p1.xyz;
                                    vec3 _1615 = _f4(param_2, param_3);
                                    _t32.x = _1615.x;
                                    _t32.y = _1615.y;
                                    _t32.z = _1615.z;
                                }
                                else
                                {
                                    if (u_blendMode == 9)
                                    {
                                        vec3 param_4 = _p0.xyz;
                                        vec3 param_5 = _p1.xyz;
                                        vec3 _1634 = _f15(param_4, param_5);
                                        _t32.x = _1634.x;
                                        _t32.y = _1634.y;
                                        _t32.z = _1634.z;
                                    }
                                    else
                                    {
                                        if (u_blendMode == 10)
                                        {
                                            vec3 param_6 = _p0.xyz;
                                            vec3 param_7 = _p1.xyz;
                                            vec3 _1653 = _f16(param_6, param_7);
                                            _t32.x = _1653.x;
                                            _t32.y = _1653.y;
                                            _t32.z = _1653.z;
                                        }
                                        else
                                        {
                                            if (u_blendMode == 11)
                                            {
                                                vec3 param_8 = _p0.xyz;
                                                vec3 param_9 = _p1.xyz;
                                                vec3 _1672 = _f17(param_8, param_9);
                                                _t32.x = _1672.x;
                                                _t32.y = _1672.y;
                                                _t32.z = _1672.z;
                                            }
                                            else
                                            {
                                                if (u_blendMode == 12)
                                                {
                                                    vec3 _1695 = (_p0.xyz + _p1.xyz) - (_p0.xyz * _p1.xyz);
                                                    _t32.x = _1695.x;
                                                    _t32.y = _1695.y;
                                                    _t32.z = _1695.z;
                                                }
                                                else
                                                {
                                                    if (u_blendMode == 13)
                                                    {
                                                        vec3 param_10 = _p0.xyz;
                                                        vec3 param_11 = _p1.xyz;
                                                        vec3 _1714 = _f22(param_10, param_11);
                                                        _t32.x = _1714.x;
                                                        _t32.y = _1714.y;
                                                        _t32.z = _1714.z;
                                                    }
                                                    else
                                                    {
                                                        if (u_blendMode == 14)
                                                        {
                                                            vec3 param_12 = _p0.xyz;
                                                            vec3 param_13 = _p1.xyz;
                                                            vec3 _1733 = _f24(param_12, param_13);
                                                            _t32.x = _1733.x;
                                                            _t32.y = _1733.y;
                                                            _t32.z = _1733.z;
                                                        }
                                                        else
                                                        {
                                                            if (u_blendMode == 15)
                                                            {
                                                                vec3 param_14 = _p0.xyz;
                                                                vec3 param_15 = _p1.xyz;
                                                                vec3 _1752 = _f26(param_14, param_15);
                                                                _t32.x = _1752.x;
                                                                _t32.y = _1752.y;
                                                                _t32.z = _1752.z;
                                                            }
                                                            else
                                                            {
                                                                if (u_blendMode == 16)
                                                                {
                                                                    vec3 param_16 = _p0.xyz;
                                                                    vec3 param_17 = _p1.xyz;
                                                                    vec3 _1771 = _f28(param_16, param_17);
                                                                    _t32.x = _1771.x;
                                                                    _t32.y = _1771.y;
                                                                    _t32.z = _1771.z;
                                                                }
                                                                else
                                                                {
                                                                    if (u_blendMode == 17)
                                                                    {
                                                                        vec3 param_18 = _p0.xyz;
                                                                        vec3 param_19 = _p1.xyz;
                                                                        vec3 _1790 = _f30(param_18, param_19);
                                                                        _t32.x = _1790.x;
                                                                        _t32.y = _1790.y;
                                                                        _t32.z = _1790.z;
                                                                    }
                                                                    else
                                                                    {
                                                                        if (u_blendMode == 18)
                                                                        {
                                                                            vec3 param_20 = _p0.xyz;
                                                                            vec3 param_21 = _p1.xyz;
                                                                            vec3 _1809 = _f32(param_20, param_21);
                                                                            _t32.x = _1809.x;
                                                                            _t32.y = _1809.y;
                                                                            _t32.z = _1809.z;
                                                                        }
                                                                        else
                                                                        {
                                                                            if (u_blendMode == 19)
                                                                            {
                                                                                vec3 param_22 = _p0.xyz;
                                                                                vec3 param_23 = _p1.xyz;
                                                                                vec3 _1828 = _f34(param_22, param_23);
                                                                                _t32.x = _1828.x;
                                                                                _t32.y = _1828.y;
                                                                                _t32.z = _1828.z;
                                                                            }
                                                                            else
                                                                            {
                                                                                if (u_blendMode == 20)
                                                                                {
                                                                                    vec3 param_24 = _p0.xyz;
                                                                                    vec3 param_25 = _p1.xyz;
                                                                                    vec3 _1847 = _f36(param_24, param_25);
                                                                                    _t32.x = _1847.x;
                                                                                    _t32.y = _1847.y;
                                                                                    _t32.z = _1847.z;
                                                                                }
                                                                                else
                                                                                {
                                                                                    if (u_blendMode == 21)
                                                                                    {
                                                                                        vec3 _1871 = (_p1.xyz + _p0.xyz) - ((_p1.xyz * 2.0) * _p0.xyz);
                                                                                        _t32.x = _1871.x;
                                                                                        _t32.y = _1871.y;
                                                                                        _t32.z = _1871.z;
                                                                                    }
                                                                                    else
                                                                                    {
                                                                                        if (u_blendMode == 22)
                                                                                        {
                                                                                            vec3 _1889 = max(vec3(0.0), _p1.xyz - _p0.xyz);
                                                                                            _t32.x = _1889.x;
                                                                                            _t32.y = _1889.y;
                                                                                            _t32.z = _1889.z;
                                                                                        }
                                                                                        else
                                                                                        {
                                                                                            if (u_blendMode == 23)
                                                                                            {
                                                                                                vec3 param_26 = _p0.xyz;
                                                                                                vec3 param_27 = _p1.xyz;
                                                                                                vec3 _1908 = _f38(param_26, param_27);
                                                                                                _t32.x = _1908.x;
                                                                                                _t32.y = _1908.y;
                                                                                                _t32.z = _1908.z;
                                                                                            }
                                                                                            else
                                                                                            {
                                                                                                if (u_blendMode == 24)
                                                                                                {
                                                                                                    vec3 param_28 = _p0.xyz;
                                                                                                    vec3 param_29 = _p1.xyz;
                                                                                                    vec3 _1927 = _f20(param_28, param_29);
                                                                                                    _t32.x = _1927.x;
                                                                                                    _t32.y = _1927.y;
                                                                                                    _t32.z = _1927.z;
                                                                                                }
                                                                                                else
                                                                                                {
                                                                                                    if (u_blendMode == 25)
                                                                                                    {
                                                                                                        vec3 param_30 = _p0.xyz;
                                                                                                        vec3 param_31 = _p1.xyz;
                                                                                                        vec3 _1946 = _f19(param_30, param_31);
                                                                                                        _t32.x = _1946.x;
                                                                                                        _t32.y = _1946.y;
                                                                                                        _t32.z = _1946.z;
                                                                                                    }
                                                                                                    else
                                                                                                    {
                                                                                                        if (u_blendMode == 26)
                                                                                                        {
                                                                                                            vec3 param_32 = _p0.xyz;
                                                                                                            vec3 param_33 = _p1.xyz;
                                                                                                            vec3 _1965 = _f18(param_32, param_33);
                                                                                                            _t32.x = _1965.x;
                                                                                                            _t32.y = _1965.y;
                                                                                                            _t32.z = _1965.z;
                                                                                                        }
                                                                                                        else
                                                                                                        {
                                                                                                            if (u_blendMode == 27)
                                                                                                            {
                                                                                                                bool _1980 = _p0.w == 1.0;
                                                                                                                bool _1996;
                                                                                                                if (!_1980)
                                                                                                                {
                                                                                                                    bool _1986 = _p0.w > 0.0;
                                                                                                                    bool _1995;
                                                                                                                    if (_1986)
                                                                                                                    {
                                                                                                                        vec2 param_34 = uv0;
                                                                                                                        _1995 = _p0.w > _f0(param_34);
                                                                                                                    }
                                                                                                                    else
                                                                                                                    {
                                                                                                                        _1995 = _1986;
                                                                                                                    }
                                                                                                                    _1996 = _1995;
                                                                                                                }
                                                                                                                else
                                                                                                                {
                                                                                                                    _1996 = _1980;
                                                                                                                }
                                                                                                                if (_1996)
                                                                                                                {
                                                                                                                    _t32.x = _p0.xyz.x;
                                                                                                                    _t32.y = _p0.xyz.y;
                                                                                                                    _t32.z = _p0.xyz.z;
                                                                                                                }
                                                                                                            }
                                                                                                            else
                                                                                                            {
                                                                                                                _t32.x = _p0.xyz.x;
                                                                                                                _t32.y = _p0.xyz.y;
                                                                                                                _t32.z = _p0.xyz.z;
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    vec4 _t33 = vec4(0.0);
    if (u_layerType == 1)
    {
        float _t34 = 1.0;
        if (u_hasMatte == 1)
        {
            vec4 param_35 = vec4(1.0);
            _t34 = _f11(param_35).w;
        }
        vec4 _2047 = mix(_p1, vec4(_t32.xyz, _p0.w), vec4(u_layerOpacity * _t34));
        _t33 = _2047;
        float _2049 = _t33.w;
        vec3 _2052 = _2047.xyz * _2049;
        _t33.x = _2052.x;
        _t33.y = _2052.y;
        _t33.z = _2052.z;
    }
    else
    {
        vec3 _2087 = (((_p1.xyz * _p1.w) * (1.0 - _p0.w)) + ((_p0.xyz * _p0.w) * (1.0 - _p1.w))) + (_t32.xyz * (_p0.w * _p1.w));
        _t33.x = _2087.x;
        _t33.y = _2087.y;
        _t33.z = _2087.z;
        _t33.w = _p0.w + (_p1.w * (1.0 - _p0.w));
    }
    return _t33;
}

void main()
{
    vec4 _t35 = vec4(0.0);
    bool _2110 = u_hasBlend == 1;
    if (_2110)
    {
        if (u_hasBaseTexture == 1)
        {
            _t35 = texture2D(u_baseTexure, uv0);
        }
        if (u_hasSourceTexture == 0)
        {
            gl_FragData[0] = _t35;
            return;
        }
    }
    vec4 _t36 = vec4(0.0);
    if (u_hasTrs == 1)
    {
        mat4 param = u_mvMat;
        mat4 param_1 = u_pMat;
        vec2 param_2 = uv0;
        vec2 _2148 = _f8(param, param_1, param_2);
        float _2151 = step(u_mirrorEdge, 0.5);
        vec2 param_3 = _2148;
        vec2 _2161 = (_2148 * _2151) + (_f10(param_3) * (1.0 - _2151));
        vec2 param_4 = _2161;
        _t36 = (texture2D(u_sourceTexture, _2161) * u_alpha) * _f9(param_4);
    }
    else
    {
        if (u_hasSourceTexture == 1)
        {
            _t36 = texture2D(u_sourceTexture, uv0);
        }
    }
    if ((u_layerType != 1) && (u_hasMatte == 1))
    {
        vec4 param_5 = _t36;
        _t36 = _f11(param_5);
    }
    if (_2110)
    {
        vec4 param_6 = _t36;
        vec4 param_7 = _t35;
        vec4 _2199 = _f39(param_6, param_7);
        _t36 = _2199;
    }
    gl_FragData[0] = _t36;
}

