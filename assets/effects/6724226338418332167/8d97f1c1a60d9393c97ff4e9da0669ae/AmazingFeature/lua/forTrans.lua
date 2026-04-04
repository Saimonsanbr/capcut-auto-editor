local exports = exports or {}
local forTrans = forTrans or {}
forTrans.__index = forTrans

function forTrans.new(construct, ...)
    local self = setmetatable({}, forTrans)
    self.comps = {}
    self.compsdirty = true
    return self
end

function forTrans:constructor()
    
end

function forTrans:onComponentAdded(sys, comp)
    
end

function forTrans:onComponentRemoved(sys, comp)
    
end

function forTrans:_get01(a,b,c)
    return math.max(0,math.min(1,(c-a)/(b-a)))
end
function forTrans:onStart(sys)
    self.width = Amaz.BuiltinObject:getInputTextureWidth()
    self.height = Amaz.BuiltinObject:getInputTextureHeight()
    self.mat = sys.scene:findEntityBy("Entity"):getComponent("MeshRenderer").material
    
    -- self.mat:setFloat("progress",0)
end

function forTrans:onUpdate(sys,deltaTime)
    
    self.mat:setInt("inputHeight",self.height)
    self.mat:setInt("inputWidth",self.width)
    self.input1 = Amaz.BuiltinObject.getUserTexture("#TransitionInput0")
    self.input2 = Amaz.BuiltinObject.getUserTexture("#TransitionInput1")
    self.mat:setTex("inputImageTexture",self.input1)
    self.mat:setTex("inputImageTexture2",self.input2)
    local curTime = Amaz.Input.frameTimestamp
    self.mat:setFloat("progress",curTime)
    -- self.mat:setFloat("zoom_quickness",0.8)
end

exports.forTrans = forTrans
return exports
