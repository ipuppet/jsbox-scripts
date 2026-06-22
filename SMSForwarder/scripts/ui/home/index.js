const { NavigationView } = require("../../libs/easy-jsbox")
const { getMatrixView } = require("./matrix")
const { getInfoBannerView, refreshInfoBanner } = require("./info-banner")

function getHomeView(kernel) {
  return {
    type: "view",
    props: {
      bgcolor: $color("insetGroupedBackground")
    },
    layout: $layout.fill,
    views: [getInfoBannerView(kernel), getMatrixView(kernel, { embedded: true })],
    events: {
      ready: () => refreshInfoBanner(kernel),
      appeared: () => refreshInfoBanner(kernel)
    }
  }
}

class MainUI {
  constructor(kernel) {
    this.kernel = kernel
  }

  getPage() {
    const navigationView = new NavigationView()

    navigationView.navigationBar.setPrefersLargeTitles(false)
    navigationView.setView(getHomeView(this.kernel))

    return navigationView.getPage()
  }
}

module.exports = MainUI
