local exports = exports or {}
local SadGE = SadGE or {}
local json = cjson.new()
SadGE.__index = SadGE

function SadGE.new(construct, ...)
    local self = setmetatable({}, SadGE)
    self.comps = {}
    self.compsdirty = true
    return self
end

local considerTemplate = false
local curP = 0
local p = 0
local duration = 1
local tmp1 = true

-- buffer
local reTmpRt = nil
local transRt = nil
local passTmpRt = nil
local isEndUp = false
local bufferInit = 0
-- protocol list

--region
local GEProtocolList = {}
GEProtocolList.init = function(sys)
    local width = Amaz.BuiltinObject:getInputTextureWidth()
    local height = Amaz.BuiltinObject:getInputTextureHeight()
    GEProtocolList[200] = math.floor(width)
    GEProtocolList[201] = math.floor(height)
    GEProtocolList[300] = 1 / width
    GEProtocolList[301] = 1 / height
    GEProtocolList[3007] = 0
    GEProtocolList["frame"] = 0
end
GEProtocolList.update = function(deltaTime)
    if isDebug == true then
        curP = (curP + deltaTime) % duration
        p = curP / duration
        GEProtocolList[3007] = p
    else
        curP = 0
        GEProtocolList[3007] = Amaz.Input.frameTimestamp
    end
end
--endregion

function SadGE:constructor()
end

function SadGE:onComponentAdded(sys, comp)
    if comp:isInstanceOf("Camera") and self.cameraComp == nil and comp.entity.name == "Camera_entity" then
        self.cameraComp = comp
    end
end

function SadGE:checkOnStart(sys, index, effect, key, uniform)
    local t = uniform.type
    if t == 1 then
        self.filterTex = sys.scene.assetMgr:SyncLoad("xshader/" .. uniform.data[1])
        self.mats[index]:setTex(uniform.name, self.filterTex)
    elseif t == 2 then
        if GEProtocolList[uniform.name] == nil then
            self.mats[index]:setInt(uniform.name, uniform.data[1])
        end
    elseif t == 3 then
        if GEProtocolList[uniform.name] == nil then
            self.mats[index]:setFloat(uniform.name, uniform.data[1])
        end
    elseif t == 4 then
        self.mats[index]:setVec2(uniform.name, Amaz.Vector2f(uniform.data[1], uniform.data[2]))
    elseif t == 5 then
        self.mats[index]:setVec3(uniform.name, Amaz.Vector3f(uniform.data[1], uniform.data[2], uniform.data[3]))
    elseif t >= 200 and t < 300 then
        self.mats[index]:setInt(uniform.name, GEProtocolList[t])
    elseif t == 1000 then
        if effect.passId ~= 1 then
            local rtFromPassName = effect.inputEffect[uniform.inputEffectIndex + 1]
            local prePass = self.geInfo.effect[rtFromPassName]
            local viewport = prePass.viewport
            printAmazing("viewport", viewport)
            if viewport == nil then
                viewport = {0, 0, 1, 1}
            end
            local texWidth = self.outputTex.width * viewport[3]
            local texHeight = self.outputTex.height * viewport[4]

            if prePass.passId ~= effect.passId - 1 then
                prePass.needRt = true
                prePass.rt = renderTexture(rtFromPassName .. "Exclusive", texWidth, texHeight)
            else
                if viewport[3] ~= 1 or viewport[4] ~= 1 then
                    prePass.needRt = true
                    prePass.rt = renderTexture(rtFromPassName .. "Viewport", texWidth, texHeight)
                end
            end
        else
            printAmazing("ERROR! passId == 1, but use tex 1000")
        end
    end
end

function SadGE:onStart(sys)
    self.duration = duration
    self.passCnt = 0

    local output_rt = sys.scene:getOutputRenderTexture()
    output_rt.attachment = Amaz.RenderTextureAttachment.NONE

    self.cmdBuf = Amaz.CommandBuffer()
    sys:addScriptListener(self.cameraComp, Amaz.CameraEvent.BEFORE_RENDER, "cameraCallBack", sys)

    GEProtocolList.init(sys)

    local geTable = file(sys, "generalEffect.json")
    self.geInfo = json.decode(geTable)

    -- local viewport = self.geInfo.effect[1].viewport
    self.outputTex = self.cameraComp.renderTexture
    -- if viewport == nil then
    --     viewport = {0, 0, 1, 1}
    -- end
    self.width = self.outputTex.width
    self.height = self.outputTex.height

    self.tmpTex1 = renderTexture("tmp", self.width, self.height)
    self.tmpTex2 = renderTexture("tmp2", self.width, self.height)

    self.mats = {}
    self.input = {}
    if isDebug == true then
        self.input[0] = sys.scene.assetMgr:SyncLoad("image/1.png")
        self.input[1] = sys.scene.assetMgr:SyncLoad("image/2.png")
    else
        local input1 = Amaz.BuiltinObject.getUserTexture("#TransitionInput0")
        local input2 = Amaz.BuiltinObject.getUserTexture("#TransitionInput1")
        self.input[0] = input1
        self.input[1] = input2
    end

    self.passCnt = #self.geInfo.effect
    for index, effect in ipairs(self.geInfo.effect) do
        self.geInfo.effect[effect.name] = effect
        effect.passId = index
        printAmazing("add", effect.name)
        local vert = file(sys, effect.vertexShader)
        local frag = file(sys, effect.fragmentShader)
        self.mats[index] = material(vert, frag, effect.name)
        self.mats[effect.name] = self.mats[index]

        for key, uniform in pairs(effect.vUniforms) do
            self:checkOnStart(sys, index, effect, key, uniform)
        end
        for key, uniform in pairs(effect.fUniforms) do
            self:checkOnStart(sys, index, effect, key, uniform)
        end
    end

    self.normMesh = createRectMesh2()
    self.model = Amaz.Matrix4x4f()
    self.model:setIdentity()
end

function SadGE:onUpdate(sys, deltaTime)
    GEProtocolList.update(deltaTime)
end

function SadGE:checkOnCallback(sys, index, effect, key, uniform)
    local t = uniform.type

    if t == 2 then
        if GEProtocolList[uniform.name] ~= nil then
            self.mats[index]:setInt(uniform.name, GEProtocolList[uniform.name])
        end
    elseif t == 3 then
        if GEProtocolList[uniform.name] ~= nil then
            self.mats[index]:setFloat(uniform.name, GEProtocolList[uniform.name])
        end
    elseif t == 4 then
        if GEProtocolList[uniform.name] ~= nil then
            self.mats[index]:setVec2(
                uniform.name,
                Amaz.Vector2f(GEProtocolList[uniform.name][1], GEProtocolList[uniform.name][2])
            )
        end
    elseif t == 5 then
        if GEProtocolList[uniform.name] ~= nil then
            self.mats[index]:setVec2(
                uniform.name,
                Amaz.Vector3f(
                    GEProtocolList[uniform.name][1],
                    GEProtocolList[uniform.name][2],
                    GEProtocolList[uniform.name][3]
                )
            )
        end
    elseif t == 100 then
        local useInput = self.input[0]
        if considerTemplate == true and GEProtocolList[3007] > 0.5 then
            useInput = self.input[1]
        end
        self.mats[index]:setTex(uniform.name, useInput)
    elseif t == 103 then
        self.mats[index]:setTex(uniform.name, self.input[uniform.inputTextureIndex])
    elseif t == 1000 then
        local rtFromPassName = effect.inputEffect[uniform.inputEffectIndex + 1]
        local prevRt
        if self.geInfo.effect[rtFromPassName].needRt == nil then
            prevRt = tmp1 == true and self.tmpTex1 or self.tmpTex2
        else
            prevRt = self.geInfo.effect[rtFromPassName].rt
        end
        self.mats[index]:setTex(uniform.name, prevRt)
    elseif t == 3007 then
        self.mats[index]:setFloat(uniform.name, GEProtocolList[t])
    end
end

function SadGE:cameraCallBack(sys, camera, eventType)
    if eventType == Amaz.CameraEvent.BEFORE_RENDER then
        tmp1 = true
        local input1 = Amaz.BuiltinObject.getUserTexture("#TransitionInput0")
        local input2 = Amaz.BuiltinObject.getUserTexture("#TransitionInput1")

        if input1 and input2 then
            self.input[0] = input1
            self.input[1] = input2
        end

        for index, effect in ipairs(self.geInfo.effect) do
            for key, uniform in pairs(effect.vUniforms) do
                self:checkOnCallback(sys, index, effect, key, uniform)
            end
            for key, uniform in pairs(effect.fUniforms) do
                self:checkOnCallback(sys, index, effect, key, uniform)
            end

            if effect.passId == self.passCnt then
                passTmpRt = self.outputTex
            else
                passTmpRt = (effect.needRt == nil and (tmp1 == true and self.tmpTex2 or self.tmpTex1) or effect.rt)
            end

            if bufferInit == 0 then
                self.cmdBuf:setRenderTexture(passTmpRt)
                self.cmdBuf:clearRenderTexture(true, false, Amaz.Vector4f(0, 0, 0, 0), 0)
                self.cmdBuf:drawMesh(self.normMesh, self.model, self.mats[index], 0, 0, nil)
            end
            tmp1 = not tmp1
        end
        if bufferInit == 0 then
            bufferInit = 1
        end
        sys.scene:commitCommandBuffer(self.cmdBuf)
    end
end

exports.SadGE = SadGE
return exports
