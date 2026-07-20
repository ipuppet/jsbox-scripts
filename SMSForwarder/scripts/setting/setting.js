const { SettingInfo, SettingScript } = require("../libs/easy-jsbox")

const serverSection = require("./server")

const aboutSection = {
  items: [
    new SettingInfo({
      icon: ["link", "#007AFF"],
      title: "GITHUB",
      value: ["ipuppet/jsbox-scripts", "https://github.com/ipuppet/jsbox-scripts/tree/main/SMSForwarder"]
    }),
    new SettingInfo({
      icon: ["person.fill", "#FF9900"],
      title: "AUTHOR",
      value: ["ipuppet", "https://blog.samuelwei.dev"]
    }),
    new SettingScript({
      icon: ["book.fill", "#A569BD"],
      title: "README"
    }).with({ script: "this.method.readme" })
  ]
}

/**
 * @typedef {import("../app-main").AppKernel} AppKernel
 * @param {AppKernel} kernel
 */
module.exports = () => [
  {
    title: "SERVER",
    items: serverSection.items
  },
  aboutSection
]
