const { UIKit, Kernel, Logger, FileStorage, Setting } = require("./libs/easy-jsbox")
const SettingStructure = require("./setting/setting")

/**
 * @typedef {AppKernelBase} AppKernelBase
 */
class AppKernelBase extends Kernel {
  static fileStorage = new FileStorage({
    basePath: UIKit.isTaio ? FileStorage.join($file.rootPath, "{{STORAGE_NAME}}") : "shared://{{STORAGE_NAME}}"
  })

  constructor() {
    super()
    $app.listen({ exit: () => $objc_clean() })

    this.fileStorage = AppKernelBase.fileStorage

    this.logger = new Logger()
    this.logger.printToFile([Logger.level.warn, Logger.level.error])
    this.logger.setWriter(this.fileStorage, FileStorage.join("logs", this.logFile))

    this.setting = new Setting({
      logger: this.logger,
      fileStorage: this.fileStorage,
      structure: SettingStructure(this)
    })
  }

  get logFile() {
    return "{{STORAGE_NAME}}.log"
  }
}

module.exports = {
  AppKernelBase
}
