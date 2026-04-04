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
    int u_yFlip;
    int u_convertAlpha;
    float4 u_ScreenParams;
    float2 u_scale;
    float u_rotation;
    float2 u_position;
    float2 u_pivot;
    float2 u_seqTexSize;
    int u_cropType;
    int u_edgeType;
    float u_opacity;
};

struct main0_out
{
    float4 o_fragColor [[color(0)]];
};

struct main0_in
{
    float2 uv0 [[user(locn0)]];
};

static inline __attribute__((always_inline))
float2 _f4(thread float2& _p0, thread const float& _p1, thread const float2& _p2, thread const float2& _p3, thread const float2& _p4, constant float4& u_ScreenParams)
{
    _p0 -= _p2;
    _p0 -= float2(0.5);
    _p0.y *= (u_ScreenParams.y / u_ScreenParams.x);
    float _172 = sin(_p1);
    float _175 = cos(_p1);
    _p0 = float2x2(float2(_175, _172), float2(-_172, _175)) * _p0;
    _p0.y *= (u_ScreenParams.x / u_ScreenParams.y);
    _p0 /= _p4;
    _p0 += float2(0.5);
    _p0 += _p3;
    return _p0;
}

static inline __attribute__((always_inline))
float2 _f2(thread const float2& _p0)
{
    float2 _125 = mod(_p0, float2(1.0));
    return _125 + (float2(1.0) - step(float2(0.0), _125));
}

static inline __attribute__((always_inline))
float2 _f1(thread const float2& _p0)
{
    return abs(mod(_p0 - float2(1.0), float2(2.0)) - float2(1.0));
}

static inline __attribute__((always_inline))
float4 _f0(thread float2& _p0, constant int& u_yFlip, constant int& u_convertAlpha, texture2d<float> u_seqTexture, sampler u_seqTextureSmplr)
{
    if (u_yFlip == 1)
    {
        _p0 = float2(_p0.x, 1.0 - _p0.y);
    }
    if (u_convertAlpha == 0)
    {
        return u_seqTexture.sample(u_seqTextureSmplr, _p0);
    }
    float4 _t2;
    _t2.w = u_seqTexture.sample(u_seqTextureSmplr, float2(_p0.x * 0.5, _p0.y)).x;
    float _99 = _t2.w;
    float3 _100 = u_seqTexture.sample(u_seqTextureSmplr, float2((_p0.x * 0.5) + 0.5, _p0.y)).xyz * _99;
    _t2.x = _100.x;
    _t2.y = _100.y;
    _t2.z = _100.z;
    return _t2;
}

static inline __attribute__((always_inline))
float _f3(thread const float2& _p0)
{
    float2 _t4 = step(float2(0.0), _p0) * step(_p0, float2(1.0));
    return _t4.x * _t4.y;
}

fragment main0_out main0(main0_in in [[stage_in]], constant buffer_t& buffer, texture2d<float> u_seqTexture [[texture(0)]], sampler u_seqTextureSmplr [[sampler(0)]])
{
    main0_out out = {};
    bool _217 = abs(buffer.u_scale.x) < 9.9999997473787516355514526367188e-05;
    bool _225;
    if (!_217)
    {
        _225 = abs(buffer.u_scale.y) < 9.9999997473787516355514526367188e-05;
    }
    else
    {
        _225 = _217;
    }
    if (_225)
    {
        out.o_fragColor = float4(0.0);
        return out;
    }
    float2 param = in.uv0;
    float param_1 = buffer.u_rotation;
    float2 param_2 = buffer.u_position;
    float2 param_3 = buffer.u_pivot;
    float2 param_4 = buffer.u_scale;
    float2 _248 = _f4(param, param_1, param_2, param_3, param_4, buffer.u_ScreenParams);
    float2 _t8 = _248;
    float _255 = buffer.u_seqTexSize.x / buffer.u_seqTexSize.y;
    float _261 = buffer.u_ScreenParams.x / buffer.u_ScreenParams.y;
    float2 _t11 = _248;
    if (buffer.u_cropType == 1)
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
        if (buffer.u_cropType == 2)
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
            if (buffer.u_cropType == 3)
            {
                _t11 -= float2(0.5);
                _t11.x *= (buffer.u_ScreenParams.x / buffer.u_seqTexSize.x);
                _t11.y *= (buffer.u_ScreenParams.y / buffer.u_seqTexSize.y);
                _t11 += float2(0.5);
            }
        }
    }
    if (buffer.u_edgeType == 0)
    {
        float2 param_5 = _t11;
        _t11 = _f2(param_5);
    }
    else
    {
        if (buffer.u_edgeType == 1)
        {
            float2 param_6 = _t11;
            _t11 = _f1(param_6);
        }
    }
    float2 param_7 = _t11;
    float4 _392 = _f0(param_7, buffer.u_yFlip, buffer.u_convertAlpha, u_seqTexture, u_seqTextureSmplr);
    float4 _t16 = _392;
    if (buffer.u_edgeType == 3)
    {
        float2 param_8 = _t11;
        _t16 *= _f3(param_8);
    }
    float4 _404 = _t16;
    float4 _405 = _404 * buffer.u_opacity;
    _t16 = _405;
    out.o_fragColor = _405;
    return out;
}

