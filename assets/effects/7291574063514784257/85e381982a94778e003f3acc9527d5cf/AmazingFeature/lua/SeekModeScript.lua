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
--@input float curTime = 0.0{"widget":"slider","min":0,"max":1}

local exports = exports or {}
local SeekModeScript = SeekModeScript or {}
SeekModeScript.__index = SeekModeScript

function SeekModeScript.new(construct, ...)
    local self = setmetatable({}, SeekModeScript)
    if construct and SeekModeScript.constructor then SeekModeScript.constructor(self, ...) end
    self.startTime = 0.0
    self.endTime = 10.0  
    self.curTime = 0.0
    self.width = 0
    self.height = 0
    return self
end
local ae_attribute = {
	["ADBE_Slider_Control_0001_0_0"]={
        {{0.224558976, 0.049081592, 0.920820776, 0.005608334, }, {4, 13, }, {{0, }, {10, }, }, }, 
    },
    ["ADBE_Glo2_0004_0_0"]={
		{{0.729643166, 0, 0.66666667, 1, }, {4, 13, }, {{0, }, {0.3, }, }, }, 
		{{0.33333333, 0, 0.66666667, 1, }, {13, 23, }, {{0.3, }, {0, }, }, }, 
	}, 
	["ADBE_Gaussian_Blur_2_0001_0_1"]={
		{{0.700673925, 0, 0.66666667, 1, }, {4, 13, }, {{0, }, {150, }, }, }, 
		{{0.33333333, 0, 0.66666667, 1, }, {13, 23, }, {{150, }, {0, }, }, }, 
	}, 
}
function SeekModeScript:onStart(comp)
    self.attrs = AETools:new(ae_attribute)
    self.tableCom = comp.entity.scene:findEntityBy("Table"):getComponent("TableComponent").table

    self.props    = comp.entity:getComponent("ScriptComponent").properties
    
    self.distortPassmat = comp.entity.scene:findEntityBy("distortPass"):getComponent("MeshRenderer").material
    
    self.getGlowMaskmat = comp.entity.scene:findEntityBy("getGlowMask"):getComponent("MeshRenderer").material

    self.blurYPassmat = comp.entity.scene:findEntityBy("blurY"):getComponent("MeshRenderer").material
    self.blur0Passmat = comp.entity.scene:findEntityBy("blur0"):getComponent("MeshRenderer").material
    self.blur1Passmat = comp.entity.scene:findEntityBy("blur1"):getComponent("MeshRenderer").material
    
    --"Transform"、"AnimSeqComponent"
end

function SeekModeScript:onUpdate(comp, detalTime)
    self.curTime=self.curTime+detalTime
    local props = comp.entity:getComponent("ScriptComponent").properties
    if props:has("curTime") and isEditor then
        self.curTime= props:get("curTime")
    end
    self:seekToTime(comp, self.curTime - self.startTime)
end
local function mix(a,b,x)
    return a*(1.0-x)+b*x
end

function SeekModeScript:seekToTime(comp, time)
    local lastNum ={-0.001,355,588,770,880,969,1010,1032,1076,1084.001}
    local oriNum ={-0.001,120.444,240.888,361.332,481.776,602.22,722.664,843.108,963.552,1084.001}
    local cutoutPointVec = Amaz.Vector()
    local AEProgress = time
    local input1 = Amaz.BuiltinObject.getUserTexture("#TransitionInput0")
    local input2 = Amaz.BuiltinObject.getUserTexture("#TransitionInput1")
    if input1 and input2 then
        self.input1 = input1
        self.input2 = input2
        if(Amaz.Input.frameTimestamp<=0.5 ) then
            self.distortPassmat:setTex("inputImageTexture", input1)
        else
            self.distortPassmat:setTex("inputImageTexture", input2)
        end
        -- self.curTime = Amaz.Input.frameTimestamp;
        AEProgress = Amaz.Input.frameTimestamp;
    end
    local distortAEProgress = ((1-math.abs(2*AEProgress-1.0))*9+4)/23

    local distortIns = self.attrs:GetVal("ADBE_Slider_Control_0001_0_0", distortAEProgress)[1]/10
    for i= 1,10 do
        local t1 = lastNum[i]
        local t0 = oriNum[i]
        local t = mix(t0,t1,distortIns)
        cutoutPointVec:pushBack(t)
    end
    self.distortPassmat:setFloatVector("u_CutoutPoints", cutoutPointVec)
    self.distortPassmat:setFloat("iTime", time)

    local featureProgress = (AEProgress*19+4)/23
    local glowIns = self.attrs:GetVal("ADBE_Glo2_0004_0_0", featureProgress)[1]*1.8
    self.blurYPassmat:setFloat("ins",glowIns)

    local blurAdjust = self.attrs:GetVal("ADBE_Gaussian_Blur_2_0001_0_1", featureProgress)[1]/256*0.6
    self.blur0Passmat:setFloat("blurAdjust",blurAdjust)
    self.blur1Passmat:setFloat("blurAdjust",blurAdjust)

end


exports.SeekModeScript = SeekModeScript
return exports






