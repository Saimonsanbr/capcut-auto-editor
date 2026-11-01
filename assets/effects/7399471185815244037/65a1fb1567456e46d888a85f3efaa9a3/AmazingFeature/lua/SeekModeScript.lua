--@input float curTime = 0.0{"widget":"slider","min":0,"max":3.0}

local exports = exports or {}
local SeekModeScript = SeekModeScript or {}
SeekModeScript.__index = SeekModeScript

local fps = 5
local curFrame = 0
local numFrame = 18

function SeekModeScript.new(construct, ...)
    local self = setmetatable({}, SeekModeScript)
    if construct and SeekModeScript.constructor then SeekModeScript.constructor(self, ...) end
    self.startTime = 0.0
    self.endTime = 3.0
    self.curTime = 0.0
    self.width = 0
    self.height = 0
    self.noiseIntensity = 1
    self.textureIntensity = 1
    -- self.intensity = 1
    return self
end

function SeekModeScript:constructor()

end

function SeekModeScript:onUpdate(comp, detalTime)
    --ccc
    --local props = comp.entity:getComponent("ScriptComponent").properties
    --if props:has("curTime") then
        --self:seekToTime(comp, props:get("curTime") - self.startTime)
    --end
    --ccc
    self:seekToTime(comp, self.curTime - self.startTime)
end

function SeekModeScript:start(comp)
    -- self.animSeqCom = comp.entity:getComponent("AnimSeqComponent")
    self.pass0Material = comp.entity:getComponent("MeshRenderer").material
    -- self.pass0Material = comp.entity.scene:findEntityBy("Pass0"):getComponent("MeshRenderer").material
end

function SeekModeScript:seekToTime(comp, time)
    if self.first == nil then
        self.first = true
        self:start(comp)
    end
    -- self.animSeqCom:seekToTime(time)
    self.pass0Material:setFloat("time", time)

    local w = Amaz.BuiltinObject:getInputTextureWidth()
    local h = Amaz.BuiltinObject:getInputTextureHeight()
    local aspectRatio = w/h 
    curFrame = math.floor(time*fps)
    curFrame = math.mod(curFrame, numFrame)
    -- self.pass0Material:setFloat("height", h)

    if aspectRatio < 1.0 then
        local prop = (h/w-1.0)/(16.0/9.0-1.0)
        local count = 0.8+(2.0-0.8)*prop
        local noiseAmount = 1.05-(1.05-0.3)*prop
        local linesAmount = 1.02-(1.02-0.3)*prop
        self.pass0Material:setFloat("count", count)
        self.pass0Material:setFloat("noiseAmount", noiseAmount * self.noiseIntensity)
        self.pass0Material:setFloat("linesAmount", linesAmount * self.textureIntensity)
        -- self.pass0Material:setFloat("intensity", self.intensity)
    else
        self.pass0Material:setFloat("count", 0.8)
        self.pass0Material:setFloat("noiseAmount", 1.05 * self.noiseIntensity)
        self.pass0Material:setFloat("linesAmount", 1.02 * self.textureIntensity)
        -- self.pass0Material:setFloat("intensity", self.intensity)
    end

    -- if aspectRatio > 14/9 then
    --     self.animSeqCom:seek(4*numFrame+curFrame)
    -- elseif aspectRatio > 7/6 then
    --     self.animSeqCom:seek(2*numFrame+curFrame)
    -- elseif aspectRatio > 6/7 then
    --     self.animSeqCom:seek(0+curFrame)
    -- elseif aspectRatio > 9/14 then
    --     self.animSeqCom:seek(1*numFrame+curFrame)
    -- else
    --     self.animSeqCom:seek(3*numFrame+curFrame)
    -- end
end

function SeekModeScript:onEvent(sys, event)
    if "effects_adjust_noise" == event.args:get(0) then
        local intensity = event.args:get(1)
        self.noiseIntensity = intensity
    end
    if "effects_adjust_texture" == event.args:get(0) then
        local intensity = event.args:get(1)
        self.textureIntensity = intensity
    end
    -- if "effects_adjust_intensity" == event.args:get(0) then
    --     local intensity = event.args:get(1)
    --     self.intensity = intensity
    -- end
end

exports.SeekModeScript = SeekModeScript
return exports
