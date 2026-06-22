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

  UIKit.push({
    title: $l10n(target.titleKey),
    bgcolor: $color("insetGroupedBackground"),
    views: [builder(kernel)]
  })
}

module.exports = {
  openFeature
}
