const {
  createPage,
  createCard,
  createField,
  createTab,
  createPrimaryButton,
  createResultView,
  getFieldText,
  getTabValue
} = require("../../components/page")
const { formatSmsList } = require("../formatters")
const { createPageContext } = require("./_context")

const SIM_VALUES = [1, 2]
const SMS_TYPE_VALUES = [1, 2]

function buildSmsSendPage(kernel) {
  const { client, resultId, run } = createPageContext(kernel, "smsSendResult")

  return createPage({
    views: [
      createCard([
        createTab({
          id: "simSlot",
          items: ["SIM1", "SIM2"],
          values: SIM_VALUES,
          index: 1
        }),
        createField({
          id: "phoneNumbers",
          placeholder: $l10n("PHONE_NUMBERS_HINT")
        }),
        createField({ id: "msgContent", placeholder: $l10n("MSG_CONTENT") })
      ]),
      createPrimaryButton({
        title: $l10n("SEND"),
        handler: () =>
          run(() =>
            client.sendSms({
              sim_slot: getTabValue("simSlot", SIM_VALUES),
              phone_numbers: getFieldText("phoneNumbers"),
              msg_content: getFieldText("msgContent")
            })
          )
      }),
      createResultView(resultId)
    ]
  })
}

function buildSmsQueryPage(kernel) {
  const { client, resultId, run } = createPageContext(kernel, "smsQueryResult")

  const doQuery = () =>
    run(async () => {
      const data = await client.querySms({
        type: getTabValue("smsType", SMS_TYPE_VALUES),
        page_num: parseInt(getFieldText("pageNum"), 10) || 1,
        page_size: parseInt(getFieldText("pageSize"), 10) || 10,
        keyword: getFieldText("keyword")
      })
      return formatSmsList(data)
    })

  return createPage({
    views: [
      createCard([
        createTab({
          id: "smsType",
          items: [$l10n("SMS_RECEIVED"), $l10n("SMS_SENT")],
          values: SMS_TYPE_VALUES,
          index: 1
        }),
        createField({ id: "keyword", placeholder: $l10n("KEYWORD_OPTIONAL") }),
        createField({
          id: "pageNum",
          placeholder: $l10n("PAGE_NUM"),
          kbType: $kbType.number,
          defaultValue: "1"
        }),
        createField({
          id: "pageSize",
          placeholder: $l10n("PAGE_SIZE"),
          kbType: $kbType.number,
          defaultValue: "10"
        })
      ]),
      createResultView(resultId)
    ],
    navButtons: [
      {
        symbol: "arrow.clockwise",
        handler: doQuery
      }
    ],
    onReady: doQuery
  })
}

module.exports = {
  buildSmsSendPage,
  buildSmsQueryPage
}
