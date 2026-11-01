--@input float curTime = 0.0{"widget":"slider","min":0,"max":3.0}
local exports = exports or {}
local LVFilter = LVFilter or {}
LVFilter.__index = LVFilter
---@class LVFilter : ScriptComponent
---@field AEPlugin Bool
---@field lutImage Texture
---@field uniAlpha double [UI(Range={0, 1}, Drag)]
---@field InputTex Texture
---@field OutputTex Texture

function LVFilter.new(construct, ...)
    local self = setmetatable({}, LVFilter)
    if construct and LVFilter.constructor then LVFilter.constructor(self, ...) end
    self.InputTex = nil
    self.OutputTex = nil
    self.lutImage = nil
    self.uniAlpha = 1
    self.startTime = 0.0
    self.endTime = 3.0
    self.curTime = 0.0
    self.first = nil
    self.lutImageName = ""
    self.AEPlugin = false
    return self
end

function LVFilter:constructor()
end

function LVFilter:onUpdate(comp, detalTime)
    local props = comp.entity:getComponent("ScriptComponent").properties
    if props:has("uniAlpha") then
        self.uniAlpha = props:get("uniAlpha")
    end
    self:seekToTime(comp, detalTime)
end

function LVFilter:onStart(comp, sys)
    self.inited = true
    self.camera = comp.entity:searchEntity("Camera_entity"):getComponent("Camera")
    self.pass6Material = comp.entity:searchEntity("PassEntity"):getComponent("MeshRenderer").material
end

function LVFilter:seekToTime(comp, time)
    if self.inited == nil then
        return
    end

    self.camera.renderTexture = self.OutputTex
    self.pass6Material:setTex("inputImageTexture", self.InputTex)
    self.pass6Material:setFloat("uniAlpha", self.uniAlpha)

    if self.AEPlugin then
        self.pass6Material:setFloat("uniAlpha", 0)
        if self.lutImageName ~= "" then
            local lutImage = Amaz.BuiltinObject.getUserTexture(self.lutImageName)
            if lutImage then
                self.lutImage = lutImage
                self.pass6Material:setFloat("flipY", 1.0)
                self.pass6Material:setFloat("uniAlpha", self.uniAlpha)
            end
        end
    end

    self.pass6Material:setTex("inputImageTexture2", self.lutImage)

end

exports.LVFilter = LVFilter
return exports