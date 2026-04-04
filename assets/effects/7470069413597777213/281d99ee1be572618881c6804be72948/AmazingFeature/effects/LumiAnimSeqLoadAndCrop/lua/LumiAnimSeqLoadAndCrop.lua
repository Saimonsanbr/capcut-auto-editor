local isEditor = (Amaz.Macros and Amaz.Macros.EditorSDK) and true or false
local exports = exports or {}
local LumiAnimSeqLoadAndCrop = LumiAnimSeqLoadAndCrop or {}
LumiAnimSeqLoadAndCrop.__index = LumiAnimSeqLoadAndCrop
---@class LumiAnimSeqLoadAndCrop : ScriptComponent
---@field animSeqType string [UI(Option={"Video", "Image", "Texture"})]
---@field cropType string [UI(Option={"Stretch", "Fill", "Fit", "Texture Size"})]
---@field edgeType string [UI(Option={"Tile", "Mirror", "Clamp", "Empty"})]
---@field pivot Vector2f
---@field position Vector2f
---@field rotation double [UI(Range={0, 360}, Drag)] 
---@field scale double [UI(Range={0, 5}, Drag)]
---@field opacity double [UI(Range={0, 1}, Drag)]
---@field playMode string [UI(Option={"once", "loop"})]
---@field speed double [UI(Range={0.001, 10}, Drag)]
---@field seqTime number [UI(Range={0, 100}, Drag)]
---@field enableVideoAlphaBlend boolean
---@field videoFilename String
---@field animSeq AnimSeq
---@field seqTex Texture
---@field InputTex Texture
---@field OutputTex Texture

local AE_EFFECT_TAG = 'AE_EFFECT_TAG LumiTag'

local animSeqTypeName = {
    "Video", "Image", "Texture",
}
setmetatable(animSeqTypeName, {__index = function(_, _) return animSeqTypeName[1] end})
local animSeqTypeIndex = {}
for index, value in ipairs(animSeqTypeName) do animSeqTypeIndex[value] = index - 1 end
setmetatable(animSeqTypeIndex, {
    __index = function(_, key)
        Amaz.LOGE(AE_EFFECT_TAG, 'Unsupported AnimSeqType: ' .. key)
        return 0
    end
})

local cropTypeName = {
    "Stretch", "Fill", "Fit", "Texture Size"
}
setmetatable(cropTypeName, {__index = function(_, _) return cropTypeName[1] end})
local cropTypeIndex = {}
for index, value in ipairs(cropTypeName) do cropTypeIndex[value] = index - 1 end
setmetatable(cropTypeIndex, {
    __index = function(_, key)
        Amaz.LOGE(AE_EFFECT_TAG, "Unsupported SeqCrop Type: " .. key)
        return 0
    end
})

local edgeTypeName = {
    "Tile", "Mirror", "Clamp", "Empty",
}
setmetatable(edgeTypeName, {__index = function(_, _) return edgeTypeName[1] end})
local edgeTypeIndex = {}
for index, value in ipairs(edgeTypeName) do edgeTypeIndex[value] = index - 1 end
setmetatable(edgeTypeIndex, {
    __index = function(_, key)
        Amaz.LOGE(AE_EFFECT_TAG, "Unsupported Edge Type: " .. key)
        return 0
    end
})

local playModeName = {
    "once", "loop"
}
setmetatable(playModeName, {__index = function(_, _) return playModeName[1] end})
local playModeIndex = {}
for index, value in ipairs(playModeName) do playModeIndex[value] = index - 1 end
setmetatable(playModeIndex, {
    __index = function(_, key)
        Amaz.LOGE(AE_EFFECT_TAG, "Unsupported Play Mode: " .. key)
        return 0
    end
})

function LumiAnimSeqLoadAndCrop.new(construct, ...)
    local self = setmetatable({}, LumiAnimSeqLoadAndCrop)

    self.AEPlugin = false
    self.seqTime = 0.0
    self.globalRotation = 0.0
    self.globalScale = 1.0
    self.globalOpacity = 1.0
    self.globalSpeed = 1.0

    self.paramInitInfo = {
        {'specify', false},
        {'animSeqType', 'Texture'},
        {'cropType', 'Stretch'},
        {'edgeType', 'Empty'},
        {'pivot', Amaz.Vector2f(0.5, 0.5)},
        {'position', Amaz.Vector2f(0.5, 0.5)},
        {'rotation', 0},
        {'scale', 1.0},
        {'opacity', 1.0},
        {'playMode', 'loop'},
        {'speed', 1.0},
        -- Video seq
        {'videoFilename', ''},
        {'enableVideoAlphaBlend', false},
        -- Image seq
        {'animSeq', nil},
        -- Texture
        {'seqTex', nil},
    }

    self.multiAspect = {
        ['5.8'] = 1.125 / 2.436, -- 0.4618
        ['9_16'] = 9 / 16, -- 0.5625
        ['3_4'] = 3 / 4, -- 0.75
        ['1_1'] = 1,
        ['4_3'] = 4 / 3, -- 1.3333
        ['16_9'] = 16 / 9, -- 1.7778
        ['1.85_1'] = 1.85,
        ['2_1'] = 2,
        ['2.35_1'] = 2.35,
    }

    for i = 1, #self.paramInitInfo do
        self[self.paramInitInfo[i][1]] = self.paramInitInfo[i][2]
    end

    for key, _ in pairs(self.multiAspect) do
        for i = 1, #self.paramInitInfo do
            self[self.paramInitInfo[i][1] .. '_' .. key] = self.paramInitInfo[i][2]
        end
    end

    self.needUpdateSize = true
    self.InputTex = nil
    self.OutputTex = nil

    return self
end

function LumiAnimSeqLoadAndCrop:onStart(comp)
    self.entity = comp.entity
    self.TAG = AE_EFFECT_TAG .. ' ' .. self.entity.name

    self.camera = self.entity:searchEntity("AnimSeqCamera"):getComponent("Camera")
    self.material = self.entity:searchEntity('AnimSeqPass'):getComponent('MeshRenderer').material
    self.videoAnim = self.entity:searchEntity("AnimSeqPass"):getComponent("VideoAnimSeq")
    self.seqAnim = self.entity:searchEntity("AnimSeqPass"):getComponent("AnimSeqComponent")
end

function LumiAnimSeqLoadAndCrop:setEffectAttr(key, value, comp)
    local function _setEffectAttr(_key, _value, _force)
        if _force or self[_key] ~= nil then
            self[_key] = _value
            if comp and comp.properties ~= nil then
                comp.properties:set(_key, _value)
            end
        end
    end

    if self[key] ~= nil then
        if key:sub(1, #'cropType') == 'cropType' then
            local type = cropTypeName[value + 1]
            _setEffectAttr(key, type)
        elseif key:sub(1, #'edgeType') == 'edgeType' then
            local type = edgeTypeName[value + 1]
            _setEffectAttr(key, type)
        elseif key:sub(1, #'animSeqType') == 'animSeqType' then
            local type = animSeqTypeName[value + 1]
            _setEffectAttr(key, type)
        elseif key:sub(1, #'playMode') == 'playMode' then
            local type = playModeName[value + 1]
            _setEffectAttr(key, type)
        else
            _setEffectAttr(key, value)
        end
    elseif key:sub(1, #'seqTex') == 'seqTex'
        or key:sub(1, #'animSeq') == 'animSeq'
    then
        _setEffectAttr(key, value, true)
    else
        _setEffectAttr(key, value)
    end
end

function LumiAnimSeqLoadAndCrop:afterAnimSeqSystemUpdate(comp)
    if self.animSeqType == "Image" then
        if self.needUpdateSize and self.material then
            local seqTex = self.material:getTex("u_seqTexture")
            self.material:setVec2("u_seqTexSize", Amaz.Vector2f(seqTex.width, seqTex.height))
            seqTex = nil
            self.needUpdateSize = false
        end
    end
end

function LumiAnimSeqLoadAndCrop:onUpdate(comp, deltaTime)
    if self.OutputTex then
        self.camera.renderTexture = self.OutputTex
    end

    local w = self.camera.renderTexture.width
    local h = self.camera.renderTexture.height

    local ratio = w / h
    local paramFlag = ''
    local _diff = math.huge
    for key, value in pairs(self.multiAspect) do
        if self['specify_' .. key] then
            local diff = math.abs(ratio - value)
            if diff < _diff then
                _diff = diff
                paramFlag = key
            end
        end
    end

    -- update parameters based on resolution
    if paramFlag == '' then
        if self.AEPlugin then
            Amaz.LOGE(self.TAG, 'No aspect specified' .. ', ratio: ' .. ratio .. ', reset params!')
            for i = 1, #self.paramInitInfo do
                self[self.paramInitInfo[i][1]] = self.paramInitInfo[i][2]
            end
        else
            Amaz.LOGE(self.TAG, 'No aspect specified' .. ', ratio: ' .. ratio)
        end
    else
        for i = 1, #self.paramInitInfo do
            self[self.paramInitInfo[i][1]] = self[self.paramInitInfo[i][1] .. '_' .. paramFlag]
        end
    end

    if self.AEPlugin then
        self.animSeqType = 'Texture'
    end

    self.material:setTex("u_inputTexture", self.InputTex)
    self.material:setInt('u_cropType', cropTypeIndex[self.cropType])
    self.material:setInt('u_edgeType', edgeTypeIndex[self.edgeType])
    self.material:setFloat('u_opacity', self.opacity * self.globalOpacity)
    self.material:setVec2('u_scale', Amaz.Vector2f(self.scale, self.scale) * self.globalScale)
    self.material:setVec2('u_pivot', self.pivot - Amaz.Vector2f(0.5, 0.5))
    self.material:setVec2('u_position', self.position - Amaz.Vector2f(0.5, 0.5))
    self.material:setFloat('u_rotation', math.rad(self.rotation + self.globalRotation))

    local playMode = Amaz.PlayMode.loop
    if self.playMode == 'once' then
        playMode = Amaz.PlayMode.once
    end

    local speed = self.speed * self.globalSpeed

    if self.animSeqType == "Video" then
        self.videoAnim.enabled = true
        self.seqAnim.enabled = false

        if not isEditor then
            self.videoAnim.enableFixedSeekMode = true
        end
        if self.videoAnim.videoFilename ~= self.videoFilename then
            self.videoAnim.videoFilename = self.videoFilename
        end
        if self.videoAnim.enableAlphaBlend ~= self.enableVideoAlphaBlend then
            self.videoAnim.enableAlphaBlend = self.enableVideoAlphaBlend
        end
        if self.videoAnim.playmode ~= playMode then
            self.videoAnim.playmode = playMode
        end
        if self.videoAnim.speed ~= speed then
            self.videoAnim.speed = speed
        end
        local frames = self.videoAnim:getFrameCount()
        local duration = self.videoAnim:getDuration()
        local videoFps = frames / duration * 1000
        self.videoAnim:seekToTime(self.seqTime + 0.5 / videoFps)
        local videoSize = self.videoAnim:getVideoSize()
        if self.videoAnim.enableAlphaBlend then
            videoSize.x = videoSize.x / 2
        end
        self.material:setVec2("u_seqTexSize", videoSize)
        self.material:setInt("u_convertAlpha", 0)
        self.material:setInt('u_yFlip', 1)
    elseif self.animSeqType == "Image" then
        self.videoAnim.enabled = false
        self.seqAnim.enabled = true

        if self.seqAnim.animSeq ~= self.animSeq then
            self.seqAnim.animSeq = self.animSeq
            self.needUpdateSize = true
        end
        if self.seqAnim.playmode ~= playMode then
            self.seqAnim.playmode = playMode
        end
        if self.seqAnim.speed ~= speed then
            self.seqAnim.speed = speed
        end
        self.seqAnim:seekToTime(self.seqTime + 0.5 / self.animSeq.fps)
        self.material:setInt('u_yFlip', 1)
    elseif self.animSeqType == "Texture" then
        self.videoAnim.enabled = false
        self.seqAnim.enabled = false

        if self.seqTex then
            self.material:setTex("u_seqTexture", self.seqTex)
            local videoSize = Amaz.Vector2f(self.seqTex.width, self.seqTex.height)
            if self.enableVideoAlphaBlend then
                videoSize.x = videoSize.x / 2
            end
            self.material:setVec2("u_seqTexSize", videoSize)
            self.material:setInt("u_convertAlpha", self.enableVideoAlphaBlend and 1 or 0)
        else
            self.material:setVec2('u_scale', Amaz.Vector2f(0, 0))
        end
        self.material:setInt('u_yFlip', 0)
    end
end

exports.LumiAnimSeqLoadAndCrop = LumiAnimSeqLoadAndCrop
return exports
