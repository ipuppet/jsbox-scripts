const MARGIN = 16
const CARD_RADIUS = 12
const ROW_HEIGHT = 44
const BUTTON_ROW_HEIGHT = 56
const LIST_ID = "featurePageList"
const ROW_INSET = 16
const RESULT_TEXT_CACHE = {}

function measureResultHeight(text) {
  if (!text) {
    return ROW_HEIGHT
  }

  const width = $device.info.screen.width - ROW_INSET * 2 - MARGIN * 2
  const size = $text.sizeThatFits({
    text,
    width: Math.max(width, 200),
    font: $font(14)
  })
  return Math.max(ROW_HEIGHT, size.height + 32)
}

function createPage({ views, onReady }) {
  const sections = []

  views.forEach(item => {
    if (item?.__pageBlock === "section") {
      sections.push({ rows: item.rows })
    }
  })

  const page = {
    type: "list",
    props: {
      id: LIST_ID,
      style: 2,
      bgcolor: $color("insetGroupedBackground"),
      separatorInset: $insets(0, ROW_INSET, 0, 0),
      data: sections
    },
    layout: $layout.fill,
    events: {
      rowHeight: (sender, indexPath) => {
        const info = sender.object(indexPath)?.props?.info
        if (!info?.resultId) {
          return info?.rowHeight ?? ROW_HEIGHT
        }

        const text = RESULT_TEXT_CACHE[info.resultId] ?? $(info.resultId)?.text ?? ""
        return measureResultHeight(text)
      }
    }
  }

  if (onReady) {
    page.events.ready = onReady
  }

  return page
}

function createDescLabel(text) {
  return {
    __pageBlock: "section",
    rows: [
      {
        type: "view",
        props: { selectable: false },
        views: [
          {
            type: "label",
            props: {
              text,
              lines: 0,
              font: $font(14),
              textColor: $color("secondaryLabel")
            },
            layout: (make, view) => {
              make.left.right.inset(ROW_INSET)
              make.top.bottom.equalTo(view.super).inset(10)
            }
          }
        ],
        layout: $layout.fill
      }
    ]
  }
}

function rowFromViewDef(viewDef) {
  const isTab = viewDef.type === "tab"

  return {
    type: "view",
    props: {
      selectable: !isTab,
      info: { rowHeight: ROW_HEIGHT }
    },
    views: [
      {
        type: viewDef.type,
        props: viewDef.props,
        events: viewDef.events,
        layout: (make, view) => {
          make.left.right.equalTo(view.super).inset(ROW_INSET)
          if (isTab) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(32)
          } else {
            make.top.bottom.equalTo(view.super)
          }
        }
      }
    ],
    layout: $layout.fill
  }
}

function createCard(views) {
  return {
    __pageBlock: "section",
    rows: views.map(rowFromViewDef)
  }
}

function createField({ id, placeholder, kbType = $kbType.default, defaultValue = "" }) {
  return {
    type: "input",
    props: {
      id,
      placeholder,
      text: defaultValue,
      bgcolor: $color("clear"),
      font: $font(16),
      textColor: $color("primaryText"),
      type: kbType
    }
  }
}

function createTab({ id, items, values, index = 0 }) {
  let tabIndex = 0
  if (values?.length === items.length) {
    const valueIndex = values.indexOf(index)
    tabIndex = valueIndex >= 0 ? valueIndex : 0
  } else {
    tabIndex = index
  }

  return {
    type: "tab",
    props: {
      id,
      items,
      index: tabIndex
    }
  }
}

function createPrimaryButton({ title, bgcolor = "systemBlue", handler }) {
  return {
    __pageBlock: "section",
    rows: [
      {
        type: "view",
        props: {
          selectable: false,
          info: { rowHeight: BUTTON_ROW_HEIGHT }
        },
        views: [
          {
            type: "button",
            props: {
              title,
              font: $font("bold", 17),
              bgcolor: $color(bgcolor),
              titleColor: $color("white"),
              cornerRadius: CARD_RADIUS,
              smoothCorners: true
            },
            layout: (make, view) => {
              make.edges.equalTo(view.super)
            },
            events: {
              tapped: handler
            }
          }
        ],
        layout: $layout.fill
      }
    ]
  }
}

function createResultView(id) {
  return {
    __pageBlock: "section",
    rows: [
      {
        type: "view",
        props: {
          selectable: false,
          info: { resultId: id, rowHeight: ROW_HEIGHT }
        },
        views: [
          {
            type: "label",
            props: {
              id,
              lines: 0,
              text: "",
              font: $font(14),
              textColor: $color("primaryText"),
              align: $align.left
            },
            layout: (make, view) => {
              make.top.left.right.equalTo(view.super).inset(ROW_INSET)
              make.bottom.equalTo(view.super).inset(ROW_INSET).priority(250)
            }
          }
        ],
        layout: $layout.fill
      }
    ]
  }
}

function setResult(id, content) {
  const view = $(id)
  if (!view) {
    return false
  }

  const text = content ?? ""
  RESULT_TEXT_CACHE[id] = text
  view.text = text

  const list = $(LIST_ID)
  if (list) {
    list.reload()
    $delay(0.1, () => {
      list.reload()
    })
  }

  return true
}

function getFieldText(id) {
  return $(id)?.text ?? ""
}

function getTabValue(id, values) {
  const view = $(id)
  if (!view) {
    return values?.[0] ?? 0
  }

  const tabIndex = view.index ?? 0
  if (values?.length) {
    return values[tabIndex] ?? values[0]
  }

  return tabIndex
}

module.exports = {
  MARGIN,
  createPage,
  createDescLabel,
  createCard,
  createField,
  createTab,
  createPrimaryButton,
  createResultView,
  setResult,
  getFieldText,
  getTabValue
}
