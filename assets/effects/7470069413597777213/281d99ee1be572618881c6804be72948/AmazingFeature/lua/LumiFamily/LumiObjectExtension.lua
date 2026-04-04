      
local LumiObjectExtension = {}
LumiObjectExtension.__index = LumiObjectExtension

local AE_EFFECT_TAG = 'AE_EFFECT_TAG LumiTag-LumiObjectExtension'

local function handleAllEntityBySingleParent(_trans, func, func2, ...)
    if _trans.children:size() > 0 and func2(_trans, ...) then
        for i = 1, _trans.children:size() do
            local child = _trans.children:get(i-1)
            handleAllEntityBySingleParent(child, func, func2, ...)
        end
    end
    func(_trans, ...)
end

local function CreateRenderTexture(width, height)
    local rt = Amaz.RenderTexture()
    rt.width = width
    rt.height = height
    rt.depth = 1
    rt.filterMag = Amaz.FilterMode.LINEAR
    rt.filterMin = Amaz.FilterMode.LINEAR
    rt.filterMipmap = Amaz.FilterMipmapMode.NONE
    rt.attachment = Amaz.RenderTextureAttachment.NONE
    return rt
end

function LumiObjectExtension.register(_ent)
    if _ent == nil then return nil end
    local scriptComp = _ent:getComponent("ScriptComponent")
    if scriptComp == nil then return nil end
    local effect_lua = Amaz.ScriptUtils.getLuaObj(scriptComp:getScript())
    if effect_lua == nil then return nil end

    local self = setmetatable({}, LumiObjectExtension)
    self.entity = _ent
    self.scriptComp = scriptComp
    self.trans = _ent:getComponent("Transform")
    self.effect_lua = effect_lua
    if effect_lua.__lumi_type~= nil then
        self.__lumi_type = effect_lua.__lumi_type 
    else
        self.__lumi_type = "lumi_obj"
    end
    if effect_lua.__lumi_rt_pingpong_type~= nil then
        self.__lumi_rt_pingpong_type = effect_lua.__lumi_rt_pingpong_type 
    else
        self.__lumi_rt_pingpong_type = "custom"
    end

    if self.entity:getComponents("Camera"):size() > 0 then
        Amaz.LOGE(AE_EFFECT_TAG, "Error: root entity has camera attached")
        return nil
    end
    self.subLumiObjExt = {}
    if self.__lumi_type == "lumi_effect" then
        for i = 1, self.trans.children:size() do
            local child = self.trans.children:get(i-1)
            local objExt = LumiObjectExtension.register(child.entity)
            if objExt and child.entity.name ~= '' then
                self.subLumiObjExt[child.entity.name] = objExt
            end
        end
    end
    effect_lua.__lumi_obj_ext = self
    return self
end

function LumiObjectExtension.deregister(_ent)
    if _ent == nil then return nil end
    local scriptComp = _ent:getComponent("ScriptComponent")
    if scriptComp == nil then return nil end
    local effect_lua = Amaz.ScriptUtils.getLuaObj(scriptComp:getScript())
    if effect_lua == nil then return nil end
    local lumi_obj = effect_lua.__lumi_obj_ext
    if lumi_obj == nil then return nil end

    if  lumi_obj.__lumi_type == "lumi_effect" then
        for i = 1, lumi_obj.trans.children:size() do
            local child = lumi_obj.trans.children:get(i-1)
            LumiObjectExtension.deregister(child.entity)
        end
    end
    lumi_obj.entity = nil
    lumi_obj.trans = nil
    lumi_obj.effect_lua = nil
    lumi_obj.scriptComp = nil
    lumi_obj.subLumiObjExt = nil
    lumi_obj.__lumi_type = nil
    lumi_obj.__lumi_rt_pingpong_type = nil
    effect_lua.__lumi_obj_ext = nil
end

function LumiObjectExtension.getLumiObjExt(_ent)
    if _ent == nil then return nil end
    local scriptComp = _ent:getComponent("ScriptComponent")
    if scriptComp == nil then return nil end
    local effect_lua = Amaz.ScriptUtils.getLuaObj(scriptComp:getScript())
    if effect_lua == nil then return nil end
    return effect_lua.__lumi_obj_ext
end

function LumiObjectExtension:searchSubLumiObjExt(name)
    if self.trans.entity.name == name then
        return self
    end
    if name and self.subLumiObjExt[name] then 
        return self.subLumiObjExt[name]
    end
    for _, subObj in pairs(self.subLumiObjExt) do
        local obj = subObj:searchSubLumiObjExt(name)
        if obj then
            return obj
        end
    end
    return nil
end

function LumiObjectExtension:setInputTex(_tex)
    if self.effect_lua then
        self.effect_lua.InputTex = _tex
        if self.scriptComp and self.scriptComp.properties then
            self.scriptComp.properties:set('InputTex', _tex)
        end
    end
end

function LumiObjectExtension:setOutputTex(_tex)
    if self.effect_lua then
        self.effect_lua.OutputTex = _tex
        if self.scriptComp and self.scriptComp.properties then
            self.scriptComp.properties:set('OutputTex', _tex)
        end
    end
end

function LumiObjectExtension:getInputTex()
    if self.effect_lua then
        return self.effect_lua.InputTex
    end
    return nil
end

function LumiObjectExtension:getOutputTex()
    if self.effect_lua then
        return self.effect_lua.OutputTex
    end
    return nil
end

function LumiObjectExtension:setInputTexSizes(inputSize, originalSize)
    assert(type(inputSize)=="table", "inputSize should be table")
    if self.effect_lua and self.effect_lua.setInputTexSize then
        self.effect_lua:setInputTexSize(inputSize)
    end
    if self.effect_lua and self.effect_lua.setInputOriginalTexSize then
        self.effect_lua:setInputOriginalTexSize(originalSize)
    end
    self._inputTexSize, self._originalTexSize = inputSize, originalSize
end

function LumiObjectExtension:getOutputTexSizes()
    local inputSize = (self.effect_lua and self.effect_lua.getOutputTexSize) and self.effect_lua:getOutputTexSize() or self._inputTexSize
    local originalSize = (self.effect_lua and self.effect_lua.getOutputOriginalTexSize) and self.effect_lua:getOutputOriginalTexSize() or self._originalTexSize
    return inputSize, originalSize
end

function LumiObjectExtension:needChangeOutputTexSize()
    if self.effect_lua and self.effect_lua.__lumi_will_change_out_size then
        return self.effect_lua.__lumi_will_change_out_size
    end
    if self._inputTexSize~=nil and self.effect_lua and self.effect_lua.getOutputTexSize then
        local outSize = self.effect_lua:getOutputTexSize()
        return (outSize[1] ~= self._inputTexSize[1] or outSize[2] ~= self._inputTexSize[2])
    end
    return false
end

function LumiObjectExtension:updateRt(_input_tex, _output_tex, _pingpong_tex)
    self:setInputTex(_input_tex)
    self:setOutputTex(_output_tex)
    if self.effect_lua and self.effect_lua.updateRenderTexture ~= nil then
        self.effect_lua:updateRenderTexture()
    end
    if self.__lumi_type == "lumi_effect" and self.__lumi_rt_pingpong_type == "auto" then
        local lumi_obj_list = {}
        local function collect_lumi_obj(_trans)
            local lumi_obj_ext = LumiObjectExtension.getLumiObjExt(_trans.entity)
            if lumi_obj_ext and (lumi_obj_ext.__lumi_type == "lumi_obj" or lumi_obj_ext.__lumi_rt_pingpong_type == "custom") then
                table.insert(lumi_obj_list, lumi_obj_ext)
            end
        end
        local function collect_lumi_obj_flag(_trans)
            local lumi_obj_ext = LumiObjectExtension.getLumiObjExt(_trans.entity)
            if lumi_obj_ext and lumi_obj_ext.__lumi_type == "lumi_effect" and lumi_obj_ext.__lumi_rt_pingpong_type == "auto" then
                return true
            end
            return false
        end
        handleAllEntityBySingleParent(self.trans, collect_lumi_obj, collect_lumi_obj_flag)

        if _pingpong_tex then
            self._pingpong_tex = _pingpong_tex
        elseif #lumi_obj_list > 1 then
            self._pingpong_tex = CreateRenderTexture(_output_tex.width, _output_tex.height)
        end
        local pingpong = { _output_tex, self._pingpong_tex }
        if #lumi_obj_list%2 == 0 then
            pingpong = { self._pingpong_tex, _output_tex }
        end
        for i = 1, #lumi_obj_list do
            local lumi_obj = lumi_obj_list[i]
            if lumi_obj then
                local idx1 = (i-1)%2+1
                local idx2 = (i)%2+1
                if i == 1 then
                    lumi_obj:setInputTex(_input_tex)
                    lumi_obj:setOutputTex(pingpong[idx1])
                else
                    lumi_obj:setInputTex(pingpong[idx2])
                    lumi_obj:setOutputTex(pingpong[idx1])
                end
                if lumi_obj.effect_lua and lumi_obj.effect_lua.updateRenderTexture ~= nil then
                    lumi_obj.effect_lua:updateRenderTexture()
                end
            end
        end
    end
end

function LumiObjectExtension:updateOutputRtSize(width, height)
    if self.__lumi_type == "lumi_effect" then
        for i = 1, self.trans.children:size() do
            local child = self.trans.children:get(i - 1)
            local lumi_obj_ext = LumiObjectExtension.getLumiObjExt(child.entity)
            if lumi_obj_ext then
                lumi_obj_ext:updateOutputRtSize(width, height)
            end
        end
    end
    local tex = self:getOutputTex()
    if tex then
        tex.width = width
        tex.height = height
    end
end

function LumiObjectExtension:getCameraCount()
    local cam_count = 0

    if self.__lumi_type == "lumi_effect" then
        for i = 1, self.trans.children:size() do
            local child = self.trans.children:get(i-1)
            local lumi_obj_ext = LumiObjectExtension.getLumiObjExt(child.entity)
            if lumi_obj_ext then
                cam_count = cam_count + lumi_obj_ext:getCameraCount()
            else             
                local cam = child.entity:getComponent("Camera")
                if cam then
                    cam_count = cam_count + 1
                end
            end
        end
    elseif self.__lumi_type == "lumi_obj" then
        for i = 1, self.trans.children:size() do
            local child = self.trans.children:get(i-1)
            local cam = child.entity:getComponent("Camera")
            if cam then
                cam_count = cam_count + 1
            end
        end
    end

    return cam_count
end

local function _setLayer(_cam, _layer)
    local str = "1"
    for i = 1, _layer do
        str = str.."0"
    end
    local dynamic_bitset = Amaz.DynamicBitset.new(str)

    _cam.layerVisibleMask = dynamic_bitset
end

function LumiObjectExtension:updateCameraLayerAndOrder(_start_layer, _start_order)

    if self.__lumi_type == "lumi_obj" then
        local cur_start_layer = _start_layer
        local cur_start_order = _start_order
        for i = 1, self.trans.children:size() do
            local camTrans = self.trans.children:get(i-1)
            local cam = camTrans.entity:getComponent("Camera")
            if cam then
                cam.renderOrder = cur_start_order
                _setLayer(cam, cur_start_layer)
                for j = 1, camTrans.children:size() do
                    local rendererTrans = camTrans.children:get(j-1)
                    local renderers = rendererTrans.entity:getComponentsRecursive("Renderer")
                    for k = 0, renderers:size() - 1 do
                        local renderer = renderers:get(k)
                        if renderer then
                            renderer.entity.layer = cur_start_layer
                        end
                    end
                end
            end
            cur_start_order = cur_start_order + 1
            cur_start_layer = cur_start_layer + 1
        end

    elseif self.__lumi_type == "lumi_effect" then
        local cur_start_layer = _start_layer
        local cur_start_order = _start_order

        for i = 1, self.trans.children:size() do
            local child = self.trans.children:get(i-1)
            local lumi_obj_ext = LumiObjectExtension.getLumiObjExt(child.entity)
            if lumi_obj_ext then
                lumi_obj_ext:updateCameraLayerAndOrder(cur_start_layer, cur_start_order)
                local cam_count = lumi_obj_ext:getCameraCount()
                cur_start_layer = cur_start_layer + cam_count
                cur_start_order = cur_start_order + cam_count
            else
                local cam = child.entity:getComponent("Camera")
                if cam then
                    cam.renderOrder = cur_start_order
                    _setLayer(cam, cur_start_layer)
                    for j = 1, child.children:size() do
                        local rendererTrans = child.children:get(j-1)
                        local renderers = rendererTrans.entity:getComponentsRecursive("Renderer")
                        for k = 0, renderers:size() - 1 do
                            local renderer = renderers:get(k)
                            if renderer then
                                renderer.entity.layer = cur_start_layer
                            end
                        end
                    end
                    cur_start_order = cur_start_order + 1
                    cur_start_layer = cur_start_layer + 1
                end
            end
        end
    end
end

function LumiObjectExtension:setEffectAttr(key, value)
    if self.effect_lua and self.effect_lua.setEffectAttr ~= nil then
        self.effect_lua:setEffectAttr(key, value, self.scriptComp)
    else
        if self.effect_lua and self.effect_lua[key] ~= nil then
            self.effect_lua[key] = value
            if self.scriptComp and self.scriptComp.properties ~= nil then
                self.scriptComp.properties:set(key, value)
            end
        end
    end
end

function LumiObjectExtension:getEffectAttr(key)
    if  self.effect_lua and self.effect_lua.getEffectAttr ~= nil then
        return self.effect_lua:getEffectAttr(key, self.scriptComp)
    else
        if self.effect_lua and self.effect_lua[key] ~= nil then
            return self.effect_lua[key]
        end
    end
    return nil
end

function LumiObjectExtension:setSubEffectAttr(subName, key, value)
    local subObj = self:searchSubLumiObjExt(subName)
    if subObj then
        subObj:setEffectAttr(key, value)
    end
end

function LumiObjectExtension:getSubEffectAttr(subName, key)
    local subObj = self:searchSubLumiObjExt(subName)
    if subObj then
        return subObj:getEffectAttr(key)
    end
    return nil
end

function LumiObjectExtension:setEffectAttrRecursively(key, value)
    if self.__lumi_type == "lumi_effect" then
        for i = 1, self.trans.children:size() do
            local child = self.trans.children:get(i-1)
            local lumi_obj_ext = LumiObjectExtension.getLumiObjExt(child.entity)
            if lumi_obj_ext then
                lumi_obj_ext:setEffectAttrRecursively(key, value)
            end
        end
        self:setEffectAttr(key, value)
    elseif self.__lumi_type == "lumi_obj" then
        self:setEffectAttr(key, value)
    end
end

function LumiObjectExtension:updateMaterials(time)
    if self.effect_lua and self.scriptComp and self.entity and self.entity.visible then
        if self.effect_lua.updateMaterial ~= nil then
            self.effect_lua:updateMaterial(self.scriptComp, time)
        elseif self.effect_lua.onUpdate ~= nil then
            self.effect_lua:onUpdate(self.scriptComp, time)
        end

        for i = 1, self.trans.children:size() do
            local child = self.trans.children:get(i-1)
            local lumi_obj_ext = LumiObjectExtension.getLumiObjExt(child.entity)
            if lumi_obj_ext then
                lumi_obj_ext:updateMaterials(time)
            end
        end
    end
end

function LumiObjectExtension:setVisible(subName, visible)
    local subObj = self:searchSubLumiObjExt(subName)
    if subObj and subObj.effect_lua then
        if subObj.effect_lua.setVisible then
            subObj.effect_lua:setVisible(visible)
        else
            subObj.entity.visible = visible
        end
    end
end

return LumiObjectExtension
