      
local isEditor = (Amaz.Macros and Amaz.Macros.EditorSDK) and true or false
local exports = exports or {}
local MotionTile = MotionTile or {}
MotionTile.__index = MotionTile
---@class MotionTile : ScriptComponent
---@field tile_centr Vector2f
---@field tile_size Vector2f
---@field output_size Vector2f
---@field mirror_edges boolean
---@field phase number
---@field horizontal_phase_shift boolean
---@field inputTex Texture
---@field outputTex Texture

function MotionTile.new(construct, ...)
    local self = setmetatable({}, MotionTile)

    self.active_cam_fovx = 39.6
    self.composite_size = Amaz.Vector2f(1080, 1080)

    self.tile_centr = Amaz.Vector2f(0.5,0.5)
    self.tile_size = Amaz.Vector2f(1,1)
    self.output_size = Amaz.Vector2f(1,1)
    self.mirror_edges = false
    self.phase = 0
    self.horizontal_phase_shift = false
    
    self.inputTex = nil
    self.outputTex = nil

    if construct and MotionTile.constructor then MotionTile.constructor(self, ...) end
    return self
end

function MotionTile:constructor()

end

function MotionTile:onStart(comp)
    self.entity = comp.entity
    self.ae_cam = self.entity:searchEntity("cam_ae_transform"):getComponent("Camera")

    self.motion_tile_mat = self.entity:searchEntity("child_trans"):getComponent("MeshRenderer").material
    self.motion_tile_mat:setTex("inputTex", self.inputTex)
    self.ae_cam.renderTexture = self.outputTex
end


function MotionTile:onUpdate(comp, deltaTime)
    self.width =  Amaz.BuiltinObject:getInputTextureWidth()
    self.height = Amaz.BuiltinObject:getInputTextureHeight()


    local outputTexSize = Amaz.Vector2f(
        Amaz.BuiltinObject:getOutputTextureWidth(),
        Amaz.BuiltinObject:getOutputTextureHeight()
    )
    local inputTexSize = Amaz.Vector2f(
        Amaz.BuiltinObject:getInputTextureWidth(),
        Amaz.BuiltinObject:getInputTextureHeight()
    )
    local ratio = self.width/self.height

    self.motion_tile_mat:setVec2("tile_centr", self.tile_centr)
    self.motion_tile_mat:setVec2("tile_size", self.tile_size)
    self.motion_tile_mat:setVec2("output_size", self.output_size)
    self.motion_tile_mat:setVec2("outputTexSize", outputTexSize)
    self.motion_tile_mat:setVec2("inputTexSize", inputTexSize)
    self.motion_tile_mat:setFloat("mirror_edges", self.mirror_edges and 1 or 0)
    self.motion_tile_mat:setFloat("phase", self.phase)
    self.motion_tile_mat:setFloat("horizontal_phase_shift", self.horizontal_phase_shift and 1 or 0)

end

exports.MotionTile = MotionTile
return exports
