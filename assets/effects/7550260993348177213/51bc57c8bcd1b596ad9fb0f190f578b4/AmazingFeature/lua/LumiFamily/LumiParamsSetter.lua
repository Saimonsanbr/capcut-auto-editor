local LumiParamsSetter = {}
LumiParamsSetter.__index = LumiParamsSetter

local AE_EFFECT_TAG = 'AE_EFFECT_TAG LumiTag'

function LumiParamsSetter.new(lumiManager, params, keyframes, effectType, sliderInfos, fadeinInfos, fadeoutInfos)
    local self = setmetatable({}, LumiParamsSetter)
    self.lumiManager = lumiManager
    self.params = params
    self.keyframes = keyframes
    self.sliderInfos = sliderInfos
    self.sliderParams = {}
    self.XTEvent = (effectType == 'xtFilter' or  effectType == 'xtEffect')
    self.fadeinInfos = fadeinInfos
    self.fadeoutInfos = fadeoutInfos
    self.afterSliderParams = {}

    return self
end

local function clamp(val, min, max)
    return math.max(math.min(val, max), min)
end

local function mix(a, b, t)
    return a * (1 - t) + b * t
end

local function cvtTable2Amaz(attrType, v)
    local value = nil
    if attrType == "number" then
        if #v == 1 then
            value = v[1]
        else
            Amaz.LOGE(AE_EFFECT_TAG, "Invalid keyframe: " .. key .. " size: " .. #v)
        end
    elseif attrType == "vector" then
        if #v == 2 then
            value = Amaz.Vector2f(v[1], v[2])
        elseif #v == 3 then
            value = Amaz.Vector3f(v[1], v[2], v[3])
        elseif #v == 4 then
            value = Amaz.Vector4f(v[1], v[2], v[3], v[4])
        else
            Amaz.LOGE(AE_EFFECT_TAG, "Invalid keyframe: " .. key .. " size: " .. #v)
        end
    elseif attrType == "color" then
        if #v == 3 then
            value = Amaz.Color(v[1], v[2], v[3], 1.0)
        elseif #v == 4 then
            value = Amaz.Color(v[1], v[2], v[3], v[4])
        else
            Amaz.LOGE(AE_EFFECT_TAG, "Invalid keyframe: " .. key .. " size: " .. #v)
        end
    else
        Amaz.LOGE(AE_EFFECT_TAG, "Invalid keyframe: " .. key .. "unsupported type: " .. attrType)
    end
    return value
end

local function getValueType(value)
    local valueType = type(value)
    if valueType == 'userdata' then
        local str = tostring(value)
        if string.sub(str, 1, 6) == 'Vector' then
            valueType = 'vector'
        elseif string.sub(str, 1, 5) == 'Color' then
            valueType = 'color'
        end
    end

    return valueType
end

local function add(value, number)
    local type = getValueType(value)
    if type == 'number' then
        return value + number
    elseif type == 'vector' then
        local ret = value:copy()
        ret.x = ret.x + number
        ret.y = ret.y + number
        if ret.z then ret.z = ret.z + number end
        if ret.w then ret.w = ret.w + number end
        return ret
    elseif type == 'color' then
        return Amaz.Color(
            value.r + number,
            value.g + number,
            value.b + number,
            value.a + number
        )
    end
    return nil
end

local function mul(value, number)
    local type = getValueType(value)
    if type == 'color' then
        return Amaz.Color(
            value.r * number,
            value.g * number,
            value.b * number,
            value.a * number
        )
    end
    return value * number
end

function LumiParamsSetter:getCurrentDefaultParam(entityName, key, aeTime)
    local keyframeName = nil
    local keyframeType = 'number'
    if self.keyframes ~= nil then
        keyframeName = entityName .. '#' .. key .. '#' .. 'number'
        if self.keyframes.attrs[keyframeName] == nil then
            keyframeName = entityName .. '#' .. key .. '#' .. 'vector'
            keyframeType = 'vector'
            if self.keyframes.attrs[keyframeName] == nil then
                keyframeName = entityName .. '#' .. key .. '#' .. 'color'
                keyframeType = 'color'
                if self.keyframes.attrs[keyframeName] == nil then
                    keyframeName = nil
                end
            end
        end

        if keyframeName == nil then
            if entityName:sub(1, #'LumiLayer') == 'LumiLayer' and key:sub(-#'position') == 'position' then
                local entity = self.params[entityName]
                if entity ~= nil then
                    local position = entity[key]
                    if position ~= nil then
                        local hasSeparated = false
                        local newPosition = position:copy()

                        local newKey = string.gsub(key, 'position', 'xPosition')
                        local newKeyframeName = entityName .. '#' .. newKey .. '#' .. 'number'
                        if self.keyframes.attrs[newKeyframeName] ~= nil then
                            newPosition.x = cvtTable2Amaz('number', self.keyframes:GetVal(newKeyframeName, self.lumiManager:getKeyframeAeTime(aeTime)))
                            hasSeparated = true
                        end

                        newKey = string.gsub(key, 'position', 'yPosition')
                        newKeyframeName = entityName .. '#' .. newKey .. '#' .. 'number'
                        if self.keyframes.attrs[newKeyframeName] ~= nil then
                            newPosition.y = cvtTable2Amaz('number', self.keyframes:GetVal(newKeyframeName, self.lumiManager:getKeyframeAeTime(aeTime)))
                            hasSeparated = true
                        end

                        newKey = string.gsub(key, 'position', 'zPosition')
                        newKeyframeName = entityName .. '#' .. newKey .. '#' .. 'number'
                        if self.keyframes.attrs[newKeyframeName] ~= nil then
                            newPosition.z = cvtTable2Amaz('number', self.keyframes:GetVal(newKeyframeName, self.lumiManager:getKeyframeAeTime(aeTime)))
                            hasSeparated = true
                        end

                        if hasSeparated then
                            return newPosition
                        end
                    end
                end
            end
        end
    end

    local value = nil
    if keyframeName ~= nil  then
        value = cvtTable2Amaz(keyframeType, self.keyframes:GetVal(keyframeName, self.lumiManager:getKeyframeAeTime(aeTime)))
    else
        local entity = self.params[entityName]
        if entity ~= nil then
            value = entity[key]
        end
    end
    return value
end

function LumiParamsSetter:updateSlider(lumi_obj, aeTime)
    -- local sliderIntensity = self.sliderParams['effects_adjust_blur']
    -- local gaussianIntensity = self:getCurrentDefaultParam("Gaussian_Blur_Root_353-effect2", 'intensity', aeTime)
    -- if sliderIntensity and gaussianIntensity then
    --     lumi_obj:setSubEffectAttr("Gaussian_Blur_Root_353-effect2", 'intensity', gaussianIntensity*sliderIntensity)
    -- end

    local function fsub(value, slider, valueA, valueB)
        -- (param - sliderValue) * valueA + valueB
        return (value - slider) * valueA + valueB
    end
    
    local function fmul(value, slider, valueA, valueB)
        -- (param - valueA) * sliderValue + valueB
        return (value - valueA) * slider + valueB
    end

    local function fadd(value, slider, valueA, valueB)
        -- (param - valueA) * valueB + sliderValue
        return (value - valueA) * valueB + slider
    end

    self.afterSliderParams = {}
    for sliderKey, paramsInfos in pairs(self.sliderInfos) do
        if self.sliderParams[sliderKey] ~= nil then
            for index, value in ipairs(paramsInfos) do
                local sliderIntensity = self.sliderParams[sliderKey]
                local entityName = value[1]
                local paramKey = value[2]
                local paramType = value[3]
                local paramDimensionFlag = value[4]
                local calcType = value[5]
                local maxValue = value[6]
                local minValue = value[7]
                local defaultValue = value[8]
                local valueA = value[9]
                local valueB = value[10]
                sliderIntensity = sliderIntensity * (maxValue - minValue) + minValue
                local oriValue = self:getCurrentDefaultParam(entityName, paramKey, aeTime)
                if self.afterSliderParams[entityName .. '#' .. paramKey] ~= nil then
                    oriValue = self.afterSliderParams[entityName .. '#' .. paramKey]
                end
                local newValue = oriValue
                local calcFunc = nil
                if calcType == 0 then
                    calcFunc = fsub
                elseif calcType == 1 then
                    calcFunc = fmul
                elseif calcType == 2 then
                    calcFunc = fadd
                else
                    Amaz.LOGE(AE_EFFECT_TAG, 'Unknown calcType: ' .. calcType)
                    return
                end
                if paramType == 'number' then
                    if paramDimensionFlag[1] then newValue = calcFunc(oriValue, sliderIntensity, valueA[1], valueB[1]) end
                elseif paramType == 'color' then
                    newValue = oriValue:copy()
                    if paramDimensionFlag[1] then newValue.r = calcFunc(oriValue.r, sliderIntensity, valueA[1], valueB[1]) end
                    if paramDimensionFlag[2] then newValue.g = calcFunc(oriValue.g, sliderIntensity, valueA[2], valueB[2]) end
                    if paramDimensionFlag[3] then newValue.b = calcFunc(oriValue.b, sliderIntensity, valueA[3], valueB[3]) end
                    if paramDimensionFlag[4] then newValue.a = calcFunc(oriValue.a, sliderIntensity, valueA[4], valueB[4]) end
                elseif paramType == 'vector' then
                    newValue = oriValue:copy()
                    if paramDimensionFlag[1] then newValue.x = calcFunc(oriValue.x, sliderIntensity, valueA[1], valueB[1]) end
                    if paramDimensionFlag[2] then newValue.y = calcFunc(oriValue.y, sliderIntensity, valueA[2], valueB[2]) end
                    if paramDimensionFlag[3] then newValue.z = calcFunc(oriValue.z, sliderIntensity, valueA[3], valueB[3]) end
                    if paramDimensionFlag[4] then newValue.w = calcFunc(oriValue.w, sliderIntensity, valueA[4], valueB[4]) end
                end
                lumi_obj:setSubEffectAttr(entityName, paramKey, newValue)
                self.afterSliderParams[entityName .. '#' .. paramKey] = newValue
            end
        end
    end
end

function LumiParamsSetter:updateFadeParams(lumi_obj, fadeInfos, factor, aeTime)
    for i = 1, #fadeInfos.infos do
        local entityName = fadeInfos.infos[i][1]
        local paramKey = fadeInfos.infos[i][2]
        local valueType = fadeInfos.infos[i][3]
        local value = fadeInfos.infos[i][4]

        local curValue = nil
        if self.afterSliderParams[entityName .. '#' .. paramKey] ~= nil then
            curValue = self.afterSliderParams[entityName .. '#' .. paramKey]
        else
            curValue = self:getCurrentDefaultParam(entityName, paramKey, aeTime)
        end

        if curValue ~= nil then
            local needRenew = true
            if valueType == 'number' then
                curValue = mix(value[1], curValue, factor)
            elseif valueType == 'color' then
                curValue.r = mix(value[1], curValue.r, factor)
                curValue.g = mix(value[2], curValue.g, factor)
                curValue.b = mix(value[3], curValue.b, factor)
                curValue.a = mix(value[4], curValue.a, factor)
            elseif valueType == 'vector' then
                if #value <= 1 or #value >= 5 then
                    needRenew = false
                    Amaz.LOGE(AE_EFFECT_TAG, 'Invalid value size: ' .. #value)
                else
                    if #value >= 2 then
                        curValue.x = mix(value[1], curValue.x, factor)
                        curValue.y = mix(value[2], curValue.y, factor)
                    end
                    if #value >= 3 then
                        curValue.z = mix(value[3], curValue.z, factor)
                    end
                    if #value >= 4 then
                        curValue.w = mix(value[4], curValue.w, factor)
                    end
                end
            else
                needRenew = false
                Amaz.LOGE(AE_EFFECT_TAG, 'Invalid valye type: ' .. valueType)
            end
            if needRenew then
                lumi_obj:setSubEffectAttr(entityName, paramKey, curValue)
            end
        end
    end
end

function LumiParamsSetter:updateFade(lumi_obj, startTime, endTime, curTime, compDurations, aeTime)
    local scale = (endTime - startTime) / (compDurations[2] - compDurations[1])
    scale = clamp(scale, 0, 1)
    local runningTime = curTime - startTime
    local remainingTime = endTime - curTime

    local isInFadein = false
    if self.fadeinInfos
    and self.fadeinInfos.time and self.fadeinInfos.time > 0
    and self.fadeinInfos.infos and #self.fadeinInfos.infos > 0
    then
        local fadeinTime = self.fadeinInfos.time * scale
        if runningTime <= fadeinTime then
            isInFadein = true
            local factor = runningTime / fadeinTime
            factor = clamp(factor, 0, 1)
            self:updateFadeParams(lumi_obj, self.fadeinInfos, factor, aeTime)
        end
    end

    if self.fadeoutInfos
    and self.fadeoutInfos.time and self.fadeoutInfos.time > 0
    and self.fadeoutInfos.infos and #self.fadeoutInfos.infos > 0
    then
        local fadeoutTime = self.fadeoutInfos.time * scale
        if remainingTime <= fadeoutTime or not isInFadein then
            local factor = remainingTime / fadeoutTime
            factor = clamp(factor, 0, 1)
            self:updateFadeParams(lumi_obj, self.fadeoutInfos, factor, aeTime)
        end
    end
end

function LumiParamsSetter:onEvent(lumi_obj, event)
    if lumi_obj == nil or event == nil then return end
    local key = event.args:get(0)
    if self.sliderInfos[key] ~= nil then
        if self.XTEvent then
            self.sliderParams[key] = event.args:get(2);
        else
            self.sliderParams[key] = event.args:get(1);
        end
    end
end

function LumiParamsSetter:initParams(lumi_obj)
    if lumi_obj == nil then return end
    if self.params == nil then return end
    if self.init then return end

    for entityName, params in pairs(self.params) do
        for key, value in pairs(params) do
            lumi_obj:setSubEffectAttr(entityName, key, value)
        end
    end

    self.init = true
end

function LumiParamsSetter:updateKeyFrameData(lumi_obj, aeTime)
    if lumi_obj == nil then return end
    if self.keyframes == nil then return end

    local p = aeTime
    for key, _ in pairs(self.keyframes.attrs) do
        local keys = {}
        for substr in string.gmatch(key, "[^#]+") do
            table.insert(keys, substr)
        end
        if #keys == 3 then
            local entityName = keys[1]
            local attrName = keys[2]
            local attrType = keys[3]
            local v = self.keyframes:GetVal(key, self.lumiManager:getKeyframeAeTime(p))
            local value = cvtTable2Amaz(attrType, v)
            if value then
                lumi_obj:setSubEffectAttr(entityName, attrName, value)
            end
        else
            Amaz.LOGE(AE_EFFECT_TAG, "Invalid keyframe: " .. key)
        end
    end
end

return LumiParamsSetter
