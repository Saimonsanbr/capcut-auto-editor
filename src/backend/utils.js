const { v4: uuidv4 } = require('uuid');

function generateUUID() {
  return uuidv4().toUpperCase();
}

function createScaleKeyframes(startScale, endScale, durationUs) {
  return [{
    id: generateUUID(),
    property_type: "KFTypeScaleX",
    material_id: "",
    keyframe_list: [
      {
        id: generateUUID(), curveType: "Line", time_offset: 0,
        left_control: { x: 0.0, y: 0.0 }, right_control: { x: 0.0, y: 0.0 },
        values: [startScale], string_value: "", graphID: ""
      },
      {
        id: generateUUID(), curveType: "Line", time_offset: durationUs,
        left_control: { x: 0.0, y: 0.0 }, right_control: { x: 0.0, y: 0.0 },
        values: [endScale], string_value: "", graphID: ""
      }
    ]
  }];
}

// Pan vertical p/ imagens grandes: zoom fixo + movimento Y (cima↔baixo).
// Replica o formato que o CapCut salva (PositionX parado, PositionY animado,
// ScaleX e Rotation estáticos; último key no último frame: duração - 33334).
function createPanKeyframes(scale, startY, endY, durationUs) {
  const endOffset = Math.max(0, durationUs - 33334);
  function key(prop, list) {
    return {
      id: generateUUID(),
      property_type: prop,
      material_id: "",
      keyframe_list: list.map(([t, v]) => ({
        id: generateUUID(), curveType: "Line", time_offset: t,
        left_control: { x: 0.0, y: 0.0 }, right_control: { x: 0.0, y: 0.0 },
        values: [v], string_value: "", graphID: ""
      }))
    };
  }
  return [
    key("KFTypePositionX", [[0, 0.0], [endOffset, 0.0]]),
    key("KFTypePositionY", [[0, startY], [endOffset, endY]]),
    key("KFTypeScaleX", [[0, scale]]),
    key("KFTypeRotation", [[0, 0.0]])
  ];
}

module.exports = {
  generateUUID,
  createScaleKeyframes,
  createPanKeyframes
};
