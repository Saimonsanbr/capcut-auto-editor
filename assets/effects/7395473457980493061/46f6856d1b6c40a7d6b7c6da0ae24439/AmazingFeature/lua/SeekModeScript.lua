local isEditor = (Amaz.Macros and Amaz.Macros.EditorSDK) and true or false
local AETools = AETools or {}     ---@class AETools
AETools.__index = AETools

function AETools:new(attrs)
    local self = setmetatable({}, AETools)
    self.attrs = attrs

    local max_frame = 0
    for _,v in pairs(attrs) do
        for i = 1, #v do
            local content = v[i]
            local cur_frame = content[2][2]
            max_frame = math.max(cur_frame, max_frame)
        end
    end

    self:SetAllFrame(max_frame)

    return self
end

function AETools._remap01(a,b,x)
    if x < a then return 0 end
    if x > b then return 1 end
    return (x-a)/(b-a)
end

function AETools._cubicBezier(p1, p2, p3, p4, t)
    return {
        p1[1]*(1.-t)*(1.-t)*(1.-t) + 3*p2[1]*(1.-t)*(1.-t)*t + 3*p3[1]*(1.-t)*t*t + p4[1]*t*t*t,
        p1[2]*(1.-t)*(1.-t)*(1.-t) + 3*p2[2]*(1.-t)*(1.-t)*t + 3*p3[2]*(1.-t)*t*t + p4[2]*t*t*t,
    }
end

function AETools:_cubicBezier01(_bezier_val, p)
    local x = self:_getBezier01X(_bezier_val, p)
    return self._cubicBezier(
        {0,0},
        {_bezier_val[1], _bezier_val[2]},
        {_bezier_val[3], _bezier_val[4]},
        {1,1},
        x
    )[2]
end

function AETools:_getBezier01X(_bezier_val, x)
    local ts = 0
    local te = 1
    -- divide and conque
    repeat
        local tm = (ts+te)*0.5
        local value = self._cubicBezier(
            {0,0},
            {_bezier_val[1], _bezier_val[2]},
            {_bezier_val[3], _bezier_val[4]},
            {1,1},
            tm)
        if(value[1]>x) then
            te = tm
        else
            ts = tm
        end
    until(te-ts < 0.0001)

    return (te+ts)*0.5
end

function AETools._mix(a, b, x)
    return a * (1-x) + b * x
end

function AETools:SetAllFrame(val)
    self.all_frame = val
end

function AETools:GetVal(_name, _progress)
    local content = self.attrs[_name]
    if content == nil then
        return nil
    end

    local cur_frame = _progress * self.all_frame

    for i = 1, #content do
        local info = content[i]
        local start_frame = info[2][1]
        local end_frame = info[2][2]
        if cur_frame >= start_frame and cur_frame < end_frame then
            local cur_progress = self._remap01(start_frame, end_frame, cur_frame)
            local bezier = info[1]
            local value_range = info[3]

            if #bezier > 4 then
                -- currently scale attrs contains more than 4 bezier values
                local res = {}
                for k = 1, 3 do
                    local cur_bezier = {bezier[k], bezier[k+3], bezier[k+3*2], bezier[k+3*3]}
                    local p = self:_cubicBezier01(cur_bezier, cur_progress)
                    res[k] = self._mix(value_range[1][k], value_range[2][k], p)
                end
                return res

            else
                local p = self:_cubicBezier01(bezier, cur_progress)

                if type(value_range[1]) == "table" then
                    local res = {}
                    for j = 1, #value_range[1] do
                        res[j] = self._mix(value_range[1][j], value_range[2][j], p)
                    end
                    return res
                end
                return self._mix(value_range[1], value_range[2], p)
            end

        end
    end

    local first_info = content[1]
    local start_frame = first_info[2][1]
    if cur_frame<start_frame then
        return first_info[3][1]
    end

    local last_info = content[#content]
    local end_frame = last_info[2][2]
    if cur_frame>=end_frame then
        return last_info[3][2]
    end

    return nil
end

function AETools:test()
    Amaz.LOGI("lrc "..tostring(self.key_frame_info), tostring(#self.key_frame_info))
end
--@input float curTime = 0.0{"widget":"slider","min":0,"max":3.0}

local exports = exports or {}
local SeekModeScript = SeekModeScript or {}
SeekModeScript.__index = SeekModeScript
function SeekModeScript.new(construct, ...)
    local self = setmetatable({}, SeekModeScript)
    if construct and SeekModeScript.constructor then SeekModeScript.constructor(self, ...) end
    self.startTime = 0.0
    self.endTime = 1.0
    self.curTime = 0.0
    self.duration = 1.0

    self.sizeIns_2=0.35
    self.sizeIns_1=0.15
    self.intensity = 1.0
    self.blurIntensity = 1.0
    self.distortion = 1.0
    self.brightness=1.0
    self.filter=1.0
    self.uvX=1.
    self.uvY=1.
    self.centerX=0.5
    self.centerY=0.5
    self.sizeIntensity = 1.0
    self.speedIntensity = 1.
    self.blurIns=1.0
    self.angle=0.5
    return self
end

function SeekModeScript:constructor()

end

local ae_attribute = { 
	
}



function SeekModeScript:onUpdate(comp, detalTime)
    local props = comp.entity:getComponent("ScriptComponent").properties
    self.curTime = self.curTime + detalTime
    if props:has("curTime") and isEditor then
        self.curTime = props:get("curTime")
    end
    self:seekToTime(comp, self.curTime - self.startTime)
    

end

function SeekModeScript:onStart(comp)
    self.radial_Blur = comp.entity.scene:findEntityBy("Radial_Blur_Root"):getComponent("ScriptComponent").properties
    self.s_Glow = comp.entity.scene:findEntityBy("S_Glow_160-effect0"):getComponent("ScriptComponent").properties
    self.lumi_filter = comp.entity.scene:findEntityBy("lumi_lv_filter_173-effect0"):getComponent("ScriptComponent").properties
    self.passRadial=comp.entity.scene:findEntityBy("Rotate_Radial_Blur"):getComponent("MeshRenderer").material
    self.passCClens=comp.entity.scene:findEntityBy("CCLens"):getComponent("MeshRenderer").material
    self.passStrong_1=comp.entity.scene:findEntityBy("Pass1"):getComponent("MeshRenderer").material
    self.passStrong_2=comp.entity.scene:findEntityBy("Pass2"):getComponent("MeshRenderer").material
    self.passTwirl=comp.entity.scene:findEntityBy("PassTwirl"):getComponent("MeshRenderer").material
    -- self.motionBlurMater_2=comp.entity.scene:findEntityBy("motion_blur_2d_2"):getComponent("MeshRenderer").material
    self.bokeh0Mat_0 = comp.entity.scene:findEntityBy("PassBokeh_0"):getComponent("MeshRenderer").material
    self.bokeh0Cam_0 = comp.entity.scene:findEntityBy("CameraBokeh_0"):getComponent("Camera")

    self.bokeh0Mat = comp.entity.scene:findEntityBy("PassBokeh0"):getComponent("MeshRenderer").material
    self.bokeh1Mat = comp.entity.scene:findEntityBy("PassBokeh1"):getComponent("MeshRenderer").material
    self.horzBlurMat = comp.entity.scene:findEntityBy("PassHorzBlur"):getComponent("MeshRenderer").material
    self.vertBlurMat = comp.entity.scene:findEntityBy("PassVertBlur"):getComponent("MeshRenderer").material
    self.bokeh0Cam = comp.entity.scene:findEntityBy("CameraBokeh0"):getComponent("Camera")
    self.bokeh1Cam = comp.entity.scene:findEntityBy("CameraBokeh1"):getComponent("Camera")

    self.twirl= comp.entity.scene:findEntityBy("lumi_Twirl_91-effect4"):getComponent("ScriptComponent").properties

    self.attrs = AETools:new(ae_attribute)

end

function SeekModeScript:seekToTime(comp, time)
    if self.first == nil then
        self.first = true
        self:onStart(comp)
    end
   
    -- Amaz.LOGI("1234",self.angle*time*5.)
    self.bokeh0Mat_0:setFloat("timeIntensity", 1.0)

    self.bokeh0Mat:setFloat("timeIntensity", self.blurIns*2.)
    self.bokeh1Mat:setFloat("timeIntensity", self.blurIns*2.)
    self.horzBlurMat:setFloat("timeIntensity", self.blurIns*2.)
    self.vertBlurMat:setFloat("timeIntensity", self.blurIns*2.)

    local w = Amaz.BuiltinObject:getInputTextureWidth()
    local h = Amaz.BuiltinObject:getInputTextureHeight()
    if w ~= self.width or h ~= self.height then
        self.width = w
        self.height = h
    end

    -- if timeIntensity < .01 or self.sizeIntensity < .01 then
    --     self.bokeh0Cam_0.renderTexture.pecentX = 1
    --     self.bokeh0Cam_0.renderTexture.pecentY = 1

    -- else
    --     self.bokeh0Cam_0.renderTexture.pecentX = 0.55
    --     self.bokeh0Cam_0.renderTexture.pecentY = 0.55

    -- end
    self.bokeh0Mat:setFloat("timeIntensity", self.intensity)
    self.bokeh1Mat:setFloat("timeIntensity", self.intensity)
    self.horzBlurMat:setFloat("timeIntensity", self.intensity)
    self.vertBlurMat:setFloat("timeIntensity", self.intensity)

    self.radial_Blur:set("Amount",5.0 *self.intensity*2.5)
    self.s_Glow:set("brightness",0.9 *self.brightness)
    self.lumi_filter:set("uniAlpha",0.35 *self.filter)


    if self.sizeIns_2==1.5 then
        self.sizeIns_1 = 1.5
    else
        self.sizeIns_1 = self.sizeIns_2-0.4
    end
    

    self.passRadial:setFloat("sizeIns_1", math.max(0., self.sizeIns_1))
    self.passRadial:setFloat("sizeIns_2", math.max(0., self.sizeIns_2))
    self.passRadial:setFloat("centerX", math.max(0., self.centerX))
    self.passRadial:setFloat("centerY", math.max(0., self.centerY))

    self.passCClens:setFloat("sizeIns_1", math.max(0., self.sizeIns_1))
    self.passCClens:setFloat("sizeIns_2", math.max(0., self.sizeIns_2))
    self.passCClens:setFloat("centerX", math.max(0., self.centerX))
    self.passCClens:setFloat("centerY", math.max(0., self.centerY))

    self.passStrong_1:setFloat("sizeIns_1", math.max(0., self.sizeIns_1))
    self.passStrong_1:setFloat("sizeIns_2", math.max(0., self.sizeIns_2))
    self.passStrong_1:setFloat("centerX", math.max(0., self.centerX))
    self.passStrong_1:setFloat("centerY", math.max(0., self.centerY))
    
    self.passStrong_2:setFloat("sizeIns_1", math.max(0., self.sizeIns_1))
    self.passStrong_2:setFloat("sizeIns_2", math.max(0., self.sizeIns_2))
    self.passStrong_2:setFloat("centerX", math.max(0., self.centerX))
    self.passStrong_2:setFloat("centerY", math.max(0., self.centerY))
    
    self.passTwirl:setFloat("sizeIns_1", math.max(0., self.sizeIns_1))
    self.passTwirl:setFloat("sizeIns_2", math.max(0., self.sizeIns_2))
    self.passTwirl:setFloat("centerX", math.max(0., self.centerX))
    self.passTwirl:setFloat("centerY", math.max(0., self.centerY))
    
    self.bokeh0Mat_0:setFloat("sizeIns_1", math.max(0., self.sizeIns_1))
    self.bokeh0Mat_0:setFloat("sizeIns_2", math.max(0., self.sizeIns_2))
    self.bokeh0Mat_0:setFloat("centerX", math.max(0., self.centerX))
    self.bokeh0Mat_0:setFloat("centerY", math.max(0., self.centerY))

    self.horzBlurMat:setFloat("sizeIns_1", math.max(0., self.sizeIns_1))
    self.horzBlurMat:setFloat("sizeIns_2", math.max(0., self.sizeIns_2))
    self.horzBlurMat:setFloat("centerX", math.max(0., self.centerX))
    self.horzBlurMat:setFloat("centerY", math.max(0., self.centerY))

    self.vertBlurMat:setFloat("sizeIns_1", math.max(0., self.sizeIns_1))
    self.vertBlurMat:setFloat("sizeIns_2", math.max(0., self.sizeIns_2))
    self.vertBlurMat:setFloat("centerX", math.max(0., self.centerX))
    self.vertBlurMat:setFloat("centerY", math.max(0., self.centerY))

    self.bokeh0Mat:setFloat("sizeIns_1", math.max(0., self.sizeIns_1))
    self.bokeh0Mat:setFloat("sizeIns_2", math.max(0., self.sizeIns_2))
    self.bokeh0Mat:setFloat("centerX", math.max(0., self.centerX))
    self.bokeh0Mat:setFloat("centerY", math.max(0., self.centerY))

    self.bokeh1Mat:setFloat("sizeIns_1", math.max(0., self.sizeIns_1))
    self.bokeh1Mat:setFloat("sizeIns_2", math.max(0., self.sizeIns_2))
    self.bokeh1Mat:setFloat("centerX", math.max(0., self.centerX))
    self.bokeh1Mat:setFloat("centerY", math.max(0., self.centerY))
    



    -- self.passMix:setFloat("horizontal", self.horizontal)
    -- self.passMix:setFloat("vertical", self.vertical)


end

function SeekModeScript:onEvent(sys, event)
	if event.args:get(0) == "effects_adjust_intensity" then
        local intensity = event.args:get(1)
        self.intensity = intensity
    end
    if event.args:get(0) == "effects_adjust_size" then
        local intensity = event.args:get(1)
        self.sizeIns_2 = (1.0-intensity*100/65)*1.5
    end
	if event.args:get(0) == "effects_adjust_horizontal_shift" then
        local intensity = event.args:get(1)
        self.centerX = intensity
    end
	if event.args:get(0) == "effects_adjust_vertical_shift" then
        local intensity = event.args:get(1)
        self.centerY = intensity
    end
	if event.args:get(0) == "effects_adjust_luminance" then
        local intensity = event.args:get(1)
        self.brightness = intensity*10./3.
    end
	if event.args:get(0) == "effects_adjust_filter" then
        local intensity = event.args:get(1)
        self.filter = intensity*2.5
    end
end

exports.SeekModeScript = SeekModeScript
return exports
