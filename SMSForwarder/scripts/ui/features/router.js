const { UIKit } = require("../../libs/easy-jsbox")
const { getFeatureById } = require("./registry")
const { getPageBuilder } = require("./pages")

function openFeature(kernel, feature) {
  const target = typeof feature === "string" ? getFeatureById(feature) : feature
  if (!target) {
    return
  }

  const builder = getPageBuilder(target.id)
  if (!builder) {
    return
  }

  const page = builder(kernel)
  const options = {
    title: $l10n(target.titleKey),
    bgcolor: $color("insetGroupedBackground"),
    views: [page]
  }

  if (page.__navButtons) {
    options.navButtons = page.__navButtons
  }

  UIKit.push(options)
}

module.exports = {
  openFeature
}
