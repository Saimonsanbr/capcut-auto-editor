#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct buffer_t
{
    float u_highlight;
    float4 u_ScreenParams;
    float u_geometricMeanSize;
    float2 u_center;
    float u_roundness;
    float u_halfDiagonalLength;
    float u_midpoint;
    float u_featherPower;
    float u_featherPivot;
    float u_opacity;
    int u_transparent;
    float3 u_color;
};

struct main0_out
{
    float4 o_fragColor [[color(0)]];
};

struct main0_in
{
    float2 v_uv [[user(locn0)]];
};

static inline __attribute__((always_inline))
float _f5(thread const float2& _p0, thread float& _p1, constant float4& u_ScreenParams, constant float& u_geometricMeanSize)
{
    float _t12 = 0.0;
    if (_p1 >= 0.0)
    {
        _t12 = length(_p0 * float2(mix(1.0, u_ScreenParams.x / u_geometricMeanSize, _p1), mix(1.0, u_ScreenParams.y / u_geometricMeanSize, _p1)));
    }
    else
    {
        _p1 = abs(_p1);
        float _260 = fast::min(u_ScreenParams.x, u_ScreenParams.y);
        float _264 = _260 / fast::max(u_ScreenParams.x, u_ScreenParams.y);
        float _267 = 1.0 - _264;
        float _272 = 0.5 / fast::max(_264, 9.9999997473787516355514526367188e-06);
        float _274 = _p1;
        float _278 = fast::min(_274 / fast::max(_267, 9.9999997473787516355514526367188e-06), 1.0);
        float _296 = ((-0.699999988079071044921875) * _264) + 0.959999978542327880859375;
        _p1 *= _296;
        float _310 = fast::max(_p1 - _267, 0.0);
        float _318 = (_310 / (_296 - _267)) * (((-0.0900000035762786865234375) * _264) - 0.23000000417232513427734375);
        float2 _t30 = float2(0.0);
        if (u_ScreenParams.x >= u_ScreenParams.y)
        {
            _t30 = float2(_p1, _310) * _272;
        }
        else
        {
            _t30 = float2(_310, _p1) * _272;
        }
        float2 _348 = ((abs(_p0) * float2(mix(1.0, u_ScreenParams.x / _260, _278), mix(1.0, u_ScreenParams.y / _260, _278))) - _t30) + float2(_318);
        float2 _t31 = _348;
        _t12 = (length(fast::max(_348, float2(0.0))) + fast::min(fast::max(_t31.x, _t31.y), 0.0)) - _318;
    }
    return _t12;
}

static inline __attribute__((always_inline))
float _f4(thread const float& _p0, thread const float& _p1, thread const float& _p2)
{
    float _t9 = 0.0;
    if (_p0 < _p2)
    {
        _t9 = _p2 * pow(_p0 / fast::max(_p2, 9.9999997473787516355514526367188e-06), _p1);
    }
    else
    {
        float _203 = 1.0 - _p2;
        _t9 = 1.0 - (_203 * pow((1.0 - _p0) / fast::max(_203, 9.9999997473787516355514526367188e-06), _p1));
    }
    return _t9;
}

static inline __attribute__((always_inline))
float _f0(thread const float3& _p0)
{
    return dot(_p0, float3(0.2125999927520751953125, 0.715200006961822509765625, 0.072200000286102294921875));
}

static inline __attribute__((always_inline))
float _f1(thread const float& _p0, thread const float& _p1)
{
    return pow(_p0, (2.0 - _p1) / fast::max(_p1, 9.9999997473787516355514526367188e-06));
}

static inline __attribute__((always_inline))
float _f2(thread const float& _p0, thread const float& _p1, thread const int& _p2)
{
    float _t0 = 0.0;
    if (_p2 == 0)
    {
        _t0 = ((-54.743000030517578125) * pow(_p0, 1.0110800266265869140625)) + (55.585399627685546875 * _p0);
    }
    else
    {
        _t0 = (0.22255100309848785400390625 * pow(_p0, 0.708339989185333251953125)) + (0.0225530005991458892822265625 * _p0);
    }
    float _96 = _t0;
    float _101 = mix(_96, 1.0, _p0 * _p1);
    _t0 = _101;
    return fast::clamp(_101, 0.0, 1.0);
}

static inline __attribute__((always_inline))
float _f3(thread const float3& _p0, constant float& u_highlight)
{
    float3 param = _p0;
    float _109 = _f0(param);
    float param_1 = _p0.x;
    float param_2 = 0.20000000298023223876953125;
    float param_3 = _p0.y;
    float param_4 = 0.300000011920928955078125;
    float param_5 = _p0.z;
    float param_6 = 0.300000011920928955078125;
    float param_7 = u_highlight;
    float param_8 = _109;
    int param_9 = 1;
    float param_10 = u_highlight;
    float param_11 = _109;
    int param_12 = 0;
    float param_13 = u_highlight;
    float param_14 = _109;
    int param_15 = 0;
    return (((_f2(param_7, param_8, param_9) * _f1(param_1, param_2)) + (_f2(param_10, param_11, param_12) * _f1(param_3, param_4))) + (_f2(param_13, param_14, param_15) * _f1(param_5, param_6))) / fast::max((_p0.x + _p0.y) + _p0.z, 9.9999997473787516355514526367188e-06);
}

static inline __attribute__((always_inline))
float4 _f6(thread const float4& _p0, thread const float4& _p1)
{
    float4 _t32 = float4(0.0);
    _t32.w = _p0.w + (_p1.w * (1.0 - _p0.w));
    float _394 = _t32.w;
    float3 _397 = ((_p0.xyz * _p0.w) + (_p1.xyz * ((1.0 - _p0.w) * _p1.w))) / float3(fast::max(_394, 9.9999997473787516355514526367188e-06));
    _t32.x = _397.x;
    _t32.y = _397.y;
    _t32.z = _397.z;
    return _t32;
}

fragment main0_out main0(main0_in in [[stage_in]], constant buffer_t& buffer, texture2d<float> u_inputTexture [[texture(0)]], sampler u_inputTextureSmplr [[sampler(0)]])
{
    main0_out out = {};
    float4 _t33 = u_inputTexture.sample(u_inputTextureSmplr, in.v_uv);
    float2 param = in.v_uv - buffer.u_center;
    float param_1 = buffer.u_roundness;
    float _427 = _f5(param, param_1, buffer.u_ScreenParams, buffer.u_geometricMeanSize);
    float _437 = fast::clamp(_427 / (buffer.u_halfDiagonalLength + buffer.u_midpoint), 0.0, 1.0);
    float _t35 = _437;
    float param_2 = _437;
    float param_3 = buffer.u_featherPower;
    float param_4 = buffer.u_featherPivot;
    _t35 = _f4(param_2, param_3, param_4) * buffer.u_opacity;
    if (buffer.u_transparent == 0)
    {
        float3 param_5 = _t33.xyz;
        float _464 = _t35;
        float _465 = _464 * (1.0 - (_f3(param_5, buffer.u_highlight) * buffer.u_highlight));
        _t35 = _465;
        float4 param_6 = float4(buffer.u_color, _465);
        float4 param_7 = _t33;
        _t33 = _f6(param_6, param_7);
    }
    else
    {
        _t33.w *= (1.0 - _t35);
    }
    out.o_fragColor = fast::clamp(_t33, float4(0.0), float4(1.0));
    return out;
}

