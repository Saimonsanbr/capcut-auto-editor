
local exports = exports or {}
local RadialBlurLayerScript = RadialBlurLayerScript or {}

---@class RadialBlurLayerScript : ScriptComponent
---@field Type string[UI(Option={"Straight Zoom", "Fading Zoom", "Centered Zoom", "Rotate", "Scratch", "Rotate Fading"})]
---@field Amount number [UI(Range={-250, 250}, Slider)]
---@field Quality number [UI(Range={10, 100}, Slider)]
---@field Center Vector2f
RadialBlurLayerScript.__index = RadialBlurLayerScript

function RadialBlurLayerScript.new()
    local self = {}
    setmetatable(self, RadialBlurLayerScript)
    self.transform = {}
    self.Type = "Straight Zoom"
    self.lastType = ""
    self.Amount = 0.0
    self.Quality = 10
    self.Center = Amaz.Vector2f(0.5, 0.5)
    self.MatTable = {}
    return self
end

---@param comp Component
function RadialBlurLayerScript:onStart(comp)
    self.MatTable["Straight Zoom"] = comp.entity.scene:findEntityBy("Straight_Zoom_Radial_Blur"):getComponent("MeshRenderer")
    self.MatTable["Fading Zoom"] = comp.entity.scene:findEntityBy("Fading_Zoom_Radial_Blur"):getComponent("MeshRenderer")
    self.MatTable["Centered Zoom"] = comp.entity.scene:findEntityBy("Centered_Zoom_Radial_Blur"):getComponent("MeshRenderer")
    self.MatTable["Rotate"] = comp.entity.scene:findEntityBy("Rotate_Radial_Blur"):getComponent("MeshRenderer")
    self.MatTable["Scratch"] = comp.entity.scene:findEntityBy("Scratch_Radial_Blur"):getComponent("MeshRenderer")
    self.MatTable["Rotate Fading"] = comp.entity.scene:findEntityBy("Rotate_Fading_Radial_Blur"):getComponent("MeshRenderer")

    self.MatTable["Straight Zoom"].entity.selfvisible = false
    self.MatTable["Fading Zoom"].entity.selfvisible = false
    self.MatTable["Centered Zoom"].entity.selfvisible = false
    self.MatTable["Rotate"].entity.selfvisible = false
    self.MatTable["Scratch"].entity.selfvisible = false
    self.MatTable["Rotate Fading"].entity.selfvisible = false

end

---@param comp Component
---@param deltaTime number
function RadialBlurLayerScript:onUpdate(comp, deltaTime)
    local props = comp.entity:getComponent("ScriptComponent").properties
    if props:has("Amount") then
        self.Amount = props:get("Amount")
    end
    if self.lastType ~= self.Type then
        self.MatTable[self.Type].entity.selfvisible = true
        if self.lastType ~= "" then
            self.MatTable[self.lastType].entity.selfvisible = false
        end
        self.lastType = self.Type
    end
    local mat = self.MatTable[self.Type].material
    mat:setFloat("u_Quality", self.Quality)
    mat:setFloat("u_Amount", self.Amount)
    mat:setVec2("u_Center", self.Center)
    -- local rt = nil
    -- if  self.Custom_Input == true then
    --     if self.Input == nil then
    --         rt = comp.entity.scene:getInputTexture(Amaz.BuiltInTextureType.INPUT0)
    --     else
    --         rt = self.Input
    --     end
    -- else
    --     if self.LastLayerOutput == nil then
    --         rt = comp.entity.scene:getInputTexture(Amaz.BuiltInTextureType.INPUT0)
    --     else
    --         rt = self.LastLayerOutput
    --     end
    -- end
    -- self.MatTable["Straight Zoom"].material:setTex("u_InputTex", rt)
    -- self.MatTable["Fading Zoom"].material:setTex("u_InputTex", rt)
    -- self.MatTable["Centered Zoom"].material:setTex("u_InputTex", rt)
    -- self.MatTable["Rotate"].material:setTex("u_InputTex", rt)
    -- self.MatTable["Scratch"].material:setTex("u_InputTex", rt)
    -- self.MatTable["Rotate Fading"].material:setTex("u_InputTex", rt)
end

---@param comp Component
---@param event Event
function RadialBlurLayerScript:onEvent(comp, event)
end

exports.RadialBlurLayerScript = RadialBlurLayerScript
return exports
