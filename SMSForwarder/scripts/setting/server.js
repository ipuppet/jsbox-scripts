const { SettingInput, SettingSwitch, SettingScript } = require("../libs/easy-jsbox")

module.exports = {
  items: [
    new SettingInput({
      icon: ["link", "#007AFF"],
      title: "SERVER_URL",
      key: "server.baseUrl",
      value: ""
    }).with({ kbType: $kbType.url }),
    new SettingSwitch({
      icon: ["lock.shield.fill", "#FF9500"],
      title: "USE_SIGN",
      key: "server.useSign",
      value: false
    }),
    new SettingInput({
      icon: ["key.fill", "#FF3B30"],
      title: "SIGN_SECRET",
      key: "server.secret",
      value: ""
    }).with({ secure: true }),
    new SettingScript({
      icon: ["antenna.radiowaves.left.and.right", "#34C759"],
      title: "TEST_CONNECTION"
    }).with({ script: "this.method.testConnection" })
  ]
}
