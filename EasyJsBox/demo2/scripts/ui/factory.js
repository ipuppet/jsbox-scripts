const { TabBarController } = require("../libs/easy-jsbox")

class Factory {
  constructor(kernel) {
    this.kernel = kernel
  }

  home() {
    const HomeUI = require("./home")
    return new HomeUI(this.kernel).getPage()
  }

  list() {
    const ListUI = require("./list")
    return new ListUI(this.kernel).getPage()
  }

  setting() {
    return this.kernel.setting.getPage()
  }
}

module.exports = Factory
