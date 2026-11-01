local exports = exports or {}
local GaussianBlurLayerScript = GaussianBlurLayerScript or {}

---@class GaussianBlurLayerScript : ScriptComponent
---@field intensity number
---@field steps number
---@field Blurred_Direction string[UI(Option={"Horizontal and Vertical", "Horizontal", "Vertical"})]
---@field MidTex Texture
---@field InputTex Texture
---@field OutputTex Texture
GaussianBlurLayerScript.__index = GaussianBlurLayerScript

function GaussianBlurLayerScript.new()
    local self = {}
    setmetatable(self, GaussianBlurLayerScript)
    self.intensity = 0.0
    self.steps = 1
    self.expandFlag = false
    self.Blurred_Direction = "Horizontal and Vertical"
    self.transform = {}
    self.MidTex = nil
    self.InputTex = nil
    self.OutputTex = nil
    return self
end

---@param comp Component
function GaussianBlurLayerScript:onStart(comp)
    self.HorizontalBlurMat = comp.entity:searchEntity("Horizontal_Blur"):getComponent("MeshRenderer").material
    self.VerticalBlurMat = comp.entity:searchEntity("Vertical_Blur"):getComponent("MeshRenderer").material

    self.hori_cam = comp.entity:searchEntity("Camera_Horizontal_Blur"):getComponent("Camera")
    self.vert_cam = comp.entity:searchEntity("Camera_Vertical_Blur"):getComponent("Camera")
end

function GaussianBlurLayerScript:setEffectAttr(key, value, comp)
    local function _setEffectAttr(_key, _value)
        if self[_key] ~= nil then
            self[_key] = _value
            if comp and comp.properties ~= nil then
                comp.properties:set(_key, _value)
            end
        end
    end

    if key == "type" then
        local direction = "Horizontal and Vertical"
        if value == 1 then direction = "Horizontal"
        elseif value == 2 then direction = "Vertical"
        end 
        _setEffectAttr("Blurred_Direction", direction)
    else
        _setEffectAttr(key, value)
    end
end

---@param comp Component
---@param deltaTime number
function GaussianBlurLayerScript:onUpdate(comp, deltaTime)
    local intensity = math.max(self.intensity, 0.0)
    self.HorizontalBlurMat:setFloat("u_Sample", math.floor(intensity))
    self.VerticalBlurMat:setFloat("u_Sample", math.floor(intensity))
    self.HorizontalBlurMat:setFloat("u_Steps", self.steps)
    self.VerticalBlurMat:setFloat("u_Steps", self.steps)
    self.HorizontalBlurMat:setFloat("u_ExpandFlag", self.expandFlag and 1 or 0)
    self.VerticalBlurMat:setFloat("u_ExpandFlag", self.expandFlag and 1 or 0)
    if self.Blurred_Direction == "Horizontal" then
        -- self.VerticalBlurMat:enableMacro("GLOWSAMPLE", 0)
        self.vert_cam.entity.visible = false
        self.hori_cam.entity.visible = true

        self.HorizontalBlurMat:setTex("u_InputTex", self.InputTex)
        self.hori_cam.renderTexture = self.OutputTex
    elseif self.Blurred_Direction == "Vertical" then
        -- self.HorizontalBlurMat:enableMacro("GLOWSAMPLE", 0)
        self.vert_cam.entity.visible = true
        self.hori_cam.entity.visible = false

        self.VerticalBlurMat:setTex("u_InputTex", self.InputTex)
        self.vert_cam.renderTexture = self.OutputTex
    
    else
        self.vert_cam.entity.visible = true
        self.hori_cam.entity.visible = true

        self.HorizontalBlurMat:setTex("u_InputTex", self.InputTex)
        self.hori_cam.renderTexture = self.MidTex
        self.VerticalBlurMat:setTex("u_InputTex", self.MidTex)
        self.vert_cam.renderTexture = self.OutputTex

    end
end

exports.GaussianBlurLayerScript = GaussianBlurLayerScript
return exports
