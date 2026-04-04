---@class ScriptCompTemperatureTone: ScriptComponent
---@field temperatureIntensity number [UI(Range={-1., 1.}, Drag)]
---@field toneIntensity number [UI(Range={-1., 1.}, Drag)]
---@field InputTex Texture
---@field OutputTex Texture

local exports = exports or {}
local ScriptCompTemperatureTone = ScriptCompTemperatureTone or {}
ScriptCompTemperatureTone.__index = ScriptCompTemperatureTone

------------ util functions ------------
local function clamp(value, min, max)
    --[[
        Description: clamp value between [min, max]
    ]]
    return math.min(math.max(value, min), max)
end

local function mix(x, y, a)
    return x * (1. - a) + y * a
end

local function Mat3xVec3(mat3, vec3)
    --[[
        Description: matrix multiplication for `mat3x3 matmul vec3x1`
    ]]
    return {
        mat3[1][1] * vec3[1] + mat3[1][2] * vec3[2] + mat3[1][3] * vec3[3],
        mat3[2][1] * vec3[1] + mat3[2][2] * vec3[2] + mat3[2][3] * vec3[3],
        mat3[3][1] * vec3[1] + mat3[3][2] * vec3[2] + mat3[3][3] * vec3[3]
    }
end

local function Vec3xMat3(vec3, mat3)
    --[[
        Description: matrix multiplication for `vec1x3 matmul mat3x3`
    ]]
    return {
        mat3[1][1] * vec3[1] + mat3[2][1] * vec3[2] + mat3[3][1] * vec3[3],
        mat3[1][2] * vec3[1] + mat3[2][2] * vec3[2] + mat3[3][2] * vec3[3],
        mat3[1][3] * vec3[1] + mat3[2][3] * vec3[2] + mat3[3][3] * vec3[3]
    }
end

local function Mat3xMat3(mat3_1, mat3_2)
    --[[
        Description: matrix multiplication for `mat3x3 matmul mat3x3`
    ]]
    return {Vec3xMat3(mat3_1[1], mat3_2),
            Vec3xMat3(mat3_1[2], mat3_2),
            Vec3xMat3(mat3_1[3], mat3_2)}
end

local function diag(vec3)
    return {
        {vec3[1], 0.0, 0.0},
        {0.0, vec3[2], 0.0},
        {0.0, 0.0, vec3[3]}
    }
end

------------ class functions for ScriptComponent ------------
function ScriptCompTemperatureTone.new(construct, ...)
    local self = setmetatable({}, ScriptCompTemperatureTone)

    if construct and ScriptCompTemperatureTone.constructor then ScriptCompTemperatureTone.constructor(self, ...) end
    -- user parameters
    self.temperatureIntensity = 0.
    self.toneIntensity = 0.

    -- other parameters
    self.MinIntensity = -1.
    self.MaxIntensity = 1.
    self.Eps = 1e-5

    -- algorithm parameters
    self.baseTemperature = 6500
    self.baseTone = 0

    self.extraData = {
        0, 0.18006, 0.26352, -0.24341,
        10, 0.18066, 0.26589, -0.25479,
        20, 0.18133, 0.26846, -0.26876,
        30, 0.18208, 0.27119, -0.28539,
        40, 0.18293, 0.27407, -0.30470,
        50, 0.18388, 0.27709, -0.32675,
        60, 0.18494, 0.28021, -0.35156,
        70, 0.18611, 0.28342, -0.37915,
        80, 0.18740, 0.28668, -0.40955,
        90, 0.18880, 0.28997, -0.44278,
        100, 0.19032, 0.29326, -0.47888,
        125, 0.19462, 0.30141, -0.58204,
        150, 0.19962, 0.30921, -0.70471,
        175, 0.20525, 0.31647, -0.84901,
        200, 0.21142, 0.32312, -1.0182,
        225, 0.21807, 0.32909, -1.2168,
        250, 0.22511, 0.33439, -1.4512,
        275, 0.23247, 0.33904, -1.7298,
        300, 0.24010, 0.34308, -2.0637,
        325, 0.24792, 0.34655, -2.4681,
        350, 0.25591, 0.34951, -2.9641,
        375, 0.26400, 0.35200, -3.5814,
        400, 0.27218, 0.35407, -4.3633,
        425, 0.28039, 0.35577, -5.3762,
        450, 0.28863, 0.35714, -6.7262,
        475, 0.29685, 0.35823, -8.5955,
        500, 0.30505, 0.35907, -11.324,
        525, 0.31320, 0.35968, -15.628,
        550, 0.32129, 0.36011, -23.325,
        575, 0.32931, 0.36038, -40.770,
        600, 0.33724, 0.36051, -116.45,
    }

    self.A = {{0.8951, 0.2664, -0.1614}, {-0.7502, 1.7135, 0.0367}, {0.0389, -0.0685, 1.0296}}
    self.B = {{0.987, -0.1471, 0.16}, {0.4323, 0.5184, 0.0493}, {-0.0085, 0.04, 0.9685}}
    self.P = {
        {0.4123907992659595, 0.357584339383878, 0.1804807884018343},
        {0.21263900587151036, 0.715168678767756, 0.07219231536073371},
        {0.019330818715591832, 0.11919477979462598, 0.9505321522496607}
    }
    self.Q = {
        {3.2409699419045213, -1.5373831775700935, -0.4986107602930033},
        {-0.9692436362808796, 1.8759675015077208, 0.04155505740717562},
        {0.05563007969699364, -0.20397695888897655, 1.0569715142428784}
    }

    self.InputTex = nil
    self.OutputTex = nil
    return self
end

function ScriptCompTemperatureTone:setEffectAttr(key, value, comp)
    local function _setEffectAttr(_key, _value, _comp)
        if self[_key] ~= nil then
            self[_key] = _value
            if _comp and _comp.properties ~= nil then
                _comp.properties:set(_key, _value)
            end
        end
    end

    _setEffectAttr(key, value, comp)
end

function ScriptCompTemperatureTone:onStart(comp)
    self.matTemperatureTone = comp.entity:searchEntity("EntityTemperatureTone"):getComponent("MeshRenderer").material
    self.camTemperatureTone = comp.entity:searchEntity("CameraTemperatureTone"):getComponent("Camera")
end

function ScriptCompTemperatureTone:computeVec3(x, y)
    x = 1000000.0 / x
    y = y * 0.0001
    local index = 5
    local data = self.extraData[index]
    index = index + 4
    while (data <= x and index < #self.extraData + 1) do
        data = self.extraData[index]
        index = index + 4
    end
    local factor = (data - x) / (data - self.extraData[index - 2 * 4])
    local temp_1 = {
        mix(self.extraData[index - 3], self.extraData[index - 7], factor),
        mix(self.extraData[index - 2], self.extraData[index - 6], factor),
    }
    local a = self.extraData[index - 5]
    local b = self.extraData[index - 1]
    local sqA = math.sqrt(a * a + 1.0)
    local sqB = math.sqrt(b * b + 1.0)
    local temp_2 = {
        mix(1. / sqB, 1. / sqA, factor),
        mix(b / sqB, a / sqA, factor)
    }
    factor = math.sqrt(temp_2[1] * temp_2[1] + temp_2[2] * temp_2[2])
    temp_1 = {
        y * temp_2[1] / factor + temp_1[1],
        y * temp_2[2] / factor + temp_1[2],
    }
    temp_2 = -4.0 * temp_1[2] + temp_1[1] + 2.0
    a = temp_1[1] * 1.5 / temp_2
    b = temp_1[2] / temp_2
    a = clamp(a, 0.000001, 0.999999)
    b = clamp(b, 0.000001, 0.999999)
    if (a + b > 0.999999) then
        local t = 0.999999 / (a + b)
        a = a / t
        b = b / t
    end
    return {a / b, 1.0, (1. - a - b) / b}
end

function ScriptCompTemperatureTone:onUpdate(comp, deltaTime)
    -- prepare parameters
    self.temperatureIntensity = clamp(self.temperatureIntensity, self.MinIntensity, self.MaxIntensity)
    self.toneIntensity = clamp(self.toneIntensity, self.MinIntensity, self.MaxIntensity)

    -- set InputTex and OutputTex
    self.matTemperatureTone:setTex("u_inputTexture", self.InputTex)
    self.camTemperatureTone.renderTexture = self.OutputTex

    -- compute color matrix and set material parameters
    local t = self.temperatureIntensity
    local t2 = t * t
    local t3 = t2 * t
    local temperature = 6500. - 1970. * t + 876. * t2 - 2630. * t3
    local tone = self.toneIntensity * 100.

    if temperature == 6500. and tone == 0. then
        self.matTemperatureTone:setVec3("u_redVec3", Amaz.Vector3f(1., 0, 0))
        self.matTemperatureTone:setVec3("u_greenVec3", Amaz.Vector3f(0, 1., 0))
        self.matTemperatureTone:setVec3("u_blueVec3", Amaz.Vector3f(0, 0, 1.))
    else
        local vec3 = self:computeVec3(temperature, tone)
        local vec3Base = self:computeVec3(self.baseTemperature, self.baseTone)

        vec3 = Mat3xVec3(self.A, vec3)
        vec3Base = Mat3xVec3(self.A, vec3Base)
        local D = diag({vec3[1] / vec3Base[1], vec3[2] / vec3Base[2], vec3[3] / vec3Base[3]})
        local tmp = Mat3xMat3(D, self.A)
        tmp = Mat3xMat3(self.B, tmp)
        tmp = Mat3xMat3(tmp, self.P)
        tmp = Mat3xMat3(self.Q, tmp)
        self.matTemperatureTone:setVec3("u_redVec3", Amaz.Vector3f(tmp[1][1], tmp[1][2], tmp[1][3]))
        self.matTemperatureTone:setVec3("u_greenVec3", Amaz.Vector3f(tmp[2][1], tmp[2][2], tmp[2][3]))
        self.matTemperatureTone:setVec3("u_blueVec3", Amaz.Vector3f(tmp[3][1], tmp[3][2], tmp[3][3]))
    end
end

exports.ScriptCompTemperatureTone = ScriptCompTemperatureTone
return exports
