local isEditor = (Amaz.Macros and Amaz.Macros.EditorSDK) and true or false
local exports = exports or {}
local LumiManager = LumiManager or {}
LumiManager.__index = LumiManager
---@class LumiManager : ScriptComponent
---@field debugTime number [UI(Range={0, 6}, Drag)]
---@field autoPlay boolean
---@field lumiEffectRoot Transform
---@field start_render_layer int
---@field start_render_order int

local AE_EFFECT_TAG = 'AE_EFFECT_TAG LumiTag'

local EffectType = {
    Effect = 'effect',
    Transition = 'transition',
    VideoAnimation = 'videoAnimation',
    EffectXT = 'xtEffect',
    FilterXT = 'xtFilter',
}

local AnimationMode = {
    Once = 0,
    Loop = 1,
    StretchOnce = 2,
    StretchLoop = 3,
}

local function clamp(val, min, max)
    return math.min(math.max(val, min), max)
end

local function remap(value, srcMin, srcMax, dstMin, dstMax)
    return dstMin + (value - srcMin) * (dstMax - dstMin) / (srcMax - srcMin)
end

local function handleAllEntityBySingleParent(_trans, func, ...)
    if _trans.children:size() > 0 then
        for i = 1, _trans.children:size() do
            local child = _trans.children:get(i-1)
            handleAllEntityBySingleParent(child, func, ...)
        end
    end
    func(_trans, ...)
end

local function intervalIntersection(intervals1, intervals2)
    local result = {}
    local i = 1
    local j = 1

    while i <= #intervals1 and j <= #intervals2 do
        local start1 = intervals1[i][1]
        local end1 = intervals1[i][2]
        local start2 = intervals2[j][1]
        local end2 = intervals2[j][2]

        local start = math.max(start1, start2)
        local end_ = math.min(end1, end2)

        if start <= end_ then
            table.insert(result, {start, end_})
        end
        if end1 < end2 then
            i = i + 1
        else
            j = j + 1
        end
    end
    return result
end

function LumiManager.new(construct, ...)
    local self = setmetatable({}, LumiManager)

    self.lumiEffectRoot = nil
    self.start_render_layer = 1
    self.start_render_order = 1

    self.InputTex = nil
    self.OutputTex = nil
    self.PingPongTex = nil

    self.startTime = 0.0
    self.endTime = 6.0
    self.curTime = 0.0

    self.speed = 1.0
    self.animationMode = AnimationMode.Once
    self.autoPlay = true
    self.debugTime = 0.0

    -- for XT
    self.cameraStartTime = 0
    self.lastCycle = -1

    return self
end

function LumiManager:getKeyframeAeTime(aeTime)
    if self.isReverseKeyframes ~= true then
        return aeTime
    end
    return self.compDurations[1] + self.compDurations[2] - aeTime
end

function LumiManager:onStart(comp)
    self.entity = comp.entity

    self.lumi_obj_extension = includeRelativePath("LumiObjectExtension")
    self.lumi_obj = nil

    self.keyframes = nil
    self.durations = nil
    self.params = nil
    self.compDurations = {0, 6}
    self.animationInfos = 0
    self.sliderInfos = {}
    self.fadeinInfos = {}
    self.fadeoutInfos = {}
    self.effectType = "effect"
    self.transitionInputIndex = {}

    self.LumiParamsSetter = includeRelativePath("LumiParamsSetter")
    local ae_export_data = includeRelativePath("LumiExportData")
    if ae_export_data then
        if ae_export_data.ae_keyframes then
            local ae_tools = includeRelativePath("AETools")
            if ae_tools then
                self.keyframes = ae_tools.new(ae_export_data.ae_keyframes)
            end
        end
        if ae_export_data.ae_reverseKeyframes ~= nil then
            self.isReverseKeyframes = ae_export_data.ae_reverseKeyframes
        end
        if ae_export_data.ae_durations ~= nil then
            self.durations = ae_export_data.ae_durations
        end
        if ae_export_data.ae_attribute ~= nil then
            self.params = ae_export_data.ae_attribute
        end
        if ae_export_data.ae_compDurations ~= nil then
            self.compDurations = ae_export_data.ae_compDurations
            self.compDurations[2] = self.compDurations[2]
        end
        if ae_export_data.ae_animationInfos ~= nil then
            self.animationInfos = ae_export_data.ae_animationInfos
            self.animationMode = self.animationInfos.animationMode
            self.loopStart = self.animationInfos.loopStart
            self.speed = self.animationInfos.speedInfo[1]
        end
        if ae_export_data.ae_sliderInfos ~= nil then
            self.sliderInfos = ae_export_data.ae_sliderInfos
        end
        if ae_export_data.ae_fadeinInfos ~= nil then
            self.fadeinInfos = ae_export_data.ae_fadeinInfos
        end
        if ae_export_data.ae_fadeoutInfos ~= nil then
            self.fadeoutInfos = ae_export_data.ae_fadeoutInfos
        end
        if ae_export_data.ae_effectType ~= nil then
            self.effectType = ae_export_data.ae_effectType
        end
        if ae_export_data.ae_cameraMode ~= nil then
            self.cameraMode = ae_export_data.ae_cameraMode
        end
        if ae_export_data.ae_transitionInputIndex ~= nil then
            self.transitionInputIndex = ae_export_data.ae_transitionInputIndex
        end
    end
    if self.LumiParamsSetter then
        self.lumi_params_setter = self.LumiParamsSetter.new(
            self,
            self.params,
            self.keyframes,
            self.effectType,
            self.sliderInfos,
            self.fadeinInfos,
            self.fadeoutInfos
        )
    end

    if self.effectType == EffectType.VideoAnimation then
        local baseEntity = self.entity:searchEntity('base')
        local videoCamera = baseEntity:searchEntity('videoCamera'):getComponent('Camera')
        local videoRenderer = baseEntity:searchEntity('video'):getComponent('MeshRenderer')
        local modelCamera = baseEntity:searchEntity('modelCamera'):getComponent('Camera')
        local modelRenderer = baseEntity:searchEntity('model'):searchEntity('quad'):getComponent('MeshRenderer')
        local fxaaCamera = baseEntity:searchEntity('fxaaCamera'):getComponent('Camera')
        local fxaaRenderer = baseEntity:searchEntity('fxaa'):getComponent('MeshRenderer')
        local bgCamera = baseEntity:searchEntity('bgCamera'):getComponent('Camera')
        local bgRenderer = baseEntity:searchEntity('bg'):getComponent('MeshRenderer')
        local blendCamera = baseEntity:searchEntity('blendCamera'):getComponent('Camera')
        local blendRenderer = baseEntity:searchEntity('blend'):getComponent('MeshRenderer')
        self.videoAnimationCameraAndRenderer = {
            { camera = videoCamera, renderer = videoRenderer },
            { camera = modelCamera, renderer = modelRenderer },
            { camera = fxaaCamera, renderer = fxaaRenderer },
            { camera = bgCamera, renderer = bgRenderer },
            { camera = blendCamera, renderer = blendRenderer },
        }
    end
end

function LumiManager:onDestroy(comp)
    if self.lumiEffectRoot and self.lumi_obj_extension then
        self.lumi_obj_extension.deregister(self.lumiEffectRoot.entity)
    end
    self.lumi_obj = nil
    self.LumiParamsSetter = nil
end

function LumiManager:getCameraCount()
    if self.lumiEffectRoot == nil then
        Amaz.LOGE(AE_EFFECT_TAG, 'Lumi Effect Root is nil, please check')
        return 0
    end

    self.lumi_obj = nil
    self:ReRender()

    local cam_count = 0
    if self.lumi_obj then
        cam_count = self.lumi_obj:getCameraCount()
        Amaz.LOGI(AE_EFFECT_TAG, self.lumi_obj.entity.name .. " camera_count: " .. tostring(cam_count))
    end
    return cam_count
end

function LumiManager:ReRender()
    if self.lumiEffectRoot == nil then
        Amaz.LOGE(AE_EFFECT_TAG, 'Lumi Effect Root is nil, please check')
        return
    end

    -- re register
    self.lumi_obj = nil
    self:registerLumiObj(self.lumiEffectRoot, 1)

    if self.lumi_obj == nil then
        Amaz.LOGE(AE_EFFECT_TAG, 'No lumi_obj register')
        return
    end

    -- change layer & order
    self:updateCameraLayerAndOrder()

    -- change rt pingpong
    self:updateRtPingpong()
end

function LumiManager:registerLumiObj(_trans, _idx)
    if _trans == nil then return end
    local script_comp = _trans.entity:getComponent("ScriptComponent")
    if script_comp then
        local lua_obj = Amaz.ScriptUtils.getLuaObj(script_comp:getScript())
        if lua_obj then
            self.lumi_obj_extension.deregister(_trans.entity)
            self.lumi_obj = self.lumi_obj_extension.register(_trans.entity)
        end
    end
end

local function _setLayer(_cam, _layer)
    local str = "1"
    for i = 1, _layer do
        str = str.."0"
    end
    local dynamic_bitset = Amaz.DynamicBitset.new(str)

    _cam.layerVisibleMask = dynamic_bitset
end

function LumiManager:updateCameraLayerAndOrder()
    if self.lumi_obj then
        local cur_start_layer, cur_start_order = self.lumi_obj:updateCameraLayerAndOrder(self.start_render_layer, self.start_render_order)

        if self.effectType == EffectType.VideoAnimation then
            cur_start_layer = cur_start_layer + 10
            cur_start_order = cur_start_order + 10

            for i = 1, #self.videoAnimationCameraAndRenderer do
                local cameraAndRenderer = self.videoAnimationCameraAndRenderer[i]
                local camera = cameraAndRenderer.camera
                local renderer = cameraAndRenderer.renderer
                camera.renderOrder = cur_start_order
                _setLayer(camera, cur_start_layer)
                renderer.entity.layer = cur_start_layer
                cur_start_order = cur_start_order + 1
                cur_start_layer = cur_start_layer + 1
            end
        end
    end
end

function LumiManager:updateRtPingpong()
    if self.lumi_obj then
        self.lumi_obj:updateRt(self.InputTex, self.OutputTex, self.PingPongTex)
    end
end

function LumiManager:updateOutputRtSize()
    if self.lumi_obj then
        self.lumi_obj:updateOutputRtSize(self.width, self.height)
    end
end

function LumiManager:initVideoAnimationLua(comp)
    local modelEntity = comp.entity:searchEntity("model")
    if modelEntity then 
        local scriptComp = modelEntity:getComponent("ScriptComponent")
        if scriptComp then 
            self.videoAnimationLua = Amaz.ScriptUtils.getLuaObj(scriptComp:getScript())
        end
    end
end

function LumiManager:onUpdate(comp, deltaTime)
    if self.lumiEffectRoot == nil then
        Amaz.LOGE(AE_EFFECT_TAG, 'Lumi Effect Root is nil, please check')
        return
    end

    if self.lumi_obj == nil then
        self:registerLumiObj(self.lumiEffectRoot, 1)
        self:updateCameraLayerAndOrder()
    end

    if self.durations and not self.isSetDuration then
        for entityName, durationMap in pairs(self.durations) do
            local isLumiLayer = string.sub(entityName, 1, string.len('LumiLayer')) == 'LumiLayer'
            if isLumiLayer then
                local texDuration = durationMap['texDuration']
                local srcDuration = texDuration['InputTex']
                local baseDuration = texDuration['baseTex']
                local maskDuration = texDuration['maskTex']
                if srcDuration then
                    self.lumi_obj:setSubEffectAttr(entityName, 'srcDuration', srcDuration)
                end
                if baseDuration then
                    self.lumi_obj:setSubEffectAttr(entityName, 'baseDuration', baseDuration)
                end
                if maskDuration then
                    local matteDuration = intervalIntersection(maskDuration, srcDuration)
                    self.lumi_obj:setSubEffectAttr(entityName, 'matteDuration', matteDuration)
                end
            end
        end
        self.isSetDuration = true
    end

    local w = Amaz.BuiltinObject.getInputTextureWidth()
    local h = Amaz.BuiltinObject.getInputTextureHeight()
    if self.InputTex then
        w = self.InputTex.width
        h = self.InputTex.height
    end
    if self.OutputTex and (self.OutputTex.width ~= w or self.OutputTex.height ~= h) then
        Amaz.LOGE(AE_EFFECT_TAG, 'Invalid rt size, input: ' .. w .. 'x' .. h .. ', output: ' .. self.OutputTex.width .. 'x' .. self.OutputTex.height)
    end
    if self.width == nil or self.width ~= w or self.height == nil or self.height ~= h then
        self.width = w
        self.height = h
        self:updateOutputRtSize()
    end

    self.curTime = self.curTime + deltaTime
    if isEditor then
        self.curTime = self.curTime % self.endTime
    end
    local curTime = (self.curTime - self.startTime) * self.speed + self.startTime
    local startTime = self.startTime
    local endTime = (self.endTime - self.startTime) * self.speed + self.startTime

    if self.cameraMode then
        if self.animationMode ~= AnimationMode.Loop then
            Amaz.LOGE(AE_EFFECT_TAG, 'Camera mode is not support animationMode: ' .. tostring(self.animationMode))
            return
        end
        curTime = self.curTime - self.cameraStartTime
        endTime = math.huge
    elseif self.effectType == EffectType.EffectXT or self.effectType == EffectType.FilterXT then -- deprecated after 1810 in XT
        startTime = 0
        if self.isVideo then
            endTime = self.videoTime
        else
            endTime = 3
        end
    end
    
    local aeTime = curTime;
    if endTime < curTime then
        aeTime = math.max(self.compDurations[1], self.compDurations[2] - (self.endTime - self.curTime))
    else
        local aeDuration = math.max(0.001, self.compDurations[2] - self.compDurations[1])
        local lvDuration = math.max(0.001, endTime - startTime)
        if self.animationMode == AnimationMode.Once then
            aeTime = self.compDurations[1] + curTime - startTime
            aeTime = math.min(aeTime, self.compDurations[2])
        elseif self.animationMode == AnimationMode.Loop then
            if self.cameraMode then
                local cycle = math.floor((curTime - startTime) / aeDuration)
                if self.lastCycle ~= cycle then
                    self.lastCycle = cycle
                    comp.entity.scene:sendMessage(4999, 1, 0, '')
                end
            end
            if math.floor((curTime - startTime) / aeDuration) < 1 then
                aeTime = self.compDurations[1] + (curTime - startTime) % aeDuration
            else
                local curLoopStart = (self.loopStart - self.compDurations[1]) * self.speed + self.compDurations[1]
                aeTime = self.loopStart + (curTime - startTime - curLoopStart) % (aeDuration - self.loopStart)
            end
        elseif self.animationMode == AnimationMode.StretchOnce then
            aeTime = remap(curTime, startTime, self.endTime, self.compDurations[1], self.compDurations[2])
            aeTime = clamp(aeTime, self.compDurations[1], self.compDurations[2])
        elseif self.animationMode == AnimationMode.StretchLoop then
            local newCurTime = startTime + (curTime - startTime) * self.speed % lvDuration
            aeTime = remap(newCurTime, startTime, endTime, self.compDurations[1], self.compDurations[2])

            if math.floor((curTime - startTime) * self.speed / lvDuration) >= 1 then
                aeTime = self.compDurations[1] + (aeTime - self.compDurations[1]) % (self.compDurations[2] - self.loopStart) + self.loopStart
            end
        end
    end

    if self.effectType == EffectType.Transition then
        local input1 = Amaz.BuiltinObject.getUserTexture("#TransitionInput0")
        local input2 = Amaz.BuiltinObject.getUserTexture("#TransitionInput1")
        if input1 and input2 then
            for index, transitionInputInfo in ipairs(self.transitionInputIndex) do
                local entityName = transitionInputInfo[1]
                local texName = transitionInputInfo[2]
                local inputIndex = transitionInputInfo[3]
                if inputIndex == 0 then
                    self.lumi_obj:setSubEffectAttr(entityName, texName, input1)
                    self.lumi_obj:setSubEffectAttr(entityName, 'algoSlot', 0)
                else
                    self.lumi_obj:setSubEffectAttr(entityName, texName, input2)
                    self.lumi_obj:setSubEffectAttr(entityName, 'algoSlot', 1)
                end
            end
            aeTime = Amaz.Input.frameTimestamp * (self.compDurations[2]-self.compDurations[1]) + self.compDurations[1]
        end
    elseif self.effectType == EffectType.VideoAnimation then
        if self.videoAnimationLua == nil then
            self:initVideoAnimationLua(comp)
        end
        if self.videoAnimationLua ~= nil then
            aeTime = remap(self.videoAnimationLua.curTime, 0, self.videoAnimationLua.duration, self.compDurations[1], self.compDurations[2])
        end
    end

    if isEditor then
        if self.autoPlay then
            self.debugTime = curTime % (self.compDurations[2]-self.compDurations[1]) + self.compDurations[1]
            aeTime = self.debugTime
        else
            aeTime = self.debugTime
        end
    elseif self.effectType == EffectType.VideoAnimation or self.effectType == EffectType.Transition then
        self.curTime = aeTime
    end

    if self.lumi_obj then
        self.lumi_obj:setEffectAttrRecursively("startTime", self.startTime)
        self.lumi_obj:setEffectAttrRecursively("endTime", self.endTime)
        self.lumi_obj:setEffectAttrRecursively("curTime", self.curTime)
        self.lumi_obj:setEffectAttrRecursively("aeTime", aeTime)
    end

    if self.lumi_params_setter and self.lumi_params_setter.initParams then
        self.lumi_params_setter:initParams(self.lumi_obj)
    end
    if self.lumi_params_setter and self.lumi_params_setter.updateKeyFrameData then
        self.lumi_params_setter:updateKeyFrameData(self.lumi_obj, aeTime)
    end
    if self.lumi_params_setter and self.lumi_params_setter.updateSlider then
        self.lumi_params_setter:updateSlider(self.lumi_obj, aeTime)
    end
    if self.lumi_params_setter and self.lumi_params_setter.updateFade then
        if self.effectType == EffectType.Effect then
            self.lumi_params_setter:updateFade(self.lumi_obj, self.startTime, self.endTime, self.curTime, self.compDurations, aeTime)
        end
    end

    if self.lumi_obj and self.durations~= nil then
        aeTime = math.min(math.max(aeTime, self.compDurations[1]), self.compDurations[2])
        for entityName, durationMap in pairs(self.durations) do
            local nodeDuration = durationMap['nodeDuration']
            local visible = false
            for j = 1, #nodeDuration do
                if nodeDuration[j][1] <= aeTime and aeTime < nodeDuration[j][2] then
                    visible = true
                    break
                end
            end
            self.lumi_obj:setVisible(entityName, visible)
        end
    end
    if self.lumi_obj and self.lumi_obj.updateMaterials then
        self.lumi_obj:updateMaterials(deltaTime)
    end
end

-- function LumiManager:onLateUpdate(comp, deltaTime)
    -- collectgarbage("collect")
-- end

function LumiManager:onEvent(comp, event)
    if self.lumiEffectRoot == nil then
        Amaz.LOGE(AE_EFFECT_TAG, 'Lumi Effect Root is nil, please check')
        return
    end

    if self.lumi_obj == nil then
        self:registerLumiObj(self.lumiEffectRoot, 1)
        self:updateCameraLayerAndOrder()
    end

    if self.lumi_obj == nil then
        Amaz.LOGE(AE_EFFECT_TAG, 'Failed to find lumi_obj')
        return
    end

    if self.effectType == EffectType.Effect then
        if event.args:get(0) == 'effects_adjust_speed' then
            local value = event.args:get(1)
            if self.animationInfos then
                if value < 0 or value > 1 then
                    Amaz.LOGE(AE_EFFECT_TAG, 'Invalid effects_adjust_speed value: ' .. value)
                end
                self.speed = remap(clamp(value, 0, 1), 0, 1, self.animationInfos.speedInfo[2], self.animationInfos.speedInfo[3])
            else
                self.speed = value
            end
        end
    elseif event.args:get(0) == 'start_time' and self.cameraMode then
        self.cameraStartTime = event.args:get(2)
    elseif event.args:get(0) == 'is_video' and (self.effectType == EffectType.EffectXT or self.effectType == EffectType.FilterXT) then -- deprecated after 1810 in XT
        self.isVideo = event.args:get(2)
    elseif event.args:get(0) == 'video_time' and (self.effectType == EffectType.EffectXT or self.effectType == EffectType.FilterXT) then -- deprecated after 1810 in XT
        self.videoTime = event.args:get(2)
    end

    if self.lumi_params_setter and self.lumi_params_setter.onEvent then
        self.lumi_params_setter:onEvent(self.lumi_obj, event)
    end
end

exports.LumiManager = LumiManager
return exports
