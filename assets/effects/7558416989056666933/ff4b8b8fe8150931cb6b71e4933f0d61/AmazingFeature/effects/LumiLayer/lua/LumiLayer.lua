local exports = exports or {}
local LumiLayer = LumiLayer or {}
LumiLayer.__index = LumiLayer
---@class LumiLayer : ScriptComponent
---@field hasTransform boolean
---@field active_cam_fovx number
---@field compositeSize Vector2f
---@field layerSize Vector2f
---@field anchorPoint Vector3f
---@field orientation Vector3f
---@field position Vector3f
---@field scale Vector3f
---@field xRotation number [UI(Range={-360, 360}, Drag)]
---@field yRotation number [UI(Range={-360, 360}, Drag)]
---@field rotation number [UI(Range={-360, 360}, Drag)]
---@field opacity number [UI(Range={0, 100}, Drag)]
---@field mirrorEdge boolean
---@field hasMatte boolean
---@field matteMode string [UI(Option={"Alpha Matte", "Luma Matte", "Alpha Inverted Matte", "Luma Inverted Matte"})]
---@field maskTex Texture
---@field hasBlend boolean
---@field blendMode string [UI(Option={"Normal", "Add", "Multiply", "Difference", "Overlay", "Darken", "Lighten", "Soft Light", "Hard Light", "Hue", "Saturation", "Color", "Screen", "Color Burn", "Linear Burn", "Color Dodge", "Linear Dodge", "Vivid Light", "Linear Light", "Pin Light", "Hard Mix", "Exclusion", "Subtract", "Divide", "Luminosity", "Lighter Color", "Darker Color", "Dissolve"})]
---@field layerType string [UI(Option={"Adjustment", "Precomp", "Solid", "Image", "Video", "Sequence"})]
---@field baseTex Texture
---@field InputTex Texture
---@field OutputTex Texture

local AE_EFFECT_TAG = 'AE_EFFECT_TAG LumiTag'

local MatteMode = {
    "Alpha Matte", "Luma Matte", "Alpha Inverted Matte", "Luma Inverted Matte",
}
setmetatable(MatteMode, {__index = function(_, _) return MatteMode[1] end})

local MatteModeIndex = {}
for index, value in ipairs(MatteMode) do MatteModeIndex[value] = index - 1 end
setmetatable(MatteModeIndex, {
    __index = function(_, key)
        Amaz.LOGE(AE_EFFECT_TAG, "Unsupported matte mode: " .. key)
        return 0
    end
})

local BlendMode = {
    "Normal", "Add", "Multiply", "Difference", "Overlay", "Darken", "Lighten", "Soft Light", "Hard Light", "Hue", "Saturation", "Color", "Screen", "Color Burn", "Linear Burn", "Color Dodge", "Linear Dodge", "Vivid Light", "Linear Light", "Pin Light", "Hard Mix", "Exclusion", "Subtract", "Divide", "Luminosity", "Lighter Color", "Darker Color", "Dissolve",
}
setmetatable(BlendMode, {__index = function(_, _) return BlendMode[1] end})

local BlendModeIndex = {}
for index, value in ipairs(BlendMode) do BlendModeIndex[value] = index - 1 end
setmetatable(BlendModeIndex, {
    __index = function(_, key)
        Amaz.LOGE(AE_EFFECT_TAG, "Unsupported blend mode: " .. key)
        return 0
    end
})

local LayerType = {
    "Adjustment", "Precomp", "Solid", "Image", "Video", "Sequence",
}

local function clamp(val, min, max)
    return math.min(math.max(val, min), max)
end

function LumiLayer.new(construct, ...)
    local self = setmetatable({}, LumiLayer)

    self.TAG = AE_EFFECT_TAG

    self.InputTex = nil
    self.OutputTex = nil
    self.aeTime = -1

    -- TRS
    self.hasTransform = false
    self.active_cam_fovx = 39.6
    self.compositeSize = Amaz.Vector2f(1080, 1080)
    self.layerSize = Amaz.Vector2f(1080, 1080)

    self.anchorPoint = Amaz.Vector3f(0, 0, 0)
    self.position = Amaz.Vector3f(0, 0, 0)
    self.scale = Amaz.Vector3f(100, 100, 100)
    self.orientation = Amaz.Vector3f(0, 0, 0)
    self.rotation = 0
    self.xRotation = 0
    self.yRotation = 0
    self.opacity = 100

    self.p0_anchorPoint = Amaz.Vector3f(0, 0, 0)
    self.p0_position = Amaz.Vector3f(0, 0, 0)
    self.p0_scale = Amaz.Vector3f(100, 100, 100)
    self.p0_orientation = Amaz.Vector3f(0, 0, 0)
    self.p0_rotation = 0
    self.p0_xRotation = 0
    self.p0_yRotation = 0

    self.p1_anchorPoint = Amaz.Vector3f(0, 0, 0)
    self.p1_position = Amaz.Vector3f(0, 0, 0)
    self.p1_scale = Amaz.Vector3f(100, 100, 100)
    self.p1_orientation = Amaz.Vector3f(0, 0, 0)
    self.p1_rotation = 0
    self.p1_xRotation = 0
    self.p1_yRotation = 0

    self.expandRight = 0.0
    self.expandLeft = 0.0
    self.expandUp = 0.0
    self.expandDown = 0.0
    self.mirrorEdge = false

    -- Matte
    self.hasMatte = false
    self.matteMode = "Alpha"
    self.matteDuration = {}
    self.maskTex = nil

    -- Blend
    self.hasBlend = true
    self.blendMode = "Normal"
    self.isVisible = true
    self.layerType = 'Adjustment'
    self.baseTex = nil
    self.srcDuration = {}
    self.baseDuration = {}

    -- for test
    if false then
        self.aeTime = 1
        self.srcDuration = {{0, 6}}
        self.baseDuration = {{0, 6}}
    end

    return self
end

function LumiLayer:setVisible(visible)
    self.isVisible = visible
end

function LumiLayer:setEntityVisible(entity, visible)
    local transforms = entity:getComponentsRecursive("Transform")
    for i = 0, transforms:size() - 1 do
        local transform = transforms:get(i)
        if transform then
            transform.entity.visible = visible
        end
    end
    entity.visible = visible
end

function LumiLayer:onStart(comp)
    self.entity = comp.entity
    self.TAG = AE_EFFECT_TAG .. ' ' .. self.entity.name

    self.layerEntity = self.entity:searchEntity('LayerCamera');
    self.camera = self.layerEntity:getComponent('Camera')
    self.expand_tile_trans = self.entity:searchEntity("expand_tile"):getComponent("Transform")
    self.father_trans = self.entity:searchEntity("father_trans"):getComponent("Transform")
    self.child_trans = self.entity:searchEntity("child_trans"):getComponent("Transform")
    self.p0_father_trans = self.entity:searchEntity("p0_father_trans"):getComponent("Transform")
    self.p0_child_trans = self.entity:searchEntity("p0_child_trans"):getComponent("Transform")
    self.p1_father_trans = self.entity:searchEntity("p1_father_trans"):getComponent("Transform")
    self.p1_child_trans = self.entity:searchEntity("p1_child_trans"):getComponent("Transform")
    self.renderer = self.entity:searchEntity('expand_tile'):getComponent('MeshRenderer')
    self.renderer.useFrustumCulling = false
    self.material = self.renderer.material
end

local PositionDict = {
    xPosition = {'position', 'x'},
    yPosition = {'position', 'y'},
    zPosition = {'position', 'z'},
    p0_xPosition = {'p0_position', 'x'},
    p0_yPosition = {'p0_position', 'y'},
    p0_zPosition = {'p0_position', 'z'},
    p1_xPosition = {'p1_position', 'x'},
    p1_yPosition = {'p1_position', 'y'},
    p1_zPosition = {'p1_position', 'z'},
}

function LumiLayer:setEffectAttr(key, value, comp)
    local function _setEffectAttr(_key, _value)
        if self[_key] ~= nil then
            self[_key] = _value
            if comp and comp.properties ~= nil then
                comp.properties:set(_key, _value)
            end
        end
    end

    if key == 'position'
    or key == 'anchorPoint'
    or key == 'scale'
    or key == 'orientation'
    or key == 'p0_position'
    or key == 'p0_anchorPoint'
    or key == 'p0_scale'
    or key == 'p0_orientation'
    or key == 'p1_position'
    or key == 'p1_anchorPoint'
    or key == 'p1_scale'
    or key == 'p1_orientation'
    then
        if value.z ~= nil then
            _setEffectAttr(key, value)
        else
            -- Vector2f to Vector3f
            _setEffectAttr(key, Amaz.Vector3f(value.x, value.y, 0))
        end
    elseif PositionDict[key] ~= nil then
        local newKey = PositionDict[key][1]
        local dimension = PositionDict[key][2]
        self[newKey][dimension] = value
        _setEffectAttr(newKey, self[newKey])
    elseif key == 'blendMode' then
        _setEffectAttr(key, BlendMode[value + 1])
    elseif key == 'matteMode' then
        _setEffectAttr(key, MatteMode[value + 1])
    elseif key == 'layerType' then
        if type(value) == 'string' then
            _setEffectAttr(key, value)
        else
            _setEffectAttr(key, LayerType[value + 1])
        end
    else
        _setEffectAttr(key, value)
    end
end

function LumiLayer:_rotateByAEAxis(_trans, _direction, _euler_angle)
    -- ae xyz, editor yxz
    local right   = Amaz.Vector3f(1.0, 0.0, 0.0)
    local up      = Amaz.Vector3f(0.0, 1.0, 0.0)
    local forward = Amaz.Vector3f(0.0, 0.0, 1.0)

    local cur_orientation = Amaz.Quaternionf.axisAngleToQuaternion(right,    math.rad(_direction.x))
                          * Amaz.Quaternionf.axisAngleToQuaternion(up,      -math.rad(_direction.y))
                          * Amaz.Quaternionf.axisAngleToQuaternion(forward, -math.rad(_direction.z))

    up      = Amaz.Quaternionf.rotateVectorByQuat(cur_orientation, up)
    right   = Amaz.Quaternionf.rotateVectorByQuat(cur_orientation, right)
    forward = Amaz.Quaternionf.rotateVectorByQuat(cur_orientation, forward)

    cur_orientation = Amaz.Quaternionf.axisAngleToQuaternion(right,    math.rad(_euler_angle.x))
                    * Amaz.Quaternionf.axisAngleToQuaternion(up,      -math.rad(_euler_angle.y))
                    * Amaz.Quaternionf.axisAngleToQuaternion(forward, -math.rad(_euler_angle.z))
                    * cur_orientation
    
    _trans.localOrientation = cur_orientation
end

function LumiLayer:updateTRS(ratio)
    self.expand_tile_trans.localScale = Amaz.Vector3f(1.0+self.expandRight+self.expandLeft, 1.0+self.expandUp+self.expandDown, 1.0)
    self.expand_tile_trans.localPosition = Amaz.Vector3f(
        self.expandRight-self.expandLeft,
        self.expandUp-self.expandDown,
        0.0
    )

    local ratio_c = self.compositeSize.x / self.compositeSize.y
    local pos_z0 = ratio / math.tan(math.rad(self.active_cam_fovx * 0.5))
    local compositeSizeZ = self.compositeSize.y * ratio_c / ratio
    -- Amaz.LOGE(self.TAG, "compositeSizeZ: "..compositeSizeZ)
    self.camera.fovy = 2 * math.deg(math.atan(1 / pos_z0))

    local rotate = Amaz.Vector3f(self.xRotation, self.yRotation, self.rotation)
    self:_rotateByAEAxis(self.father_trans, self.orientation, rotate)
    self.father_trans.localPosition = Amaz.Vector3f(
        (self.position.x / self.compositeSize.x - 0.5) * 2 * ratio,
        (1.0 - self.position.y / self.compositeSize.y - 0.5) * 2,
        -self.position.z * 2 / compositeSizeZ
    )
    self.child_trans.localPosition = Amaz.Vector3f(
        -(self.anchorPoint.x / self.layerSize.x - 0.5) * 2 * ratio,
        -(1.0 - self.anchorPoint.y / self.layerSize.y - 0.5) * 2,
        self.anchorPoint.z * 2 / compositeSizeZ
    )
    self.child_trans.localEulerAngle = Amaz.Vector3f(0, 0, 0)

    -- parent 0
    rotate = Amaz.Vector3f(self.p0_xRotation, self.p0_yRotation, self.p0_rotation)
    self:_rotateByAEAxis(self.p0_father_trans, self.p0_orientation, rotate)
    self.p0_father_trans.localPosition = Amaz.Vector3f(
        (self.p0_position.x / self.compositeSize.x - 0.5) * 2 * ratio,
        (1.0 - self.p0_position.y / self.compositeSize.y - 0.5) * 2,
        -self.p0_position.z * 2 / compositeSizeZ
    )
    self.p0_child_trans.localPosition = Amaz.Vector3f(
        -(self.p0_anchorPoint.x / self.compositeSize.x - 0.5) * 2 * ratio,
        -(1.0 - self.p0_anchorPoint.y / self.compositeSize.y - 0.5) * 2,
        self.p0_anchorPoint.z * 2 / compositeSizeZ
    )
    self.p0_child_trans.localEulerAngle = Amaz.Vector3f(0, 0, 0)

    -- parent 1
    rotate = Amaz.Vector3f(self.p1_xRotation, self.p1_yRotation, self.p1_rotation)
    self:_rotateByAEAxis(self.p1_father_trans, self.p1_orientation, rotate)
    self.p1_father_trans.localPosition = Amaz.Vector3f(
        (self.p1_position.x / self.compositeSize.x - 0.5) * 2 * ratio,
        (1.0 - self.p1_position.y / self.compositeSize.y - 0.5) * 2,
        -pos_z0 - self.p1_position.z * 2 / compositeSizeZ
    )
    self.p1_child_trans.localPosition = Amaz.Vector3f(
        -(self.p1_anchorPoint.x / self.compositeSize.x - 0.5) * 2 * ratio,
        -(1.0 - self.p1_anchorPoint.y / self.compositeSize.y - 0.5) * 2,
        self.p1_anchorPoint.z * 2 / compositeSizeZ
    )
    self.p1_child_trans.localEulerAngle = Amaz.Vector3f(0, 0, 0)

    self.father_trans.localScale = Amaz.Vector3f(
        self.scale.x / 100.0 * (self.layerSize.x / self.compositeSize.x),
        self.scale.y / 100.0 * (self.layerSize.y / self.compositeSize.y),
        self.scale.z / 100.0
    )
    self.child_trans.localScale = Amaz.Vector3f(ratio, 1, 1)
    self.p0_father_trans.localScale = self.p0_scale / 100.0
    self.p1_father_trans.localScale = self.p1_scale / 100.0

    local mMat = self.expand_tile_trans:getWorldMatrix()
    local vMat = self.camera:getWorldToCameraMatrix()
    local pMat = self.camera.projectionMatrix

    return {vMat * mMat, pMat:invert_Full()}
end

function LumiLayer:onUpdate(comp, deltaTime)
    self.opacity = clamp(self.opacity, 0, 100)
    local trsOpacity = 1.0
    local blendOpacity = 1.0
    if self.layerType == 'Adjustment' then
        blendOpacity = self.opacity / 100.0
    else
        trsOpacity = self.opacity / 100.0
    end

    local hasSrcTexture = false
    if self.isVisible then
        for _, duration in ipairs(self.srcDuration) do
            if duration[1] <= self.aeTime and self.aeTime <= duration[2] then
                hasSrcTexture = true
                break
            end
        end
    end

    local needTrs = self.hasTransform and hasSrcTexture
    local visible = needTrs or self.hasMatte or self.hasBlend
    if self.layerEntity.visible ~= visible then
        self:setEntityVisible(self.layerEntity, visible)
    end
    if visible == false then
        return
    end

    self.camera.renderTexture = self.OutputTex
    self.material:setTex('u_sourceTexture', self.InputTex)
    self.material:setTex('u_baseTexure', self.baseTex)
    self.material:setTex('u_maskTexture', self.maskTex)
    self.material:setInt('u_layerType', self.layerType == 'Adjustment' and 1 or 0)

    if needTrs then
        local ratio = self.OutputTex.width / self.OutputTex.height
        local mvp = self:updateTRS(ratio)
        self.material:setInt('u_hasTrs', 1)
        self.material:setMat4('u_mvMat', mvp[1])
        self.material:setMat4('u_pMat', mvp[2])
        self.material:setFloat('u_alpha', trsOpacity)
        self.material:setFloat('u_mirrorEdge', self.mirrorEdge and 1 or 0)
    else
        self.material:setInt('u_hasTrs', 0)
    end

    if hasSrcTexture then
        self.material:setInt("u_hasSourceTexture", 1)
    else
        self.material:setInt("u_hasSourceTexture", 0)
    end

    local enableMatte = false
    if self.hasMatte and self.maskTex then
        for _, duration in ipairs(self.matteDuration) do
            if duration[1] <= self.aeTime and self.aeTime <= duration[2] then
                enableMatte = true
                break
            end
        end
    end

    if self.hasBlend then
        local hasBaseTexture = false
        for _, duration in ipairs(self.baseDuration) do
            if duration[1] <= self.aeTime and self.aeTime <= duration[2] then
                hasBaseTexture = true
                break
            end
        end
        self.material:setInt("u_hasBlend", 1)
        self.material:setInt("u_hasBaseTexture", hasBaseTexture and 1 or 0)
        self.material:setInt("u_blendMode", BlendModeIndex[self.blendMode])
        self.material:setFloat("u_layerOpacity", blendOpacity)
    else
        self.material:setInt("u_hasBlend", 0)
    end

    if self.hasMatte then
        self.material:setInt('u_hasMatte', 1)
        self.material:setInt("u_enableMatte", enableMatte and 1 or 0)
        self.material:setInt("u_matteMode", MatteModeIndex[self.matteMode])
    else
        self.material:setInt('u_hasMatte', 0)
    end
end

exports.LumiLayer = LumiLayer
return exports
