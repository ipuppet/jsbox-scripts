const { Kernel, Toast } = require("../libs/easy-jsbox")

/**
 * @typedef {import("../app-main").AppKernel} AppKernel
 */

/**
 * @param {AppKernel} kernel
 */
function settingMethods(kernel) {
  kernel.setting.method.tips = () => {
    Toast.info($l10n("TIPS_MESSAGE"))
  }

  kernel.setting.method.checkUpdate = async animate => {
    animate.start()

    const easyJsboxPath = "scripts/libs/easy-jsbox.js"
    if ($file.exists(easyJsboxPath)) {
      try {
        const res = await kernel.checkUpdate()
        if (res) {
          $file.write({
            data: $data({ string: res }),
            path: easyJsboxPath
          })
          $ui.toast("The framework has been updated.")
        }
      } catch {}
    }

    let info
    try {
      info = __INFO__
    } catch {
      info = JSON.parse($file.read("config.json").string).info
    }

    const updateUrl = "{{UPDATE_CHECK_URL}}"
    if (updateUrl && !updateUrl.startsWith("{{")) {
      try {
        const resp = await $http.get({ url: updateUrl })
        const version = resp.data?.info?.version
        if (version && Kernel.versionCompare(version, info.version) > 0) {
          $ui.alert({
            title: $l10n("NEW_VERSION"),
            message: $l10n("NEW_VERSION_MESSAGE").replace("%@", version),
            actions: [{ title: $l10n("OK") }]
          })
        } else {
          $ui.toast($l10n("NO_UPDATE"))
        }
      } catch (error) {
        kernel.logger.error(error)
        $ui.toast($l10n("NO_UPDATE"))
      }
    } else {
      $ui.toast($l10n("NO_UPDATE"))
    }

    animate.done()
  }

  kernel.setting.method.fileManager = () => {
    kernel.fileManager.push(kernel.fileStorage.basePath)
  }
}

module.exports = settingMethods
