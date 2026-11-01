
local exports = exports or {}
local CCLens = CCLens or {}
CCLens.__index = CCLens

---@class CCLens : ScriptComponent
---@field radius number
---@field convergence number
---@field center Vector2f
---@field InputTex Texture
---@field OutputTex Texture


function CCLens.new(construct, ...)
    local self = setmetatable({}, CCLens)
    self.InputTex = nil
    self.OutputTex = nil
    self.startTime = 0.0
    self.endTime = 3.0
    self.width = 0
    self.height = 0
    self.progress = 0.0
    self.autoPlay = true
    self.curTime = 0.0
    self.radius = 100.0
    self.convergence = -200
    self.center = Amaz.Vector2f(0.5,0.5)
    if construct and CCLens.constructor then CCLens.constructor(self, ...) end
    return self
end

function CCLens:constructor()
end

function CCLens:onStart(comp)
    self.cclensMaterial = comp.entity:searchEntity("CCLens"):getComponent("MeshRenderer").material
    self.cclensCamera = comp.entity:searchEntity("Camera_CCLens"):getComponent("Camera")
end


function CCLens:onUpdate(comp, deltaTime)
    self:seekToTime(comp, self.curTime - self.startTime)
end

function CCLens:seekToTime(comp, time)
    self.cclensCamera.renderTexture = self.OutputTex
    self.cclensMaterial:setTex("u_InputTex", self.InputTex)
    self.cclensMaterial:setFloat("u_Radius",self.radius)
    self.cclensMaterial:setFloat("u_Convergence",self.convergence)
    self.cclensMaterial:setVec2("u_Center", self.center)
end

exports.CCLens = CCLens
return exports
