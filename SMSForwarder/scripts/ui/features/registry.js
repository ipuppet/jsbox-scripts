const FEATURES = [
  { id: "smsSend", icon: "square.and.pencil", color: "#34C759", titleKey: "FEATURE_SMS_SEND" },
  { id: "smsQuery", icon: "bubble.left.and.bubble.right.fill", color: "#5AC8FA", titleKey: "FEATURE_SMS_QUERY" },
  { id: "callQuery", icon: "clock.arrow.circlepath", color: "#FF9500", titleKey: "FEATURE_CALL_QUERY" },
  { id: "contactQuery", icon: "book.closed.fill", color: "#AF52DE", titleKey: "FEATURE_CONTACT_QUERY" },
  { id: "contactAdd", icon: "person.crop.circle.badge.plus", color: "#5856D6", titleKey: "FEATURE_CONTACT_ADD" },
  { id: "battery", icon: "battery.100", color: "#FFD60A", titleKey: "FEATURE_BATTERY" },
  { id: "wol", icon: "desktopcomputer", color: "#FF2D55", titleKey: "FEATURE_WOL" },
  { id: "location", icon: "mappin.circle.fill", color: "#30D158", titleKey: "FEATURE_LOCATION" }
]

function getFeatures() {
  return FEATURES
}

function getFeatureById(id) {
  return FEATURES.find(feature => feature.id === id)
}

module.exports = {
  FEATURES,
  getFeatures,
  getFeatureById
}
