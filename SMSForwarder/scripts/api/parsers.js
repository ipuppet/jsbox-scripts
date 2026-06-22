const SMS_FIELDS = ["name", "number", "content", "date", "type", "sim_id", "sub_id"]
const CALL_FIELDS = ["name", "number", "dateLong", "duration", "type", "sim_id"]
const CONTACT_FIELDS = ["name", "phone_number"]
const BATTERY_FIELDS = ["level", "scale", "voltage", "temperature", "status", "health", "plugged"]
const LOCATION_FIELDS = ["address", "latitude", "longitude", "provider", "time"]
const CONFIG_FIELDS = [
  "enable_api_battery_query",
  "enable_api_call_query",
  "enable_api_clone",
  "enable_api_contact_query",
  "enable_api_sms_query",
  "enable_api_sms_send",
  "enable_api_wol",
  "extra_device_mark",
  "extra_sim1",
  "extra_sim2",
  "sim_info_list"
]

function pickFields(source, fields) {
  if (!source || typeof source !== "object") {
    return {}
  }

  const result = {}
  fields.forEach(key => {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      result[key] = source[key]
    }
  })
  return result
}

function parseList(data, fields) {
  if (!Array.isArray(data)) {
    return []
  }
  return data.map(item => pickFields(item, fields))
}

function parseObject(data, fields) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {}
  }
  return pickFields(data, fields)
}

function parseSmsList(data) {
  return parseList(data, SMS_FIELDS)
}

function parseCallList(data) {
  return parseList(data, CALL_FIELDS)
}

function parseContactList(data) {
  return parseList(data, CONTACT_FIELDS)
}

function parseBattery(data) {
  return parseObject(data, BATTERY_FIELDS)
}

function parseLocation(data) {
  return parseObject(data, LOCATION_FIELDS)
}

function parseConfig(data) {
  return parseObject(data, CONFIG_FIELDS)
}

module.exports = {
  parseSmsList,
  parseCallList,
  parseContactList,
  parseBattery,
  parseLocation,
  parseConfig
}
