local exports = exports or {}
local lumi_Twirl = lumi_Twirl or {}
lumi_Twirl.__index = lumi_Twirl
---@class lumi_Twirl: ScriptComponent
---@field angle number
---@field radius number
---@field center Vector2f
---@field InputTex Texture
---@field OutputTex Texture

function lumi_Twirl.new(construct, ...)
    local self = setmetatable({}, lumi_Twirl)
    if construct and lumi_Twirl.constructor then lumi_Twirl.constructor(self, ...) end

    self.InputTex = nil
    self.OutputTex = nil

    return self
end

function lumi_Twirl:constructor()
end

function lumi_Twirl:onStart(comp)
    self:start(comp)
end

function lumi_Twirl:start(comp)
    self.first = true
    self.mat = comp.entity:searchEntity("PassTwirl"):getComponent("MeshRenderer").material
    self.cam = comp.entity:searchEntity("CameraTwirl"):getComponent("Camera")
end

function lumi_Twirl:onUpdate(comp, deltaTime)
    if self.first == nil then
        self:start(comp)
    end
    local props = comp.entity:getComponent("ScriptComponent").properties
    if props:has("angle") then
        self.angle = props:get("angle")
    end
    self.cam.renderTexture = self.OutputTex
    self.mat:setTex("u_albedo", self.InputTex)
    self.mat:setFloat("angle", self.angle)
    self.mat:setFloat("radius", self.radius)
    self.mat:setVec2("center", self.center)
end

exports.lumi_Twirl = lumi_Twirl
return exports
