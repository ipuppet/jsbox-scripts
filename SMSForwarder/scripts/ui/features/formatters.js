const { parseSmsList, parseCallList, parseContactList, parseBattery, parseLocation } = require("../../api/parsers")

function formatJson(data) {
  try {
    return JSON.stringify(data, null, 2)
  } catch {
    return String(data)
  }
}

function formatActionResult(data) {
  if (typeof data === "string") {
    return data
  }
  return formatJson(data)
}

function formatObjectLines(item, fieldOrder) {
  return fieldOrder
    .filter(key => item[key] !== undefined && item[key] !== null && item[key] !== "")
    .map(key => `${key}: ${item[key]}`)
    .join("\n")
}

function formatSmsList(data) {
  const list = parseSmsList(data)
  if (list.length === 0) {
    return $l10n("NONE")
  }

  return list
    .map(item => {
      const type = item.type === 1 ? $l10n("SMS_RECEIVED") : $l10n("SMS_SENT")
      const date = new Date(item.date).toLocaleString()
      return [
        `${item.name} (${type})`,
        item.number,
        item.content,
        date,
        `sim_id: ${item.sim_id}`,
        `sub_id: ${item.sub_id}`
      ].join("\n")
    })
    .join("\n\n──────────\n\n")
}

function formatCallList(data) {
  const list = parseCallList(data)
  if (list.length === 0) {
    return $l10n("NONE")
  }

  const typeMap = {
    1: $l10n("CALL_IN"),
    2: $l10n("CALL_OUT"),
    3: $l10n("CALL_MISSED")
  }

  return list
    .map(item => {
      const date = new Date(item.dateLong).toLocaleString()
      const type = typeMap[item.type] || item.type
      const lines = []
      if (item.name) {
        lines.push(`${item.name} (${item.number})`)
      } else {
        lines.push(item.number)
      }
      lines.push(`(${type})`)
      lines.push(`${$l10n("DURATION")}: ${item.duration}s`)
      lines.push(date)
      lines.push(`sim_id: ${item.sim_id}`)
      return lines.join("\n")
    })
    .join("\n\n──────────\n\n")
}

function formatContactList(data) {
  const list = parseContactList(data)
  if (list.length === 0) {
    return $l10n("NONE")
  }

  return list
    .map(item => {
      const name = item.name || "-"
      const phones = String(item.phone_number || "")
        .split(";")
        .map(part => part.trim())
        .filter(Boolean)
      if (phones.length === 0) {
        return name
      }
      return `${name}\n${phones.join("\n")}`
    })
    .join("\n\n")
}

function formatBattery(data) {
  const item = parseBattery(data)
  const text = formatObjectLines(item, ["level", "scale", "voltage", "temperature", "status", "health", "plugged"])
  return text || $l10n("NONE")
}

function formatLocation(data) {
  const item = parseLocation(data)
  const text = formatObjectLines(item, ["address", "latitude", "longitude", "provider", "time"])
  return text || $l10n("NONE")
}

module.exports = {
  formatJson,
  formatActionResult,
  formatSmsList,
  formatCallList,
  formatContactList,
  formatBattery,
  formatLocation
}
