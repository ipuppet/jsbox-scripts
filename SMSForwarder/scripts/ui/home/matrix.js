const { getFeatures } = require("../features/registry")
const { openFeature } = require("../features/router")

const ITEM_HEIGHT = 72
const COLUMNS = 2
const SPACING = 10

const TEMPLATE = {
  props: {
    smoothCorners: true,
    cornerRadius: 14,
    bgcolor: $color("secondarySurface"),
    borderWidth: 0.5,
    borderColor: $color("separator")
  },
  views: [
    {
      type: "image",
      props: {
        id: "color",
        cornerRadius: 10,
        smoothCorners: true
      },
      layout: (make, view) => {
        const size = 36
        make.left.inset(12)
        make.centerY.equalTo(view.super)
        make.size.equalTo($size(size, size))
      }
    },
    {
      type: "image",
      props: {
        id: "icon",
        tintColor: $color("white"),
        contentMode: $contentMode.scaleAspectFit
      },
      layout: (make, view) => {
        make.edges.equalTo(view.prev).insets(7)
      }
    },
    {
      type: "label",
      props: {
        id: "title",
        font: $font(14),
        lines: 2,
        textColor: $color("primaryText")
      },
      layout: (make, view) => {
        make.left.equalTo(view.prev.right).offset(14)
        make.right.inset(10)
        make.centerY.equalTo(view.super)
      }
    },
    {
      type: "view",
      props: {
        id: "info",
        hidden: true
      }
    }
  ]
}

function featureToData(feature) {
  return {
    color: {
      bgcolor: $color(feature.color)
    },
    icon: {
      symbol: feature.icon,
      textColor: $color("white")
    },
    title: {
      text: $l10n(feature.titleKey),
      textColor: $color("primaryText")
    },
    info: {
      info: feature
    }
  }
}

function resolveFeature(sender, indexPath, data) {
  const features = getFeatures()

  if (data?.info?.info) {
    return data.info.info
  }

  const object = sender?.object?.(indexPath)
  if (object?.info?.info) {
    return object.info.info
  }

  const index = indexPath?.item ?? indexPath?.row ?? 0
  return features[index]
}

function getMatrixView(kernel, { embedded = false } = {}) {
  return {
    type: "matrix",
    props: {
      bgcolor: embedded ? $color("clear") : $color("insetGroupedBackground"),
      columns: COLUMNS,
      itemHeight: ITEM_HEIGHT,
      spacing: SPACING,
      data: getFeatures().map(featureToData),
      template: TEMPLATE
    },
    layout: embedded
      ? (make, view) => {
          make.left.right.bottom.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).offset(10)
        }
      : $layout.fill,
    events: {
      didSelect: (sender, indexPath, data) => {
        const feature = resolveFeature(sender, indexPath, data)
        if (feature) {
          openFeature(kernel, feature)
        }
      }
    }
  }
}

module.exports = {
  getMatrixView
}
