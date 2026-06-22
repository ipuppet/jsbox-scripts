const MainUI = require("./home")

class Factory {
  constructor(kernel) {
    this.kernel = kernel
  }

  main() {
    return new MainUI(this.kernel).getPage()
  }
}

module.exports = Factory
