const { UIKit, ViewController, TabBarController, FileManager } = require("./libs/easy-jsbox")
const { AppKernelBase } = require("./app")

const compatibility = require("./compatibility")
const settingMethods = require("./setting/setting-methods")

/**
 * @typedef {AppKernel} AppKernel
 */
class AppKernel extends AppKernelBase {
    constructor() {
        super()
        this.query = $context.query

        settingMethods(this)

        this.fileManager = new FileManager()
    }
}

class AppUI {
    static kernel = new AppKernel()

    static renderMainUI() {
        const buttons = {
            home: { icon: "house.fill", title: $l10n("HOME") },
            list: { icon: "doc.plaintext", title: $l10n("LIST") },
            setting: { icon: "gear", title: $l10n("SETTING") }
        }

        if (UIKit.isTaio || this.kernel.setting.get("mainUIDisplayMode") === 0) {
            this.kernel.useJsboxNav()
            this.kernel.setting.useJsboxNav()
            this.kernel.setNavButtons([
                {
                    symbol: buttons.setting.icon,
                    title: buttons.setting.title,
                    handler: () => {
                        UIKit.push({
                            title: buttons.setting.title,
                            views: [this.kernel.setting.getListView()]
                        })
                    }
                }
            ])

            const Factory = require("./ui/factory")
            const factory = new Factory(this.kernel)
            this.kernel.UIRender(factory.home())
        } else {
            this.kernel.fileManager.setViewController(new ViewController())

            this.kernel.tabBarController = new TabBarController()

            const Factory = require("./ui/factory")
            const factory = new Factory(this.kernel)

            this.kernel.tabBarController
                .setPages({
                    home: factory.home(),
                    list: factory.list(),
                    setting: factory.setting()
                })
                .setCells({
                    home: buttons.home,
                    list: buttons.list,
                    setting: buttons.setting
                })

            this.kernel.UIRender(this.kernel.tabBarController.generateView().definition)
        }
    }
}

module.exports = {
    run: () => {
        compatibility(AppUI.kernel)
        AppUI.renderMainUI()
    }
}
