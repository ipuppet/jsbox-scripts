const sms = require("./sms")
const call = require("./call")
const contact = require("./contact")
const device = require("./device")

const PAGE_BUILDERS = {
  smsSend: sms.buildSmsSendPage,
  smsQuery: sms.buildSmsQueryPage,
  callQuery: call.buildCallQueryPage,
  contactQuery: contact.buildContactQueryPage,
  contactAdd: contact.buildContactAddPage,
  battery: device.buildBatteryPage,
  wol: device.buildWolPage,
  location: device.buildLocationPage
}

function getPageBuilder(featureId) {
  return PAGE_BUILDERS[featureId]
}

module.exports = {
  PAGE_BUILDERS,
  getPageBuilder
}
