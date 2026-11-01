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
    float u_horizontalFlag;
    float u_verticalFlag;
    float u_horizontalType;
    float u_horizontalIntensity;
    float u_verticalType;
    float u_verticalIntensity;
    float4 u_ScreenParams;
    float u_edgeType;
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
float _f2(thread const float4& _p0, thread const float& _p1)
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

static inline __attribute__((always_inline))
float _f0(thread const float2& _p0)
{
    float2 _t0 = step(float2(0.0), _p0) * step(_p0, float2(1.0));
    return _t0.x * _t0.y;
}

static inline __attribute__((always_inline))
float4 _f1(texture2d<float> _p0, sampler _p0Smplr, thread float2& _p1)
{
    _p1 = mod(_p1, float2(2.0));
    _p1 = mix(_p1, float2(2.0) - _p1, step(float2(1.0), _p1));
    return _p0.sample(_p0Smplr, fract(_p1));
}

fragment main0_out main0(main0_in in [[stage_in]], constant buffer_t& buffer, texture2d<float> u_horizontalImage [[texture(0)]], texture2d<float> u_verticalImage [[texture(1)]], texture2d<float> u_InputTexture [[texture(2)]], sampler u_horizontalImageSmplr [[sampler(0)]], sampler u_verticalImageSmplr [[sampler(1)]], sampler u_InputTextureSmplr [[sampler(2)]])
{
    main0_out out = {};
    float4 _t1 = u_horizontalImage.sample(u_horizontalImageSmplr, in.uv0);
    float4 _t2 = u_verticalImage.sample(u_verticalImageSmplr, in.uv0);
    if (buffer.u_horizontalFlag < 0.5)
    {
        _t1 = float4(0.5);
    }
    if (buffer.u_verticalFlag < 0.5)
    {
        _t2 = float4(0.5);
    }
    float4 param = _t1;
    float param_1 = buffer.u_horizontalType;
    float4 param_2 = _t2;
    float param_3 = buffer.u_verticalType;
    float2 _167 = float2(in.uv0.x + (((_f2(param, param_1) - 0.5) * 2.0) * buffer.u_horizontalIntensity), in.uv0.y + (((((_f2(param_2, param_3) - 0.5) * 2.0) * buffer.u_verticalIntensity) * buffer.u_ScreenParams.x) / buffer.u_ScreenParams.y));
    if (buffer.u_edgeType < 0.5)
    {
        float2 param_4 = _167;
        out.o_fragColor = u_InputTexture.sample(u_InputTextureSmplr, _167) * _f0(param_4);
    }
    else
    {
        float2 param_5 = _167;
        float4 _186 = _f1(u_InputTexture, u_InputTextureSmplr, param_5);
        out.o_fragColor = _186;
    }
    return out;
}

