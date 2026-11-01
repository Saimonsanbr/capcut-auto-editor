      
local isEditor = (Amaz.Macros and Amaz.Macros.EditorSDK) and true or false
local exports = exports or {}
local AETransform = AETransform or {}
AETransform.__index = AETransform
---@class AETransform : ScriptComponent
---@field active_cam_fovx number
---@field composite_size Vector2f
---@field is3DLayer boolean
---@field pivot Vector3f
---@field position Vector3f
---@field scale Vector3f
---@field direction Vector3f
---@field rotation Vector3f
---@field alpha number [UI(Range={0, 1}, Slider)]
---@field inputTex Texture
---@field outputTex Texture

function AETransform.new(construct, ...)
    local self = setmetatable({}, AETransform)

    self.active_cam_fovx = 39.6
    self.composite_size = Amaz.Vector2f(1080, 1080)

    self.is3DLayer = false
    self.pivot = Amaz.Vector3f(0,0,0)
    self.position = Amaz.Vector3f(0,0,0)
    self.scale = Amaz.Vector3f(1,1,1)
    self.direction = Amaz.Vector3f(0,0,0)
    self.rotation = Amaz.Vector3f(0,0,0)
    self.alpha = 1
    
    self.inputTex = nil
    self.outputTex = nil

    if construct and AETransform.constructor then AETransform.constructor(self, ...) end
    return self
end

function AETransform:constructor()

end

function AETransform:paramListener(_param, _func)
    if self[_param] ~= nil then
        if self["last_".._param] == nil or self["last_".._param] ~= self[_param] then
            _func()
            self["last_".._param] = self[_param]
        end
    end
end

function AETransform:onStart(comp)
    self.entity = comp.entity
    self.ae_cam = self.entity:searchEntity("cam_ae_transform"):getComponent("Camera")
    self.father_trans = self.entity:searchEntity("father_trans"):getComponent("Transform")
    self.child_trans = self.entity:searchEntity("child_trans"):getComponent("Transform")

    self.child_mat = self.child_trans.entity:getComponent("MeshRenderer").material
    self.child_mat:setTex("inputTex", self.inputTex)
    
end

function AETransform:_rotateByAEAxis(_trans, _direction, _euler_angle)
    -- ae xyz, editor yxz
    local up = Amaz.Vector3f(0.0, 1.0, 0.0)      
    local right = Amaz.Vector3f(1.0, 0.0, 0.0)   
    local forward = Amaz.Vector3f(0.0, 0.0, 1.0) 

    local cur_orientation = Amaz.Quaternionf.axisAngleToQuaternion(right,   _direction.x/180*math.pi) *
                            Amaz.Quaternionf.axisAngleToQuaternion(up,      -_direction.y/180*math.pi) * 
                            Amaz.Quaternionf.axisAngleToQuaternion(forward, -_direction.z/180*math.pi)

    up      = Amaz.Quaternionf.rotateVectorByQuat(cur_orientation, up)
    right   = Amaz.Quaternionf.rotateVectorByQuat(cur_orientation, right)
    forward = Amaz.Quaternionf.rotateVectorByQuat(cur_orientation, forward)

    cur_orientation = Amaz.Quaternionf.axisAngleToQuaternion(right,   _euler_angle.x/180*math.pi) * 
                    Amaz.Quaternionf.axisAngleToQuaternion(up,      -_euler_angle.y/180*math.pi) * 
                    Amaz.Quaternionf.axisAngleToQuaternion(forward, -_euler_angle.z/180*math.pi) * 
                    cur_orientation
    
    _trans.localOrientation = cur_orientation
end

-- function AETransform:onUpdate(comp, deltaTime)
--     self.width  = Amaz.BuiltinObject:getInputTextureWidth()
--     self.height = Amaz.BuiltinObject:getInputTextureHeight()
--     local ratio = self.width/self.height

--     local outputTexSize = Amaz.Vector2f(
--         Amaz.BuiltinObject:getOutputTextureWidth(),
--         Amaz.BuiltinObject:getOutputTextureHeight()
--     )
--     local inputTexSize = Amaz.Vector2f(
--         Amaz.BuiltinObject:getInputTextureWidth(),
--         Amaz.BuiltinObject:getInputTextureHeight()
--     )

--     -- ratio = (inputTexSize.x/inputTexSize.y) / (outputTexSize.x/outputTexSize.y)

--     local props = comp.entity:getComponent("ScriptComponent").properties
--     if props:has("position") then
--         self.position = props:get("position")
--     end
--     if props:has("scale") then
--         self.scale = props:get("scale")
--     end
--     if props:has("rotation") then
--         self.rotation = props:get("rotation")
--     end

--     if self.is3DLayer then
--         self.ae_cam.type = 0

--         local pos_z0 = ratio/math.tan(self.active_cam_fovx*0.5/180*math.pi)
--         self.ae_cam.fovy = math.atan(1/pos_z0)/math.pi*180*2

--         self:_rotateByAEAxis(self.father_trans, self.direction, self.rotation)
--         self.father_trans.localPosition = Amaz.Vector3f(
--             (self.position.x/self.composite_size.x-0.5)*2*ratio, 
--             (self.position.y/self.composite_size.y-0.5)*2, 
--             -pos_z0-self.position.z*2/self.composite_size.y
--         )

--         self.child_trans.localPosition = Amaz.Vector3f(
--             -(self.pivot.x/self.composite_size.x-0.5)*2*ratio, 
--             -(self.pivot.y/self.composite_size.y-0.5)*2, 
--             self.pivot.z*2/self.composite_size.y
--         )
--         self.child_trans.localEulerAngle = Amaz.Vector3f(0,0,0)
--     else
--         self.ae_cam.type = 1

--         self.father_trans.localEulerAngle = Amaz.Vector3f(0,0,0)
--         self.father_trans.localPosition = Amaz.Vector3f(
--             (self.position.x/self.composite_size.x-0.5)*2*ratio, 
--             (self.position.y/self.composite_size.y-0.5)*2, 
--             -10
--         )

--         self.child_trans.localPosition = Amaz.Vector3f(
--             -(self.pivot.x/self.composite_size.x-0.5)*2*ratio, 
--             -(self.pivot.y/self.composite_size.y-0.5)*2, 
--             0
--         )
--         self.child_trans.localEulerAngle = Amaz.Vector3f(0,0, -self.rotation.z)
--     end
--     self.father_trans.localScale = Amaz.Vector3f(self.scale.x, self.scale.y, self.scale.z)
--     self.child_trans.localScale = Amaz.Vector3f(ratio,1,1)
--     -- self.child_trans.localScale = Amaz.Vector3f((outputTexSize.x/outputTexSize.y)/(inputTexSize.x/inputTexSize.y),1,1)

--     self.child_mat:setFloat("alpha", self.alpha)

-- end

function AETransform:onUpdate(comp, deltaTime)
    self.width  = Amaz.BuiltinObject:getInputTextureWidth()
    self.height = Amaz.BuiltinObject:getInputTextureHeight()
    local ratio = self.width/self.height

    local outputTexSize = Amaz.Vector2f(
        Amaz.BuiltinObject:getOutputTextureWidth(),
        Amaz.BuiltinObject:getOutputTextureHeight()
    )
    local inputTexSize = Amaz.Vector2f(
        Amaz.BuiltinObject:getInputTextureWidth(),
        Amaz.BuiltinObject:getInputTextureHeight()
    )

    local props = comp.entity:getComponent("ScriptComponent").properties
    if props:has("position") then
        self.position = props:get("position")
    end
    if props:has("scale") then
        self.scale = props:get("scale")
    end
    if props:has("rotation") then
        self.rotation = props:get("rotation")
    end

    self.child_mat:setVec2("pos", Amaz.Vector2f(
        self.position.x/1080-0.5, 
        self.position.y/1080-0.5))
    -- Amaz.LOGI("lrc pos", tostring(self.rotation))
    self.child_mat:setFloat("rot", self.rotation.z)
    self.child_mat:setVec2("scale", Amaz.Vector2f(self.scale.x, self.scale.y))
end

exports.AETransform = AETransform
return exports
