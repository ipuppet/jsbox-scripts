const { UIKit, FileManager } = require("./libs/easy-jsbox")
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
    this.kernel.useJsboxNav()
    this.kernel.setting.useJsboxNav()
    this.kernel.setNavButtons([
      {
        symbol: "gear",
        title: $l10n("SETTING"),
        handler: () => {
          UIKit.push({
            title: $l10n("SETTING"),
            views: [this.kernel.setting.getListView()]
          })
        }
      }
    ])

    const Factory = require("./ui/factory")
    const factory = new Factory(this.kernel)
    this.kernel.UIRender(factory.main())
  }
}

module.exports = {
  run: () => {
    compatibility(AppUI.kernel)
    AppUI.renderMainUI()
  }
}
