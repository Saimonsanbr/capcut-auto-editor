--@input float curTime = 0.0{"widget":"slider","min":0,"max":1}

local exports = exports or {}
local SeekModeScript = SeekModeScript or {}
SeekModeScript.__index = SeekModeScript

function SeekModeScript.new(construct, ...)
    local self = setmetatable({}, SeekModeScript)
    if construct and SeekModeScript.constructor then SeekModeScript.constructor(self, ...) end
    self.startTime = 0.0
    self.endTime = 3.0
    self.curTime = 0.0
    self.width = 0
    self.height = 0

    -- 0.0 ~ 0.5 anti fisheye, 0.5 ~ 1.0 fisheye
    self.value = 0.8695
    -- 0.0 ~ 1.0
    self.radius = 2.3
    return self
end

function SeekModeScript:constructor()

end

function SeekModeScript:onUpdate(comp, deltaTime)
    --ceshiyong
    --local props = comp.entity:getComponent("ScriptComponent").properties
    --if props:has("curTime") then
        --self:seekToTime(comp, props:get("curTime"))
    --end
    --shijiyong
    
    if self.curTime >= self.endTime then
        self.curTime = 0
    end
    self:seekToTime(comp, self.curTime - self.startTime)
end

function SeekModeScript:onStart(comp)
    self.material = comp.entity:getComponent("MeshRenderer").material
end

function SeekModeScript:seekToTime(comp, time)

    self.material:setFloat("value", self.value)
    self.material:setFloat("radius", self.radius)
    
    local w = Amaz.BuiltinObject:getInputTextureWidth()
    local h = Amaz.BuiltinObject:getInputTextureHeight()
    if w ~= self.width or h ~= self.height then
        self.width = w
        self.height = h
        self.material:setInt("baseTexWidth", self.width)
        self.material:setInt("baseTexHeight", self.height)
    end
end

function SeekModeScript:onEvent(sys, event)
    if "effects_adjust_distortion" == event.args:get(0) then
        local intensity = event.args:get(1)
        self.value = intensity*0.35 + 0.6 
    end

end


exports.SeekModeScript = SeekModeScript
return exports
