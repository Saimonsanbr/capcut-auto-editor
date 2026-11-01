local exports = exports or {}
local StrongSharpen = StrongSharpen or {}
StrongSharpen.__index = StrongSharpen
---@class StrongSharpen: ScriptComponent
---@field strength double [UI(Range={0, 1}, Drag)]
---@field offset_x double [UI(Range={0, 1}, Drag)]
---@field offset_y double [UI(Range={0, 1}, Drag)]
---@field InputTex Texture
---@field OutputTex Texture

function StrongSharpen.new(construct, ...)
    local self = setmetatable({}, StrongSharpen)
    if construct and StrongSharpen.constructor then StrongSharpen.constructor(self, ...) end

    self.InputTex = nil
    self.OutputTex = nil

    self.startTime = 0.0
    self.endTime = 3.0
    self.curTime = 0.0
    self.width = 0
    self.height = 0
    self.widthMax = 1
    self.heightMax = 1
    -- effect adjust params
    self.strength = 0.3
    self.offset_x = 0.0
    self.offset_y = 0.0
    return self
end

function StrongSharpen:constructor()

end

function StrongSharpen:onStart(comp)
    self.pass0Material = comp.entity:searchEntity("Pass0"):getComponent("MeshRenderer").material
    self.pass1Material = comp.entity:searchEntity("Pass1"):getComponent("MeshRenderer").material
    self.pass2Material = comp.entity:searchEntity("Pass2"):getComponent("MeshRenderer").material
    self.pass0Camera = comp.entity:searchEntity("CameraPass0"):getComponent("Camera")
    self.pass2Camera = comp.entity:searchEntity("CameraPass2"):getComponent("Camera")
end

function StrongSharpen:onUpdate(comp, detalTime)
    if Amaz.Macros and Amaz.Macros.EditorSDK then
        local props = comp.entity:getComponent("ScriptComponent").properties
        if props:has("strength") then
            self.strength = props:get("strength")
        end
        if props:has("offset_x") then
            self.offset_x = props:get("offset_x")
        end
        if props:has("offset_y") then
            self.offset_y = props:get("offset_y")
        end
    end
    self:seekToTime(comp, self.curTime - self.startTime)
end

function StrongSharpen:seekToTime(comp, time)
    self.pass0Camera.renderTexture = self.OutputTex
    self.pass2Camera.renderTexture = self.OutputTex
    self.pass0Material:setTex("inputImageTexture", self.InputTex)
    self.pass1Material:setTex("inputImageTexture1", self.InputTex)
    self.pass1Material:setTex("inputImageTexture2", self.OutputTex)
    self.width = Amaz.BuiltinObject:getInputTextureWidth()
    self.height = Amaz.BuiltinObject:getInputTextureHeight()
    if self.width >= self.widthMax or self.height > self.heightMax then
        self.widthMax = self.width
        self.heightMax = self.height
        self.pass0Material:setInt("inputWidth", self.widthMax)
        self.pass0Material:setInt("inputHeight", self.heightMax)
        self.pass1Material:setFloat("inputScale", 1.0)
    else
        self.pass1Material:setFloat("inputScale", math.pow((1.0/self.width*self.widthMax), 0.4))
    end
    local strength = self.strength * 10.0
    local offset_x = (self.offset_x - 0.5) * 2 / 5.0
    local offset_y = (self.offset_y - 0.5) * 2 / 5.0
    self.pass1Material:setFloat("strength", strength)
    self.pass2Material:setFloat("offset_x", offset_x)
    self.pass2Material:setFloat("offset_y", offset_y)
end

exports.StrongSharpen = StrongSharpen
return exports
