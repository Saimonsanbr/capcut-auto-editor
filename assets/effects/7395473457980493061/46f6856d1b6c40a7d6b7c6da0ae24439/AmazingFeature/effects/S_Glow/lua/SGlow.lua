local exports = exports or {}
local SGlow = SGlow or {}
SGlow.__index = SGlow
---@class SGlow: ScriptComponent
---@field show string [UI(Option={"Result", "Threshold"})]
---@field brightness double [UI(Range={0, 50}, Drag)]
---@field threshold double [UI(Range={0, 1}, Drag)]
---@field thresholdAddColor Color [UI(NoAlpha)]
---@field glowColor Color [UI(NoAlpha)]
---@field glowWidth double [UI(Display="Glow Width", Range={0, 1}, Drag)]
---@field widthX double [UI(Display="Width X", Range={0, 5}, Drag)]
---@field widthY double [UI(Display="Width Y", Range={0, 5}, Drag)]
---@field widthRed double [UI(Display="Width Red", Range={0, 5}, Drag)]
---@field widthGreen double [UI(Display="Width Green", Range={0, 5}, Drag)]
---@field widthBlue double [UI(Display="Width Blue", Range={0, 5}, Drag)]
---@field combine string [UI(Option={"Screen", "Add", "Mult", "Difference", "Overlay"})]
---@field edgeMode string [UI(Option={"Transparent", "Reflect"})]
---@field glowFromAlpha double [UI(Range={0, 1}, Drag)]
---@field glowUnderSource double [UI(Range={0, 1}, Drag)]
---@field sourceOpacity double [UI(Range={0, 1}, Drag)]
---@field bgTexture Texture2D [UI(Type="Texture2D")]
---@field lightBackground double [UI(Range={0, 1}, Drag)]
---@field bgBrightness double [UI(Range={0, 1}, Drag)]
---@field quality double [UI(Range={0, 1}, Drag)]
---@field InputTex Texture
---@field OutputTex Texture

local CombineModeName = {
    "Screen", "Add", "Mult", "Difference", "Overlay"
}
setmetatable(CombineModeName, {__index = function(_, _) return CombineModeName[1] end})

local CombineModeIndex = {}
for index, value in ipairs(CombineModeName) do
    CombineModeIndex[value] = index - 1
end
setmetatable(CombineModeIndex, {
    __index = function(_, key)
        Amaz.LOGE("AE_LUA_TAG", "Unsupported combine mode: " .. key)
        return 0
    end
})

local EdgeModeName = {
    "Transparent", "Reflect"
}
setmetatable(EdgeModeName, {__index = function(_, _) return EdgeModeName[1] end})

local EdgeModeIndex = {}
for index, value in ipairs(EdgeModeName) do EdgeModeIndex[value] = index - 1 end
setmetatable(EdgeModeIndex, {__index = function(_, _) return 0 end})

function SGlow.new(construct, ...)
    local self = setmetatable({}, SGlow)

    if construct and SGlow.constructor then SGlow.constructor(self, ...) end

    self.InputTex = nil
    self.OutputTex = nil

    self.threshold = 0.5
    self.thresholdAddColor = Amaz.Color(0., 0., 0.)
    self.glowWidth = 0.1
    self.widthX = 1.
    self.widthY = 1.
    self.widthRed = 1.
    self.widthGreen = 1.2
    self.widthBlue = 1.4
    self.brightness = 2.
    self.glowColor = Amaz.Color(1., 1., 1.)
    self.combine = "Screen"
    self.edgeMode = "Reflect"
    self.glowFromAlpha = 0.
    self.glowUnderSource = 0.
    self.sourceOpacity = 1.
    self.bgTexture = nil
    self.lightBackground = 0.0
    self.bgBrightness = 1.0
    self.show = "Result"
    self.quality = 0.2
    return self
end

function SGlow:constructor()
end

function SGlow:onStart(comp)
    self.blurTex = comp.properties:get('blurTex')
    self.camMask = comp.entity:searchEntity("MaskCamera"):getComponent("Camera")
    self.camHorzBlurEntity = comp.entity:searchEntity("BlurHorzCamera")
    self.camVertBlurEntity = comp.entity:searchEntity("BlurVertCamera")
    self.camHorzBlurEntity2 = comp.entity:searchEntity("BlurHorzCamera_2")
    self.camVertBlurEntity2 = comp.entity:searchEntity("BlurVertCamera_2")
    self.camBlendEntity = comp.entity:searchEntity("BlendCamera")
    self.blendCamera = self.camBlendEntity:getComponent("Camera")
    self.matMask = comp.entity:searchEntity("PassMask"):getComponent("MeshRenderer").material
    self.matHorzBlur = comp.entity:searchEntity("PassHorzBlur"):getComponent("MeshRenderer").material
    self.matVertBlur = comp.entity:searchEntity("PassVertBlur"):getComponent("MeshRenderer").material
    self.matHorzBlur2 = comp.entity:searchEntity("PassHorzBlur_2"):getComponent("MeshRenderer").material
    self.matVertBlur2 = comp.entity:searchEntity("PassVertBlur_2"):getComponent("MeshRenderer").material
    self.matBlend = comp.entity:searchEntity("BlendPass"):getComponent("MeshRenderer").material
    self.camHorzBlur = self.camHorzBlurEntity:getComponent("Camera")
    self.camVertBlur = self.camVertBlurEntity:getComponent("Camera")
    self.camHorzBlur2 = self.camHorzBlurEntity2:getComponent("Camera")
    self.camVertBlur2 = self.camVertBlurEntity2:getComponent("Camera")
end

function SGlow:setEffectAttr(key, value, comp)
    local function _setEffectAttr(_key, _value)
        if self[_key] ~= nil then
            self[_key] = _value
            if comp and comp.properties ~= nil then
                comp.properties:set(_key, _value)
            end
        end
    end

    if "combine" == key then
        local combine = CombineModeName[value + 1]
        _setEffectAttr(key, combine)
    elseif "edgeMode" == key then
        local edgeMode = EdgeModeName[value + 1]
        _setEffectAttr(key, edgeMode)
    elseif "show" == key then
        local show = "Result"
        if value == 1 then show = "Threshold" end
        _setEffectAttr(key, show)
    else
        _setEffectAttr(key, value)
    end
end

function SGlow:onUpdate(comp, deltaTime)
    local props = comp.entity:getComponent("ScriptComponent").properties
    if props:has("brightness") then
        self.brightness = props:get("brightness")
    end
    self.matMask:setTex('inputTexture', self.InputTex)
    self.blendCamera.renderTexture = self.OutputTex

    local isShowResult = self.show == 'Result'
    self.camHorzBlurEntity.visible = isShowResult
    self.camVertBlurEntity.visible = isShowResult
    self.camHorzBlurEntity2.visible = isShowResult
    self.camVertBlurEntity2.visible = isShowResult
    self.camBlendEntity.visible = isShowResult
    -- if isShowResult then
    --     self.camMask.renderTexture = self.blurTex
    -- else
    --     self.camMask.renderTexture = self.OutputTex
    -- end

    self.matMask:setFloat("glowFromAlpha", self.glowFromAlpha)
    self.matMask:setFloat("threshold", self.threshold)
    self.matMask:setVec3("color", Amaz.Vector3f(self.thresholdAddColor.r, self.thresholdAddColor.g, self.thresholdAddColor.b))

    local w = Amaz.BuiltinObject:getInputTextureWidth()
    local h = Amaz.BuiltinObject:getInputTextureHeight()
    if w > 360 then
        h = h / w * 360
        w = 360
    end
    local radius = self.glowWidth * w
    -- Amaz.LOGS('tqh-log radius: ', '' .. radius)
    local widthXR = (radius * self.widthX * self.widthRed)
    local widthXG = (radius * self.widthX * self.widthGreen)
    local widthXB = (radius * self.widthX * self.widthBlue)
    local widthYR = (radius * self.widthY * self.widthRed)
    local widthYG = (radius * self.widthY * self.widthGreen)
    local widthYB = (radius * self.widthY * self.widthBlue)
    -- local blurDegree = radius / math.max(w, h)
    self.camHorzBlur.renderTexture.width  = math.floor(w)
    self.camHorzBlur.renderTexture.height = math.floor(h)
    self.camVertBlur.renderTexture.width  = math.floor(w)
    self.camVertBlur.renderTexture.height = math.floor(h)
    self.camHorzBlur2.renderTexture.width  = math.floor(w)
    self.camHorzBlur2.renderTexture.height = math.floor(h)
    self.camVertBlur2.renderTexture.width  = math.floor(w)
    self.camVertBlur2.renderTexture.height = math.floor(h)
    local colorRadiusX = Amaz.Vector3f(widthXR, widthXG, widthXB)
    local colorRadiusY = Amaz.Vector3f(widthYR, widthYG, widthYB)
    self.matHorzBlur:setVec3("ColorRadius", colorRadiusX)
    self.matVertBlur:setVec3("ColorRadius", colorRadiusY)
    self.matHorzBlur:setFloat("MaxRadius", 10+math.floor(100*self.quality)) -- w / 2
    self.matVertBlur:setFloat("MaxRadius", 10+math.floor(100*self.quality)) -- h / 2
    self.matHorzBlur2:setVec3("ColorRadius", colorRadiusX)
    self.matVertBlur2:setVec3("ColorRadius", colorRadiusY)
    self.matHorzBlur2:setFloat("MaxRadius", 10+100*self.quality) -- w / 2
    self.matVertBlur2:setFloat("MaxRadius", 10+100*self.quality) -- h / 2
    local colorSigmaX = colorRadiusX / 2.4
    local colorSigmaY = colorRadiusY / 2.4
    colorSigmaX.x = math.pow(colorSigmaX.x, 2) * 2.0
    colorSigmaX.y = math.pow(colorSigmaX.y, 2) * 2.0
    colorSigmaX.z = math.pow(colorSigmaX.z, 2) * 2.0
    colorSigmaY.x = math.pow(colorSigmaY.x, 2) * 2.0
    colorSigmaY.y = math.pow(colorSigmaY.y, 2) * 2.0
    colorSigmaY.z = math.pow(colorSigmaY.z, 2) * 2.0
    self.matHorzBlur:setVec3("ColorSigma", colorSigmaX)
    self.matVertBlur:setVec3("ColorSigma", colorSigmaY)
    self.matHorzBlur:setFloat("threshold", self.threshold)
    self.matVertBlur:setFloat("threshold", self.threshold)
    self.matHorzBlur:setInt("edgeMode", EdgeModeIndex[self.edgeMode])
    self.matVertBlur2:setInt("edgeMode", EdgeModeIndex[self.edgeMode])
    self.matHorzBlur2:setVec3("ColorSigma", colorSigmaX)
    self.matVertBlur2:setVec3("ColorSigma", colorSigmaY)
    self.matHorzBlur2:setFloat("threshold", self.threshold)
    self.matVertBlur2:setFloat("threshold", self.threshold)
    self.matHorzBlur2:setInt("edgeMode", EdgeModeIndex[self.edgeMode])
    self.matVertBlur:setInt("edgeMode", EdgeModeIndex[self.edgeMode])
    self.matBlend:setFloat("brightness", self.brightness)
    self.matBlend:setFloat("threshold", self.threshold)
    self.matBlend:setVec3("GlowColor", Amaz.Vector3f(self.glowColor.r, self.glowColor.g, self.glowColor.b))
    self.matBlend:setInt("combine", CombineModeIndex[self.combine])
    -- Amaz.LOGS('tqh-log combine: ', self.combine)
    self.matBlend:setFloat("glowUnderSource", self.glowUnderSource)
    self.matBlend:setFloat("sourceOpacity", self.sourceOpacity)
    -- Amaz.LOGS('tqh-log hasBgTex: ', tostring(self.bgTexture))
    if self.bgTexture then
        self.matBlend:setInt("hasBgTex", 1)
        self.matBlend:setTex("bgTexture", self.bgTexture)
        self.matBlend:setVec2("bgTextureSize", Amaz.Vector2f(self.bgTexture.width, self.bgTexture.height))
    else
        self.matBlend:setInt("hasBgTex", 0)
    end
    self.matBlend:setFloat("lightBackground", self.lightBackground)
    self.matBlend:setFloat("bgBrightness", self.bgBrightness)
    self.matBlend:setTex("inputTexture", self.InputTex)
end

exports.SGlow = SGlow
return exports
