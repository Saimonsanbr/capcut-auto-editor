      
local isEditor = (Amaz.Macros and Amaz.Macros.EditorSDK) and true or false
local exports = exports or {}
local LumiDisplacementMap = LumiDisplacementMap or {}
LumiDisplacementMap.__index = LumiDisplacementMap
---@class LumiDisplacementMap : ScriptComponent
---@field InputTex Texture
---@field OutputTex Texture
---@field horizontalImage Texture
---@field verticalImage Texture
---@field horizontalIntensity double [UI(Range={-1, 1}, Drag)]
---@field verticalIntensity double [UI(Range={-1, 1}, Drag)]
---@field horizontalType Int64 [UI(Range={0, 4})]
---@field verticalType Int64 [UI(Range={0, 4})]
---@field edgeType Int64 [UI(Range={0, 1})]

function LumiDisplacementMap.new(construct, ...)
    local self = setmetatable({}, LumiDisplacementMap)

    if construct and LumiDisplacementMap.constructor then LumiDisplacementMap.constructor(self, ...) end

    self.InputTex = nil
    self.OutputTex = nil

    self.horizontalImage = nil
    self.verticalImage = nil
    self.horizontalIntensity = 0.0
    self.verticalIntensity = 0.0
    self.horizontalType = 0.0
    self.verticalType = 0.0
    self.edgeType = 0

    return self
end

function LumiDisplacementMap:constructor()
end

function LumiDisplacementMap:onStart(comp)
    self.camera = comp.entity:searchEntity("BlitCamera"):getComponent("Camera")
    self.material = comp.entity:searchEntity("BlitPass"):getComponent("MeshRenderer").material
end

function LumiDisplacementMap:onUpdate(comp, deltaTime)
    if self.OutputTex then
        self.camera.renderTexture = self.OutputTex
    end
    self.material:setTex("u_InputTexture", self.InputTex)

    local horizontalFlag = self.horizontalImage ~= nil and 1 or 0
    local verticalFlag = self.verticalImage ~= nil and 1 or 0

    self.material:setFloat('u_horizontalFlag', horizontalFlag)
    self.material:setFloat('u_verticalFlag', verticalFlag)

    self.material:setTex("u_verticalImage", self.verticalImage)
    self.material:setTex("u_horizontalImage", self.horizontalImage)
    self.material:setFloat('u_horizontalIntensity', self.horizontalIntensity)
    self.material:setFloat('u_verticalIntensity', self.verticalIntensity)
    self.material:setFloat('u_horizontalType', self.horizontalType)
    self.material:setFloat('u_verticalType', self.verticalType)
    self.material:setFloat('u_edgeType', self.edgeType)
end

exports.LumiDisplacementMap = LumiDisplacementMap
return exports
