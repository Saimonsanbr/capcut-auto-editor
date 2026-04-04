#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct buffer_t
{
    float3 u_redVec3;
    float3 u_greenVec3;
    float3 u_blueVec3;
};

struct main0_out
{
    float4 o_fragColor [[color(0)]];
};

struct main0_in
{
    float2 v_uv [[user(locn0)]];
};

fragment main0_out main0(main0_in in [[stage_in]], constant buffer_t& buffer, texture2d<float> u_inputTexture [[texture(0)]], sampler u_inputTextureSmplr [[sampler(0)]])
{
    main0_out out = {};
    float4 _19 = u_inputTexture.sample(u_inputTextureSmplr, in.v_uv);
    float4 _t1 = _19;
    float3 _24 = _19.xyz;
    _t1.x = dot(_24, buffer.u_redVec3);
    _t1.y = dot(_24, buffer.u_greenVec3);
    _t1.z = dot(_24, buffer.u_blueVec3);
    out.o_fragColor = fast::clamp(_t1, float4(0.0), float4(1.0));
    return out;
}

