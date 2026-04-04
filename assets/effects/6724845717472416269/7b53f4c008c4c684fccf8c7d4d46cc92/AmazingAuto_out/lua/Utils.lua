local exports = exports or {}
local Utils = Utils or {}
Utils.__index = Utils

function Utils.new(construct, ...)
    local self = setmetatable({}, Utils)
    self.comps = {}
    self.compsdirty = true
    _G.utils = self
    return self
end

local runSys = Amaz.Platform.name()
_G.isDebug = false

_G.printAmazing = function(...)
    local arg = {...}
    local tag = "sadGE"
    local msg = "[" .. tag .. "]:"
    for k, v in pairs(arg) do
        msg = msg .. tostring(v) .. " "
    end

    if runSys == "Mac" and isDebug == true then
        Amaz.LOGE(tag, msg)
    elseif isDebug == true then
        EffectSdk.LOG_LEVEL(6, msg)
    end
end

_G.myV =
    [[
    precision highp float;

    attribute vec3 attPosition;
    attribute vec2 attUV;

    varying vec2 uv0;

    void main() {
        gl_Position = vec4(attPosition,1.0);
        uv0 = attUV.xy;
    }
    ]]
_G.InF =
    [[
    precision highp float;
    varying vec2 uv0;
    uniform sampler2D _MainTex;


    void main(void)
    {
        //  
        gl_FragColor = texture2D(_MainTex,vec2(uv0.x,uv0.y));
    }

    ]]
_G.RevF =
    [[
    precision highp float;
    varying vec2 uv0;
    uniform sampler2D _MainTex;


    void main(void)
    {
        gl_FragColor = texture2D(_MainTex,vec2(uv0.x,1.0-uv0.y));
    }

    ]]
_G.blitAllRev =
    [[
    precision highp float;
    varying vec2 uv0;
    uniform sampler2D _MainTex;
    uniform sampler2D _InputTex;

    void main(void)
    {
        vec2 uv1=vec2(uv0.x,1.0-uv0.y);
        vec4 base = texture2D(_InputTex,uv1);
        vec4 blend = texture2D(_MainTex,uv1);
        gl_FragColor =vec4(base.rgb*(1.0-blend.a)+blend.rgb*blend.a,1.0);
    }

    ]]
_G.blitNoRev =
    [[
    precision highp float;
    varying vec2 uv0;
    uniform sampler2D _MainTex;
    uniform sampler2D _InputTex;

    void main(void)
    {
        vec4 base = texture2D(_InputTex,uv0);
        vec4 blend = texture2D(_MainTex,uv0);
        gl_FragColor =vec4(base.rgb*(1.0-blend.a)+blend.rgb*blend.a,1.0);
    }

    ]]
_G.blitMeRev =
    [[
    precision highp float;
    varying vec2 uv0;
    uniform sampler2D _MainTex;
    uniform sampler2D _InputTex;

    void main(void)
    {
        vec2 uv1=vec2(uv0.x,1.0-uv0.y);
        vec4 base = texture2D(_InputTex,uv0);
        vec4 blend = texture2D(_MainTex,uv1);
        gl_FragColor =vec4(base.rgb*(1.0-blend.a)+blend.rgb*blend.a,1.0);
    }

    ]]
_G.blitHeRev =
    [[
    precision highp float;
    varying vec2 uv0;
    uniform sampler2D _MainTex;
    uniform sampler2D _InputTex;

    void main(void)
    {
        vec2 uv1=vec2(uv0.x,1.0-uv0.y);
        vec4 base = texture2D(_InputTex,uv1);
        vec4 blend = texture2D(_MainTex,uv0);
        gl_FragColor =vec4(base.rgb*(1.0-blend.a)+blend.rgb*blend.a,1.0);
    }

    ]]

_G.pass = function(vert, frag)
    local blitPass = Amaz.Pass()
    local vs = Amaz.Shader()
    vs.type = Amaz.ShaderType.VERTEX
    vs.source = vert
    local fs = Amaz.Shader()
    fs.type = Amaz.ShaderType.FRAGMENT
    fs.source = frag

    local shaders = Amaz.Map()
    local shaderList = Amaz.Vector()
    shaderList:pushBack(vs)
    shaderList:pushBack(fs)
    shaders:insert("gles2", shaderList)

    blitPass.shaders = shaders
    local seman = Amaz.Map()
    seman:insert("attPosition", Amaz.VertexAttribType.POSITION)
    seman:insert("attUV", Amaz.VertexAttribType.TEXCOORD0)
    blitPass.semantics = seman
    local renderState = Amaz.RenderState()
    -- --depth state
    -- local depthStencilState = Amaz.DepthStencilState()
    -- local colorBlendState = Amaz.ColorBlendState()
    -- local colorBlendAttachmentState = Amaz.ColorBlendAttachmentState()
    -- colorBlendAttachmentState.blendEnable = true
    -- colorBlendAttachmentState.srcColorBlendFactor = Amaz.BlendFactor.SRC_ALPHA
    -- colorBlendAttachmentState.dstColorBlendFactor = Amaz.BlendFactor.ONE_MINUS_SRC_ALPHA
    -- colorBlendAttachmentState.srcAlphaBlendFactor = Amaz.BlendFactor.SRC_ALPHA
    -- colorBlendAttachmentState.dstAlphaBlendFactor = Amaz.BlendFactor.ONE_MINUS_SRC_ALPHA
    -- colorBlendAttachmentState.colorWriteMask = 15
    -- colorBlendAttachmentState.ColorBlendOp = Amaz.BlendOp.ADD
    -- colorBlendAttachmentState.AlphaBlendOp = Amaz.BlendOp.ADD
    -- colorBlendState.attachments:pushBack(colorBlendAttachmentState)

    -- depthStencilState.depthTestEnable = false
    -- renderState.depthstencil = depthStencilState
    -- renderState.colorBlend = colorBlendState
    blitPass.renderState = renderState
    return blitPass
end
_G.material = function(vert, frag, name)
    local blitMaterial = Amaz.Material()
    local blitXShader = Amaz.XShader()
    blitMaterial.name = name
    blitXShader.passes:pushBack(pass(vert, frag))
    blitMaterial.xshader = blitXShader
    return blitMaterial
end
_G.renderTexture = function(name, width, height)
    printAmazing("addTex", name)
    local rt = Amaz.RenderTexture()
    rt.name = name
    -- rt.massMode = Amaz.MSAAMode.NONE
    -- rt.colorFormat = Amaz.PixelFormat.RGBA8Unorm
    -- rt.realColorFormat = Amaz.PixelFormat.RGBA8Unorm

    rt.width = width * 1
    rt.height = height * 1

    -- rt.depth = 1
    -- rt.internalFormat = Amaz.InternalFormat.RGBA8
    -- rt.dataType = Amaz.DataType.U8norm
    -- rt.builtinType = Amaz.BuiltInTextureType.NORAML

    -- rt.enableMipmap = false
    -- depth texture
    rt.attachment = Amaz.RenderTextureAttachment.NONE
    -- rt.attachment = Amaz.RenderTextureAttachment.DEPTH24
    -- rt.filterMin = Amaz.FilterMode.FilterMode_LINEAR
    -- rt.filterMag = Amaz.FilterMode.FilterMode_LINEAR
    -- rt.filterMipmap = Amaz.FilterMipmapMode.FilterMode_NONE

    -- rt.wrapModeS = Amaz.WrapMode.Mirror
    -- rt.wrapModeT = Amaz.WrapMode.Mirror
    -- rt.wrapModeR = Amaz.WrapMode.Mirror

    rt:setShared(false)

    return rt
end
_G.createRectMesh = function()
    -- create Mesh
    local mesh = Amaz.Mesh()
    local pos = Amaz.VertexAttribDesc()
    pos.semantic = Amaz.VertexAttribType.POSITION
    local uv = Amaz.VertexAttribDesc()
    uv.semantic = Amaz.VertexAttribType.TEXCOORD0
    local vads = Amaz.Vector()
    vads:pushBack(pos)
    vads:pushBack(uv)
    mesh.vertexAttribs = vads
    local vertexData = {
        1.0,
        -1.0,
        0.0,
        1.0,
        1.0,
        1.0,
        1.0,
        0.0,
        1.0,
        0.0,
        -1.0,
        1.0,
        0.0,
        0.0,
        0.0,
        -1.0,
        -1.0,
        0.0,
        0.0,
        1.0
    }
    local fv = Amaz.FloatVector()
    for i = 1, table.getn(vertexData) do
        fv:pushBack(vertexData[i])
    end
    mesh.vertices = fv

    -- create SubMesh
    local subMesh = Amaz.SubMesh()
    subMesh.primitive = Amaz.Primitive.TRIANGLES
    local indexData = {
        0,
        1,
        2,
        2,
        3,
        0
    }
    local indices = Amaz.UInt16Vector()
    for i = 1, table.getn(indexData) do
        indices:pushBack(indexData[i])
    end
    subMesh.indices16 = indices
    subMesh.mesh = mesh
    mesh:addSubMesh(subMesh)
    return mesh
end
_G.createRectMesh2 = function()
    -- create Mesh
    local mesh = Amaz.Mesh()
    local pos = Amaz.VertexAttribDesc()
    pos.semantic = Amaz.VertexAttribType.POSITION
    local uv = Amaz.VertexAttribDesc()
    uv.semantic = Amaz.VertexAttribType.TEXCOORD0
    local vads = Amaz.Vector()
    vads:pushBack(pos)
    vads:pushBack(uv)
    mesh.vertexAttribs = vads
    local vertexData = {
        1.0,
        -1.0,
        0.0,
        1.0,
        0.0,
        1.0,
        1.0,
        0.0,
        1.0,
        1.0,
        -1.0,
        1.0,
        0.0,
        0.0,
        1.0,
        -1.0,
        -1.0,
        0.0,
        0.0,
        0.0
    }
    local fv = Amaz.FloatVector()
    for i = 1, table.getn(vertexData) do
        fv:pushBack(vertexData[i])
    end
    mesh.vertices = fv

    -- create SubMesh
    local subMesh = Amaz.SubMesh()
    subMesh.primitive = Amaz.Primitive.TRIANGLES
    local indexData = {
        0,
        1,
        2,
        2,
        3,
        0
    }
    local indices = Amaz.UInt16Vector()
    for i = 1, table.getn(indexData) do
        indices:pushBack(indexData[i])
    end
    subMesh.indices16 = indices
    subMesh.mesh = mesh
    mesh:addSubMesh(subMesh)
    return mesh
end

_G.file = function(sys, name, flag)
    local fname = sys.scene.assetMgr.rootDir
    local ftable = {}
    local flist = string.gmatch(fname, "(.-)/")
    for s in flist do
        if s ~= nil then
            table.insert(ftable, s)
        end
    end
    local newname = ""
    for i = 1, #ftable do
        newname = newname .. ftable[i] .. "/"
    end

    newname = newname .. (flag == true and "" or "xshader/") .. name
    -- printAmazing("try to open", newname)
    local text = ""
    local hasFile = false
    local myfile = io.open(newname)
    if myfile ~= nil then
        hasFile = true
        for line in io.lines(newname) do
            text = text .. line .. "\n"
        end
        myfile:close()
    end
    return text, hasFile
end

_G.isNumStr = function(str)
    local flag = true
    if str == nil or str == "" then
        return false
    else
        for i = 0, 9 do
            if str == tostring(i) then
                return true
            end
        end
    end
end

_G.isSeqName = function(str)
    local formatCnt = 0
    local reStr = ""
    -- -5  .png
    local reverseStr = string.reverse(string.sub(str, 0, -5))
    local len = reverseStr.len(reverseStr)

    for i = 1, len do
        local char = string.sub(reverseStr, i, i)
        if isNumStr(char) == true then
            formatCnt = formatCnt + 1
        else
            local reReverse = string.sub(reverseStr, i)
            reStr = string.reverse(reReverse)
            break
        end
    end
    return formatCnt > 0, formatCnt, reStr
end

exports.Utils = Utils
return exports
