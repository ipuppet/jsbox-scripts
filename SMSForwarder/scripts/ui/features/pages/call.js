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
const { formatCallList } = require("../formatters")
const { createPageContext } = require("./_context")

const CALL_TYPE_VALUES = [0, 1, 2, 3]

function buildCallQueryPage(kernel) {
  const { client, resultId, run } = createPageContext(kernel, "callQueryResult")

  return createPage({
    views: [
      createCard([
        createTab({
          id: "callType",
          items: [$l10n("ALL"), $l10n("CALL_IN"), $l10n("CALL_OUT"), $l10n("CALL_MISSED")],
          values: CALL_TYPE_VALUES,
          index: 0
        }),
        createField({ id: "phoneNumber", placeholder: $l10n("PHONE_NUMBER_OPTIONAL"), kbType: $kbType.phone }),
        createField({ id: "callPageNum", placeholder: $l10n("PAGE_NUM"), kbType: $kbType.number, defaultValue: "1" }),
        createField({ id: "callPageSize", placeholder: $l10n("PAGE_SIZE"), kbType: $kbType.number, defaultValue: "10" })
      ]),
      createPrimaryButton({
        title: $l10n("QUERY"),
        handler: () =>
          run(async () => {
            const data = await client.queryCall({
              type: getTabValue("callType", CALL_TYPE_VALUES),
              page_num: parseInt(getFieldText("callPageNum"), 10) || 1,
              page_size: parseInt(getFieldText("callPageSize"), 10) || 10,
              phone_number: getFieldText("phoneNumber")
            })
            return formatCallList(data)
          })
      }),
      createResultView(resultId)
    ]
  })
}

module.exports = {
  buildCallQueryPage
}
