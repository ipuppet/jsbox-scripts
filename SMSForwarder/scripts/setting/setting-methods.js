const { Toast } = require("../libs/easy-jsbox")
const ServerConfig = require("../api/server-config")

/**
 * @typedef {import("../app-main").AppKernel} AppKernel
 */

/**
 * @param {AppKernel} kernel
 */
function settingMethods(kernel) {
  kernel.serverConfig = new ServerConfig(kernel)

  kernel.setting.method.testConnection = async animate => {
    animate.start()

    try {
      kernel.serverConfig.clear()
      const data = await kernel.serverConfig.fetch({ force: true })
      const device = data?.extra_device_mark || $l10n("CONNECTION_OK")
      $ui.toast(`${$l10n("CONNECTION_OK")}: ${device}`)
    } catch (error) {
      kernel.logger.error(error)
      $ui.toast(error.message || $l10n("CONNECTION_FAILED"))
    }

    animate.done()
  }
}

module.exports = settingMethods
