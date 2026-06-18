const { UIKit, SettingInfo, SettingScript, SettingTab } = require("../libs/easy-jsbox")

const generalSection = require("./general/general")

const displaySection = {
    items: [
        new SettingScript({
            icon: ["folder.fill", "#FF9900"],
            title: "FILE_MANAGEMENT"
        }).with({ script: "this.method.fileManager" })
    ].concat(
        UIKit.isTaio
            ? []
            : [
                  new SettingTab({
                      icon: ["rectangle.topthird.inset.filled", "#A569BD"],
                      title: "DISPLAY_MODE",
                      key: "mainUIDisplayMode",
                      value: 1
                  })
                      .with({ items: ["CLASSIC", "MODERN"] })
                      .onSet(() => $delay(0.3, () => $addin.restart()))
              ]
    )
}

const aboutSection = {
    items: [
        new SettingInfo({
            icon: ["link", "#007AFF"],
            title: "GITHUB",
            value: ["{{GITHUB_REPO}}", "{{GITHUB_URL}}"]
        }),
        new SettingInfo({
            icon: ["person.fill", "#FF9900"],
            title: "AUTHOR",
            value: ["{{AUTHOR}}", "{{WEBSITE}}"]
        }),
        new SettingScript({
            icon: "arrow.2.circlepath",
            title: "CHECK_UPDATE"
        }).with({ script: "this.method.checkUpdate" }),
        new SettingScript({
            icon: ["book.fill", "#A569BD"],
            title: "README"
        }).with({ script: "this.method.readme" }),
        new SettingScript({
            icon: ["lightbulb.fill", "#FFCC00"],
            title: "TIPS"
        }).with({ script: "this.method.tips" })
    ]
}

/**
 * @typedef {import("../app-main").AppKernel} AppKernel
 * @param {AppKernel} kernel
 */
module.exports = kernel => [
    {
        title: "GENERAL",
        items: generalSection(kernel).items
    },
    displaySection,
    aboutSection
]
