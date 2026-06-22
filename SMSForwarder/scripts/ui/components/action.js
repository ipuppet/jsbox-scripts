const { setResult } = require("./page")
const { formatActionResult } = require("../features/formatters")

async function runAction({ kernel, resultId, action }) {
  setResult(resultId, $l10n("LOADING"))

  try {
    const data = await action()
    const text = formatActionResult(data)
    if (!setResult(resultId, text)) {
      $ui.toast(text.slice(0, 200))
    }
  } catch (error) {
    kernel?.logger?.error(error)
    const message = error?.message || String(error)
    if (!setResult(resultId, `${$l10n("ERROR")}: ${message}`)) {
      $ui.toast(message)
    }
  }
}

module.exports = {
  runAction
}
