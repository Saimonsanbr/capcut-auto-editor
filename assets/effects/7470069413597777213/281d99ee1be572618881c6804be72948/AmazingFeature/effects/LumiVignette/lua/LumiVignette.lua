local isEditor = (Amaz.Macros and Amaz.Macros.EditorSDK) and true or false
local exports = exports or {}
local LumiVignette = LumiVignette or {}
LumiVignette.__index = LumiVignette
---@class LumiVignette : ScriptComponent
---@field amount number [UI(Range={0., 1.}, Drag)]
---@field midpoint number [UI(Range={0., 1.}, Drag)]
---@field roundness number [UI(Range={-1., 1.}, Drag)]
---@field feather number [UI(Range={0., 1.}, Drag)]
---@field highlight number [UI(Range={0., 1.}, Drag)]
---@field color Color [UI(NoAlpha)]
---@field transparent boolean
---@field InputTex Texture
---@field OutputTex Texture

local AE_EFFECT_TAG = 'AE_EFFECT_TAG LumiTag'


function LumiVignette.new(construct, ...)
    local self = setmetatable({}, LumiVignette)

    self.__lumi_type = "lumi_obj"
    self.__lumi_rt_pingpong_type = "custom"

    self.amount = 0.
    self.midpoint = 0.
    self.roundness = 0.
    self.feather = 0.5
    self.highlight = 0.
    self.color = Amaz.Color(0., 0., 0.)

    self.HalfDiagonalLength = 1.414213562373095 * 0.5
    self.Center = Amaz.Vector2f(0.5, 0.5)

    self.transparent = false

    self.InputTex = nil
    self.OutputTex = nil
    return self
end

local function clamp(value, min, max)
    --[[
        Description: clamp value between [min, max]
    ]]
    return math.min(math.max(value, min), max)
end

local function remap(value, srcMin, srcMax, dstMin, dstMax)
    --[[
        Description: linearly remap value from [srcMin, srcMax] to [dstMin, dstMax]
    ]]
    return dstMin + (value - srcMin) * (dstMax - dstMin) / (srcMax - srcMin)
end

local function getFeatherParams(feather)
    --[[
        Description: get rotate pivot and power index for feather funcion, which is a S-Curve
    ]]
    local pivot = 0.5 - 0.17 * feather * feather

    local p = 1
    if feather >= 0.5 then
        p = 0.4 * feather
    else
        p = 0.38 * feather + 0.01
    end
    local power = 1. / p
    return pivot, power
end


local function getFeatherScaleFromMidpoint(midpoint)
    --[[
        Description: midpoint will affect feather, larger midpoint leads to smaller feather.
    ]]
    local featherScale = 1. - 0.46508 * midpoint ^ 5.21286 - 0.33492 * midpoint
    return featherScale
end


local function getFeatherScaleFromRoundness(roundness, width, height)
    --[[
        Description: negative roundness will affect feather, smaller roundness leads to smaller feather
    ]]
    local featherScale = 1.
    if roundness < 0. then
        roundness = math.abs(roundness)
        local longEdge = math.max(width, height)
        local shortEdge = math.min(width, height)
        local ratio = shortEdge / longEdge
        local turningLength = 1. - ratio
        local maxRoundness = -0.7 * ratio + 0.96
        roundness = roundness * maxRoundness
        if roundness > turningLength then
            -- s = 0     -->  featherScale = 1
            -- s = sMax  -->  featherScale = 0.1 / (ratio ^ 0.5)
            local s = roundness - turningLength
            local sMax = maxRoundness - turningLength
            featherScale = remap(s, 0., sMax, 1., 0.1 / (ratio ^ 0.5))
        end
    end
    return featherScale
end


local function getOpacity(amount)
    --[[
        Description: remap amount to get opacity
    ]]
    local x = amount
    local x2 = x * x
    local x3 = x2 * x
    local x4 = x3 * x
    local x5 = x4 * x
    local x6 = x5 * x
    local x7 = x6 * x

    local opacity = (0.791515) * x + (-0.120212) * x2 + (19.1491) * x3 + (-64.6869) * x4 + (88.4132) * x5 + (-56.7089) * x6 + (14.1622) * x7
    return clamp(opacity, 0., 1.)
end

local function getMidpoint(midpoint)
    --[[
        Description: remap midpoint
    ]]
    local res = 0.5 * midpoint + 0.15 * midpoint * midpoint
    return res
end

local function getMidpointScaleFromRoundness(roundness, width, height)
    --[[
        Description: roundness will affect midpoint.
    ]]
    local longEdge = math.max(width, height)
    local shortEdge = math.min(width, height)
    local ratio = shortEdge / longEdge
    local midpointScale = 1.
    if roundness < 0. then
        -- midpointScale = -4.58 * ratio ^ 0.83 + 0.96 + 3.72 * ratio
        midpointScale = -6.09 * ratio ^ 0.881 + 0.86 + 5.33 * ratio
    else
        midpointScale = 1.49 - 1.87 * ratio + 1.39 * ratio * ratio
    end
    return midpointScale
end

local function getGeometricMeanSize(width, height)
    local res =  (width * height) ^ 0.5
    local ratio = 1.
    if width <= height then
        ratio = (height / width) ^ 0.25
    else
        ratio = (width / height) ^ 0.25
    end
    res = res * ratio
    return res
end


function LumiVignette:setEffectAttr(key, value, comp)
    local function _setEffectAttr(_key, _value, _force)
        if _force or self[_key] ~= nil then
            self[_key] = _value
            if comp and comp.properties ~= nil then
                comp.properties:set(_key, _value)
            end
        end
    end

    _setEffectAttr(key, value)
end

function LumiVignette:onStart(comp)
    self.entity = comp.entity
    self.TAG = AE_EFFECT_TAG .. ' ' .. self.entity.name

    self.camera = self.entity:searchEntity("CameraVignette"):getComponent("Camera")
    self.material = self.entity:searchEntity("EntityVignette"):getComponent("MeshRenderer").material
end

function LumiVignette:onUpdate(comp, deltaTime)
    local textureWidth = self.OutputTex.width
    local textureHeight = self.OutputTex.height

    -- preprocess parameters
    self.amount = clamp(self.amount, 0., 1.)
    self.midpoint = clamp(self.midpoint, 0., 1.)
    self.roundness = clamp(self.roundness, -1., 1.)
    self.feather = clamp(self.feather, 0., 1.)
    self.highlight = clamp(self.highlight, 0., 1.)

    local opacity = getOpacity(self.amount)
    local midpointScale = getMidpointScaleFromRoundness(self.roundness, textureWidth, textureHeight)

    local midpoint1 = getMidpoint(self.midpoint)
    local midpoint2 = midpoint1 * midpointScale
    local midpoint = remap(math.abs(self.roundness) ^ 2, 0, 1., midpoint1, midpoint2)

    local featherScaleMidPt = getFeatherScaleFromMidpoint(self.midpoint)
    local featherScaleRd = getFeatherScaleFromRoundness(self.roundness, textureWidth, textureHeight)
    local featherPivot, featherPower = getFeatherParams(self.feather * featherScaleMidPt * featherScaleRd)
    local geometricMeanSize = getGeometricMeanSize(textureWidth, textureHeight)

    -- set textures
    if self.OutputTex then
        self.camera.renderTexture = self.OutputTex
    end
    self.material:setTex("u_inputTexture", self.InputTex)

    -- set parameters
    self.material:setFloat("u_opacity", opacity)
    self.material:setFloat("u_midpoint", midpoint)
    self.material:setFloat("u_roundness", self.roundness)
    self.material:setFloat("u_featherPivot", featherPivot)
    self.material:setFloat("u_featherPower", featherPower)
    self.material:setFloat("u_highlight", self.highlight)
    self.material:setFloat("u_halfDiagonalLength", self.HalfDiagonalLength)
    self.material:setFloat("u_geometricMeanSize", geometricMeanSize)
    self.material:setInt('u_transparent', self.transparent and 1 or 0)
    self.material:setVec2("u_center", self.Center)
    self.material:setVec3("u_color", Amaz.Vector3f(self.color.r, self.color.g, self.color.b))
end

exports.LumiVignette = LumiVignette
return exports
