const { SettingSwitch, SettingTab, SettingChild } = require("../../libs/easy-jsbox")

module.exports = new SettingChild({
    icon: ["paintbrush.fill", "#5AC8FA"],
    title: "APPEARANCE"
}).with({
    children: [
        {
            items: [
                new SettingSwitch({
                    icon: ["textformat.size", "#007AFF"],
                    title: "USE_LARGE_TITLE",
                    key: "appearance.largeTitle",
                    value: true
                }),
                new SettingSwitch({
                    icon: ["rectangle.bottomthird.inset.filled", "#34C759"],
                    title: "SHOW_FOOTER",
                    key: "appearance.showFooter",
                    value: true
                })
            ]
        }
    ]
})
