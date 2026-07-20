const {
  createPage,
  createCard,
  createField,
  createPrimaryButton,
  createResultView,
  getFieldText
} = require("../../components/page")
const { formatBattery, formatLocation } = require("../formatters")
const { createPageContext } = require("./_context")

function buildBatteryPage(kernel) {
  const { client, resultId, run } = createPageContext(kernel, "batteryResult")

  return createPage({
    views: [
      createPrimaryButton({
        title: $l10n("QUERY"),
        handler: () => run(async () => formatBattery(await client.queryBattery()))
      }),
      createResultView(resultId)
    ]
  })
}

function buildWolPage(kernel) {
  const { client, resultId, run } = createPageContext(kernel, "wolResult")

  return createPage({
    views: [
      createCard([
        createField({ id: "mac", placeholder: $l10n("MAC_ADDRESS") }),
        createField({ id: "ip", placeholder: $l10n("IP_OPTIONAL") }),
        createField({
          id: "port",
          placeholder: $l10n("PORT_OPTIONAL"),
          kbType: $kbType.number
        })
      ]),
      createPrimaryButton({
        title: $l10n("SEND"),
        bgcolor: "systemRed",
        handler: () =>
          run(() => {
            const mac = getFieldText("mac")
            const ip = getFieldText("ip")
            const portText = getFieldText("port")
            const payload = { mac }
            if (ip) {
              payload.ip = ip
              if (portText) {
                payload.port = parseInt(portText, 10)
              }
            }
            return client.sendWol(payload)
          })
      }),
      createResultView(resultId)
    ]
  })
}

function buildLocationPage(kernel) {
  const { client, resultId, run } = createPageContext(kernel, "locationResult")

  return createPage({
    views: [
      createPrimaryButton({
        title: $l10n("QUERY"),
        handler: () => run(async () => formatLocation(await client.queryLocation()))
      }),
      createResultView(resultId)
    ]
  })
}

module.exports = {
  buildBatteryPage,
  buildWolPage,
  buildLocationPage
}
