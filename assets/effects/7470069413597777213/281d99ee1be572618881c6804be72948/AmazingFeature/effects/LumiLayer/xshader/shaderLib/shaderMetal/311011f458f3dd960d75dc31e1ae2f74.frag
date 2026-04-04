#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

// Implementation of the GLSL mod() function, which is slightly different than Metal fmod()
template<typename Tx, typename Ty>
inline Tx mod(Tx x, Ty y)
{
    return x - y * floor(x / y);
}

struct buffer_t
{
    int u_enableMatte;
    int u_matteMode;
    int u_blendMode;
    int u_layerType;
    int u_hasMatte;
    float u_layerOpacity;
    int u_hasBlend;
    int u_hasBaseTexture;
    int u_hasSourceTexture;
    int u_hasTrs;
    float4x4 u_mvMat;
    float4x4 u_pMat;
    float u_mirrorEdge;
    float u_alpha;
};

constant float3 _2202 = {};

struct main0_out
{
    float4 o_fragColor [[color(0)]];
};

struct main0_in
{
    float2 uv0 [[user(locn0)]];
};

static inline __attribute__((always_inline))
float4 _f7(thread const float3& _p0, thread const float3& _p1, thread const float3& _p2, thread const float3& _p3, thread const float3& _p4)
{
    float3 _404 = _p3 - _p2;
    float3 _408 = _p4 - _p2;
    float3 _412 = cross(_p1, _408);
    float _416 = dot(_404, _412);
    if (_416 <= 1.0000000116860974230803549289703e-07)
    {
        return float4(-1.0);
    }
    float3 _428 = _p0 - _p2;
    float _434 = dot(_428, _412) / _416;
    if ((_434 < 0.0) || (_434 > 1.0))
    {
        return float4(-1.0);
    }
    float3 _446 = cross(_428, _404);
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
        return float4(-1.0);
    }
    return float4(_434, _452, dot(_408, _446) / _416, 1.0);
}

static inline __attribute__((always_inline))
float2 _f8(thread const float4x4& _p0, thread const float4x4& _p1, thread const float2& _p2)
{
    float4 _505 = _p1 * float4((_p2 * 2.0) - float2(1.0), 0.0, 1.0);
    float4 _t16 = _505;
    float3 _521 = fast::normalize((_505.xyz / float3(_t16.w)) - float3(0.0));
    float3 _524 = (_p0 * float4(10.0, -10.0, 0.0, 1.0)).xyz;
    float3 _527 = _524 + float3(9.9999997473787516355514526367188e-06, 0.0, 0.0);
    float3 _529 = (_p0 * float4(-10.0, 10.0, 0.0, 1.0)).xyz;
    float3 _531 = _529 + float3(0.0, 9.9999997473787516355514526367188e-06, 0.0);
    float3 param = float3(0.0);
    float3 param_1 = _521;
    float3 _538 = (_p0 * float4(-10.0, -10.0, 0.0, 1.0)).xyz;
    float3 param_2 = _538;
    float3 param_3 = _527;
    float3 param_4 = _531;
    float4 _t20 = _f7(param, param_1, param_2, param_3, param_4);
    float3 _545 = _529 - float3(9.9999997473787516355514526367188e-06, 0.0, 0.0);
    float3 _548 = _524 - float3(0.0, 9.9999997473787516355514526367188e-06, 0.0);
    float3 param_5 = float3(0.0);
    float3 param_6 = _521;
    float3 param_7 = _545;
    float3 param_8 = _548;
    float3 _557 = (_p0 * float4(10.0, 10.0, 0.0, 1.0)).xyz;
    float3 param_9 = _557;
    float4 _t21 = _f7(param_5, param_6, param_7, param_8, param_9);
    float3 param_10 = float3(0.0);
    float3 param_11 = _521;
    float3 param_12 = _538;
    float3 param_13 = _531;
    float3 param_14 = _527;
    float4 _t22 = _f7(param_10, param_11, param_12, param_13, param_14);
    float3 param_15 = float3(0.0);
    float3 param_16 = _521;
    float3 param_17 = _545;
    float3 param_18 = _557;
    float3 param_19 = _548;
    float4 _t23 = _f7(param_15, param_16, param_17, param_18, param_19);
    float2 _729 = (((((((float2(-4.5) * ((1.0 - _t20.x) - _t20.y)) + (float2(5.5, -4.5) * _t20.x)) + (float2(-4.5, 5.5) * _t20.y)) * step(0.0, _t20.w)) + ((((float2(-4.5, 5.5) * ((1.0 - _t21.x) - _t21.y)) + (float2(5.5, -4.5) * _t21.x)) + (float2(5.5) * _t21.y)) * (step(_t20.w, 0.0) * step(0.0, _t21.w)))) + ((((float2(-4.5) * ((1.0 - _t22.x) - _t22.y)) + (float2(-4.5, 5.5) * _t22.x)) + (float2(5.5, -4.5) * _t22.y)) * ((step(_t20.w, 0.0) * step(_t21.w, 0.0)) * step(0.0, _t22.w)))) + ((((float2(-4.5, 5.5) * ((1.0 - _t23.x) - _t23.y)) + (float2(5.5) * _t23.x)) + (float2(5.5, -4.5) * _t23.y)) * (((step(_t20.w, 0.0) * step(_t21.w, 0.0)) * step(_t22.w, 0.0)) * step(0.0, _t23.w)))) + (float2(-10000.0) * (((step(_t20.w, 0.0) * step(_t21.w, 0.0)) * step(_t22.w, 0.0)) * step(_t23.w, 0.0)));
    return _729;
}

static inline __attribute__((always_inline))
float2 _f10(thread const float2& _p0)
{
    return abs(mod(_p0 - float2(1.0), float2(2.0)) - float2(1.0));
}

static inline __attribute__((always_inline))
float _f9(thread const float2& _p0)
{
    float2 _t29 = step(float2(0.0), _p0) * step(_p0, float2(1.0));
    return _t29.x * _t29.y;
}

static inline __attribute__((always_inline))
float _f5(thread const float3& _p0)
{
    return dot(_p0, float3(0.2989999949932098388671875, 0.58700001239776611328125, 0.114000000059604644775390625));
}

static inline __attribute__((always_inline))
float4 _f11(thread const float4& _p0, constant int& u_enableMatte, texture2d<float> u_maskTexture, sampler u_maskTextureSmplr, thread float2& uv0, constant int& u_matteMode)
{
    float4 _t30 = float4(0.0);
    if (u_enableMatte == 1)
    {
        _t30 = u_maskTexture.sample(u_maskTextureSmplr, uv0);
    }
    float _t31 = _t30.w;
    if (u_matteMode == 1)
    {
        float3 param = _t30.xyz;
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
                float3 param_1 = _t30.xyz;
                _t31 = 1.0 - _f5(param_1);
            }
        }
    }
    return _p0 * _t31;
}

static inline __attribute__((always_inline))
float _f1(thread const float& _p0, thread const float& _p1)
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

static inline __attribute__((always_inline))
float3 _f2(thread const float3& _p0, thread const float3& _p1)
{
    float param = _p0.x;
    float param_1 = _p1.x;
    float param_2 = _p0.y;
    float param_3 = _p1.y;
    float param_4 = _p0.z;
    float param_5 = _p1.z;
    return float3(_f1(param, param_1), _f1(param_2, param_3), _f1(param_4, param_5));
}

static inline __attribute__((always_inline))
float _f3(thread const float& _p0, thread const float& _p1)
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

static inline __attribute__((always_inline))
float3 _f4(thread const float3& _p0, thread const float3& _p1)
{
    float param = _p0.x;
    float param_1 = _p1.x;
    float param_2 = _p0.y;
    float param_3 = _p1.y;
    float param_4 = _p0.z;
    float param_5 = _p1.z;
    return float3(_f3(param, param_1), _f3(param_2, param_3), _f3(param_4, param_5));
}

static inline __attribute__((always_inline))
float _f13(thread const float3& _p0)
{
    return fast::max(_p0.x, fast::max(_p0.y, _p0.z)) - fast::min(_p0.x, fast::min(_p0.y, _p0.z));
}

static inline __attribute__((always_inline))
float3 _f12(thread float3& _p0, thread const float& _p1)
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

static inline __attribute__((always_inline))
float3 _f14(thread float3& _p0, thread const float& _p1)
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
            float3 param = _p0;
            float param_1 = _p1;
            float3 _889 = _f12(param, param_1);
            _p0 = _889;
        }
        else
        {
            float3 param_2 = _p0.xzy;
            float param_3 = _p1;
            float3 _896 = _f12(param_2, param_3);
            _p0 = float3(_896.x, _896.z, _896.y);
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
                float3 param_4 = _p0.yxz;
                float param_5 = _p1;
                float3 _927 = _f12(param_4, param_5);
                _p0 = float3(_927.y, _927.x, _927.z);
            }
            else
            {
                float3 param_6 = _p0.yzx;
                float param_7 = _p1;
                float3 _936 = _f12(param_6, param_7);
                _p0 = float3(_936.z, _936.x, _936.y);
            }
        }
        else
        {
            if (_p0.x <= _p0.y)
            {
                float3 param_8 = _p0.zxy;
                float param_9 = _p1;
                float3 _952 = _f12(param_8, param_9);
                _p0 = float3(_952.y, _952.z, _952.x);
            }
            else
            {
                float3 param_10 = _p0.zyx;
                float param_11 = _p1;
                float3 _961 = _f12(param_10, param_11);
                _p0 = float3(_961.z, _961.y, _961.x);
            }
        }
    }
    return _p0;
}

static inline __attribute__((always_inline))
float3 _f6(thread float3& _p0, thread float& _p1)
{
    float3 param = _p0;
    _p0 += float3(_p1 - _f5(param));
    float3 param_1 = _p0;
    _p1 = _f5(param_1);
    float _354 = fast::min(_p0.x, fast::min(_p0.y, _p0.z));
    float _357 = _p0.x;
    float _359 = _p0.y;
    float _361 = _p0.z;
    float _363 = fast::max(_357, fast::max(_359, _361));
    if (_354 < 0.0)
    {
        _p0 = mix(float3(_p1, _p1, _p1), _p0, float3(_p1 / (_p1 - _354)));
    }
    if (_363 > 1.0)
    {
        _p0 = mix(float3(_p1, _p1, _p1), _p0, float3((1.0 - _p1) / (_363 - _p1)));
    }
    return _p0;
}

static inline __attribute__((always_inline))
float3 _f15(thread const float3& _p0, thread const float3& _p1)
{
    float3 param = _p1;
    float3 param_1 = _p0;
    float param_2 = _f13(param);
    float3 _973 = _f14(param_1, param_2);
    float3 param_3 = _p1;
    float3 param_4 = _973;
    float param_5 = _f5(param_3);
    float3 _979 = _f6(param_4, param_5);
    return _979;
}

static inline __attribute__((always_inline))
float3 _f16(thread const float3& _p0, thread const float3& _p1)
{
    float3 param = _p0;
    float3 param_1 = _p1;
    float param_2 = _f13(param);
    float3 _988 = _f14(param_1, param_2);
    float3 param_3 = _p1;
    float3 param_4 = _988;
    float param_5 = _f5(param_3);
    float3 _994 = _f6(param_4, param_5);
    return _994;
}

static inline __attribute__((always_inline))
float3 _f17(thread const float3& _p0, thread const float3& _p1)
{
    float3 param = _p1;
    float3 param_1 = _p0;
    float param_2 = _f5(param);
    float3 _1003 = _f6(param_1, param_2);
    return _1003;
}

static inline __attribute__((always_inline))
float _f21(thread const float& _p0, thread const float& _p1)
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
            return 1.0 - fast::min(1.0, (1.0 - _p1) / _p0);
        }
    }
}

static inline __attribute__((always_inline))
float3 _f22(thread const float3& _p0, thread const float3& _p1)
{
    float param = _p0.x;
    float param_1 = _p1.x;
    float param_2 = _p0.y;
    float param_3 = _p1.y;
    float param_4 = _p0.z;
    float param_5 = _p1.z;
    return float3(_f21(param, param_1), _f21(param_2, param_3), _f21(param_4, param_5));
}

static inline __attribute__((always_inline))
float _f23(thread const float& _p0, thread const float& _p1)
{
    return fast::max(0.0, (_p1 + _p0) - 1.0);
}

static inline __attribute__((always_inline))
float3 _f24(thread const float3& _p0, thread const float3& _p1)
{
    float param = _p0.x;
    float param_1 = _p1.x;
    float param_2 = _p0.y;
    float param_3 = _p1.y;
    float param_4 = _p0.z;
    float param_5 = _p1.z;
    return float3(_f23(param, param_1), _f23(param_2, param_3), _f23(param_4, param_5));
}

static inline __attribute__((always_inline))
float _f25(thread const float& _p0, thread const float& _p1)
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
        return fast::min(1.0, _p1 / (1.0 - _p0));
    }
}

static inline __attribute__((always_inline))
float3 _f26(thread const float3& _p0, thread const float3& _p1)
{
    float param = _p0.x;
    float param_1 = _p1.x;
    float param_2 = _p0.y;
    float param_3 = _p1.y;
    float param_4 = _p0.z;
    float param_5 = _p1.z;
    return float3(_f25(param, param_1), _f25(param_2, param_3), _f25(param_4, param_5));
}

static inline __attribute__((always_inline))
float _f27(thread const float& _p0, thread const float& _p1)
{
    return fast::min(1.0, _p1 + _p0);
}

static inline __attribute__((always_inline))
float3 _f28(thread const float3& _p0, thread const float3& _p1)
{
    float param = _p0.x;
    float param_1 = _p1.x;
    float param_2 = _p0.y;
    float param_3 = _p1.y;
    float param_4 = _p0.z;
    float param_5 = _p1.z;
    return float3(_f27(param, param_1), _f27(param_2, param_3), _f27(param_4, param_5));
}

static inline __attribute__((always_inline))
float _f29(thread const float& _p0, thread const float& _p1)
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

static inline __attribute__((always_inline))
float3 _f30(thread const float3& _p0, thread const float3& _p1)
{
    float param = _p0.x;
    float param_1 = _p1.x;
    float param_2 = _p0.y;
    float param_3 = _p1.y;
    float param_4 = _p0.z;
    float param_5 = _p1.z;
    return float3(_f29(param, param_1), _f29(param_2, param_3), _f29(param_4, param_5));
}

static inline __attribute__((always_inline))
float _f31(thread const float& _p0, thread const float& _p1)
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

static inline __attribute__((always_inline))
float3 _f32(thread const float3& _p0, thread const float3& _p1)
{
    float param = _p0.x;
    float param_1 = _p1.x;
    float param_2 = _p0.y;
    float param_3 = _p1.y;
    float param_4 = _p0.z;
    float param_5 = _p1.z;
    return float3(_f31(param, param_1), _f31(param_2, param_3), _f31(param_4, param_5));
}

static inline __attribute__((always_inline))
float _f33(thread const float& _p0, thread const float& _p1)
{
    float _1283;
    if (_p0 <= 0.5)
    {
        _1283 = fast::min(_p1, 2.0 * _p0);
    }
    else
    {
        _1283 = fast::max(_p1, 2.0 * (_p0 - 0.5));
    }
    return _1283;
}

static inline __attribute__((always_inline))
float3 _f34(thread const float3& _p0, thread const float3& _p1)
{
    float param = _p0.x;
    float param_1 = _p1.x;
    float param_2 = _p0.y;
    float param_3 = _p1.y;
    float param_4 = _p0.z;
    float param_5 = _p1.z;
    return float3(_f33(param, param_1), _f33(param_2, param_3), _f33(param_4, param_5));
}

static inline __attribute__((always_inline))
float _f35(thread const float& _p0, thread const float& _p1)
{
    return float((_p1 + _p0) >= 1.0);
}

static inline __attribute__((always_inline))
float3 _f36(thread const float3& _p0, thread const float3& _p1)
{
    float param = _p0.x;
    float param_1 = _p1.x;
    float param_2 = _p0.y;
    float param_3 = _p1.y;
    float param_4 = _p0.z;
    float param_5 = _p1.z;
    return float3(_f35(param, param_1), _f35(param_2, param_3), _f35(param_4, param_5));
}

static inline __attribute__((always_inline))
float _f37(thread const float& _p0, thread const float& _p1)
{
    float _1356;
    if (_p0 > 0.0)
    {
        _1356 = fast::min(1.0, _p1 / _p0);
    }
    else
    {
        _1356 = 1.0;
    }
    return _1356;
}

static inline __attribute__((always_inline))
float3 _f38(thread const float3& _p0, thread const float3& _p1)
{
    float param = _p0.x;
    float param_1 = _p1.x;
    float param_2 = _p0.y;
    float param_3 = _p1.y;
    float param_4 = _p0.z;
    float param_5 = _p1.z;
    return float3(_f37(param, param_1), _f37(param_2, param_3), _f37(param_4, param_5));
}

static inline __attribute__((always_inline))
float3 _f20(thread const float3& _p0, thread const float3& _p1)
{
    float3 param = _p0;
    float3 param_1 = _p1;
    float param_2 = _f5(param);
    float3 _1039 = _f6(param_1, param_2);
    return _1039;
}

static inline __attribute__((always_inline))
float3 _f19(thread const float3& _p0, thread const float3& _p1)
{
    float3 param = _p1;
    float3 param_1 = _p0;
    return select(_p0, _p1, bool3(_f5(param) > _f5(param_1)));
}

static inline __attribute__((always_inline))
float3 _f18(thread const float3& _p0, thread const float3& _p1)
{
    float3 param = _p1;
    float3 param_1 = _p0;
    return select(_p0, _p1, bool3(_f5(param) <= _f5(param_1)));
}

static inline __attribute__((always_inline))
float _f0(thread const float2& _p0)
{
    return fract(sin(dot(_p0, float2(12.98980045318603515625, 78.233001708984375))) * 43758.546875);
}

static inline __attribute__((always_inline))
float4 _f39(thread float4& _p0, thread float4& _p1, constant int& u_enableMatte, texture2d<float> u_maskTexture, sampler u_maskTextureSmplr, thread float2& uv0, constant int& u_matteMode, constant int& u_blendMode, constant int& u_layerType, constant int& u_hasMatte, constant float& u_layerOpacity)
{
    float _1392 = _p0.w;
    float4 _1394 = _p0;
    float3 _1397 = _1394.xyz / float3(fast::max(_1392, 9.9999997473787516355514526367188e-06));
    _p0.x = _1397.x;
    _p0.y = _1397.y;
    _p0.z = _1397.z;
    float _1405 = _p1.w;
    float4 _1407 = _p1;
    float3 _1410 = _1407.xyz / float3(fast::max(_1405, 9.9999997473787516355514526367188e-06));
    _p1.x = _1410.x;
    _p1.y = _1410.y;
    _p1.z = _1410.z;
    float4 _t32 = _p1;
    if (u_blendMode == 1)
    {
        float3 _1428 = _p0.xyz + _p1.xyz;
        _t32.x = _1428.x;
        _t32.y = _1428.y;
        _t32.z = _1428.z;
    }
    else
    {
        if (u_blendMode == 2)
        {
            float3 _1444 = _p0.xyz * _p1.xyz;
            _t32.x = _1444.x;
            _t32.y = _1444.y;
            _t32.z = _1444.z;
        }
        else
        {
            if (u_blendMode == 3)
            {
                float3 _1461 = abs(_p0.xyz - _p1.xyz);
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
                    float3 _1543 = float3(_1477, _1500, _1523);
                    _t32.x = _1543.x;
                    _t32.y = _1543.y;
                    _t32.z = _1543.z;
                }
                else
                {
                    if (u_blendMode == 5)
                    {
                        float3 _1560 = fast::min(_p0.xyz, _p1.xyz);
                        _t32.x = _1560.x;
                        _t32.y = _1560.y;
                        _t32.z = _1560.z;
                    }
                    else
                    {
                        if (u_blendMode == 6)
                        {
                            float3 _1577 = fast::max(_p0.xyz, _p1.xyz);
                            _t32.x = _1577.x;
                            _t32.y = _1577.y;
                            _t32.z = _1577.z;
                        }
                        else
                        {
                            if (u_blendMode == 7)
                            {
                                float3 param = _p0.xyz;
                                float3 param_1 = _p1.xyz;
                                float3 _1596 = _f2(param, param_1);
                                _t32.x = _1596.x;
                                _t32.y = _1596.y;
                                _t32.z = _1596.z;
                            }
                            else
                            {
                                if (u_blendMode == 8)
                                {
                                    float3 param_2 = _p0.xyz;
                                    float3 param_3 = _p1.xyz;
                                    float3 _1615 = _f4(param_2, param_3);
                                    _t32.x = _1615.x;
                                    _t32.y = _1615.y;
                                    _t32.z = _1615.z;
                                }
                                else
                                {
                                    if (u_blendMode == 9)
                                    {
                                        float3 param_4 = _p0.xyz;
                                        float3 param_5 = _p1.xyz;
                                        float3 _1634 = _f15(param_4, param_5);
                                        _t32.x = _1634.x;
                                        _t32.y = _1634.y;
                                        _t32.z = _1634.z;
                                    }
                                    else
                                    {
                                        if (u_blendMode == 10)
                                        {
                                            float3 param_6 = _p0.xyz;
                                            float3 param_7 = _p1.xyz;
                                            float3 _1653 = _f16(param_6, param_7);
                                            _t32.x = _1653.x;
                                            _t32.y = _1653.y;
                                            _t32.z = _1653.z;
                                        }
                                        else
                                        {
                                            if (u_blendMode == 11)
                                            {
                                                float3 param_8 = _p0.xyz;
                                                float3 param_9 = _p1.xyz;
                                                float3 _1672 = _f17(param_8, param_9);
                                                _t32.x = _1672.x;
                                                _t32.y = _1672.y;
                                                _t32.z = _1672.z;
                                            }
                                            else
                                            {
                                                if (u_blendMode == 12)
                                                {
                                                    float3 _1695 = (_p0.xyz + _p1.xyz) - (_p0.xyz * _p1.xyz);
                                                    _t32.x = _1695.x;
                                                    _t32.y = _1695.y;
                                                    _t32.z = _1695.z;
                                                }
                                                else
                                                {
                                                    if (u_blendMode == 13)
                                                    {
                                                        float3 param_10 = _p0.xyz;
                                                        float3 param_11 = _p1.xyz;
                                                        float3 _1714 = _f22(param_10, param_11);
                                                        _t32.x = _1714.x;
                                                        _t32.y = _1714.y;
                                                        _t32.z = _1714.z;
                                                    }
                                                    else
                                                    {
                                                        if (u_blendMode == 14)
                                                        {
                                                            float3 param_12 = _p0.xyz;
                                                            float3 param_13 = _p1.xyz;
                                                            float3 _1733 = _f24(param_12, param_13);
                                                            _t32.x = _1733.x;
                                                            _t32.y = _1733.y;
                                                            _t32.z = _1733.z;
                                                        }
                                                        else
                                                        {
                                                            if (u_blendMode == 15)
                                                            {
                                                                float3 param_14 = _p0.xyz;
                                                                float3 param_15 = _p1.xyz;
                                                                float3 _1752 = _f26(param_14, param_15);
                                                                _t32.x = _1752.x;
                                                                _t32.y = _1752.y;
                                                                _t32.z = _1752.z;
                                                            }
                                                            else
                                                            {
                                                                if (u_blendMode == 16)
                                                                {
                                                                    float3 param_16 = _p0.xyz;
                                                                    float3 param_17 = _p1.xyz;
                                                                    float3 _1771 = _f28(param_16, param_17);
                                                                    _t32.x = _1771.x;
                                                                    _t32.y = _1771.y;
                                                                    _t32.z = _1771.z;
                                                                }
                                                                else
                                                                {
                                                                    if (u_blendMode == 17)
                                                                    {
                                                                        float3 param_18 = _p0.xyz;
                                                                        float3 param_19 = _p1.xyz;
                                                                        float3 _1790 = _f30(param_18, param_19);
                                                                        _t32.x = _1790.x;
                                                                        _t32.y = _1790.y;
                                                                        _t32.z = _1790.z;
                                                                    }
                                                                    else
                                                                    {
                                                                        if (u_blendMode == 18)
                                                                        {
                                                                            float3 param_20 = _p0.xyz;
                                                                            float3 param_21 = _p1.xyz;
                                                                            float3 _1809 = _f32(param_20, param_21);
                                                                            _t32.x = _1809.x;
                                                                            _t32.y = _1809.y;
                                                                            _t32.z = _1809.z;
                                                                        }
                                                                        else
                                                                        {
                                                                            if (u_blendMode == 19)
                                                                            {
                                                                                float3 param_22 = _p0.xyz;
                                                                                float3 param_23 = _p1.xyz;
                                                                                float3 _1828 = _f34(param_22, param_23);
                                                                                _t32.x = _1828.x;
                                                                                _t32.y = _1828.y;
                                                                                _t32.z = _1828.z;
                                                                            }
                                                                            else
                                                                            {
                                                                                if (u_blendMode == 20)
                                                                                {
                                                                                    float3 param_24 = _p0.xyz;
                                                                                    float3 param_25 = _p1.xyz;
                                                                                    float3 _1847 = _f36(param_24, param_25);
                                                                                    _t32.x = _1847.x;
                                                                                    _t32.y = _1847.y;
                                                                                    _t32.z = _1847.z;
                                                                                }
                                                                                else
                                                                                {
                                                                                    if (u_blendMode == 21)
                                                                                    {
                                                                                        float3 _1871 = (_p1.xyz + _p0.xyz) - ((_p1.xyz * 2.0) * _p0.xyz);
                                                                                        _t32.x = _1871.x;
                                                                                        _t32.y = _1871.y;
                                                                                        _t32.z = _1871.z;
                                                                                    }
                                                                                    else
                                                                                    {
                                                                                        if (u_blendMode == 22)
                                                                                        {
                                                                                            float3 _1889 = fast::max(float3(0.0), _p1.xyz - _p0.xyz);
                                                                                            _t32.x = _1889.x;
                                                                                            _t32.y = _1889.y;
                                                                                            _t32.z = _1889.z;
                                                                                        }
                                                                                        else
                                                                                        {
                                                                                            if (u_blendMode == 23)
                                                                                            {
                                                                                                float3 param_26 = _p0.xyz;
                                                                                                float3 param_27 = _p1.xyz;
                                                                                                float3 _1908 = _f38(param_26, param_27);
                                                                                                _t32.x = _1908.x;
                                                                                                _t32.y = _1908.y;
                                                                                                _t32.z = _1908.z;
                                                                                            }
                                                                                            else
                                                                                            {
                                                                                                if (u_blendMode == 24)
                                                                                                {
                                                                                                    float3 param_28 = _p0.xyz;
                                                                                                    float3 param_29 = _p1.xyz;
                                                                                                    float3 _1927 = _f20(param_28, param_29);
                                                                                                    _t32.x = _1927.x;
                                                                                                    _t32.y = _1927.y;
                                                                                                    _t32.z = _1927.z;
                                                                                                }
                                                                                                else
                                                                                                {
                                                                                                    if (u_blendMode == 25)
                                                                                                    {
                                                                                                        float3 param_30 = _p0.xyz;
                                                                                                        float3 param_31 = _p1.xyz;
                                                                                                        float3 _1946 = _f19(param_30, param_31);
                                                                                                        _t32.x = _1946.x;
                                                                                                        _t32.y = _1946.y;
                                                                                                        _t32.z = _1946.z;
                                                                                                    }
                                                                                                    else
                                                                                                    {
                                                                                                        if (u_blendMode == 26)
                                                                                                        {
                                                                                                            float3 param_32 = _p0.xyz;
                                                                                                            float3 param_33 = _p1.xyz;
                                                                                                            float3 _1965 = _f18(param_32, param_33);
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
                                                                                                                        float2 param_34 = uv0;
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
    float4 _t33 = float4(0.0);
    if (u_layerType == 1)
    {
        float _t34 = 1.0;
        if (u_hasMatte == 1)
        {
            float4 param_35 = float4(1.0);
            _t34 = _f11(param_35, u_enableMatte, u_maskTexture, u_maskTextureSmplr, uv0, u_matteMode).w;
        }
        float4 _2047 = mix(_p1, float4(_t32.xyz, _p0.w), float4(u_layerOpacity * _t34));
        _t33 = _2047;
        float _2049 = _t33.w;
        float3 _2052 = _2047.xyz * _2049;
        _t33.x = _2052.x;
        _t33.y = _2052.y;
        _t33.z = _2052.z;
    }
    else
    {
        float3 _2087 = (((_p1.xyz * _p1.w) * (1.0 - _p0.w)) + ((_p0.xyz * _p0.w) * (1.0 - _p1.w))) + (_t32.xyz * (_p0.w * _p1.w));
        _t33.x = _2087.x;
        _t33.y = _2087.y;
        _t33.z = _2087.z;
        _t33.w = _p0.w + (_p1.w * (1.0 - _p0.w));
    }
    return _t33;
}

fragment main0_out main0(main0_in in [[stage_in]], constant buffer_t& buffer, texture2d<float> u_maskTexture [[texture(0)]], texture2d<float> u_baseTexure [[texture(1)]], texture2d<float> u_sourceTexture [[texture(2)]], sampler u_maskTextureSmplr [[sampler(0)]], sampler u_baseTexureSmplr [[sampler(1)]], sampler u_sourceTextureSmplr [[sampler(2)]])
{
    main0_out out = {};
    float4 _t35 = float4(0.0);
    bool _2110 = buffer.u_hasBlend == 1;
    if (_2110)
    {
        if (buffer.u_hasBaseTexture == 1)
        {
            _t35 = u_baseTexure.sample(u_baseTexureSmplr, in.uv0);
        }
        if (buffer.u_hasSourceTexture == 0)
        {
            out.o_fragColor = _t35;
            return out;
        }
    }
    float4 _t36 = float4(0.0);
    if (buffer.u_hasTrs == 1)
    {
        float4x4 param = buffer.u_mvMat;
        float4x4 param_1 = buffer.u_pMat;
        float2 param_2 = in.uv0;
        float2 _2148 = _f8(param, param_1, param_2);
        float _2151 = step(buffer.u_mirrorEdge, 0.5);
        float2 param_3 = _2148;
        float2 _2161 = (_2148 * _2151) + (_f10(param_3) * (1.0 - _2151));
        float2 param_4 = _2161;
        _t36 = (u_sourceTexture.sample(u_sourceTextureSmplr, _2161) * buffer.u_alpha) * _f9(param_4);
    }
    else
    {
        if (buffer.u_hasSourceTexture == 1)
        {
            _t36 = u_sourceTexture.sample(u_sourceTextureSmplr, in.uv0);
        }
    }
    if ((buffer.u_layerType != 1) && (buffer.u_hasMatte == 1))
    {
        float4 param_5 = _t36;
        _t36 = _f11(param_5, buffer.u_enableMatte, u_maskTexture, u_maskTextureSmplr, in.uv0, buffer.u_matteMode);
    }
    if (_2110)
    {
        float4 param_6 = _t36;
        float4 param_7 = _t35;
        float4 _2199 = _f39(param_6, param_7, buffer.u_enableMatte, u_maskTexture, u_maskTextureSmplr, in.uv0, buffer.u_matteMode, buffer.u_blendMode, buffer.u_layerType, buffer.u_hasMatte, buffer.u_layerOpacity);
        _t36 = _2199;
    }
    out.o_fragColor = _t36;
    return out;
}

