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

module.exports = {
  generateUUID,
  createScaleKeyframes
};
