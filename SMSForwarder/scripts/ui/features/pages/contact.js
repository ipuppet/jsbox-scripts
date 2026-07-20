const {
  createPage,
  createCard,
  createField,
  createPrimaryButton,
  createResultView,
  getFieldText
} = require("../../components/page")
const { formatContactList } = require("../formatters")
const { createPageContext } = require("./_context")

function buildContactQueryPage(kernel) {
  const { client, resultId, run } = createPageContext(kernel, "contactQueryResult")

  const doQuery = () =>
    run(async () => {
      const data = await client.queryContact({
        phone_number: getFieldText("contactPhone"),
        name: getFieldText("contactName")
      })
      return formatContactList(data)
    })

  return createPage({
    views: [
      createCard([
        createField({
          id: "contactPhone",
          placeholder: $l10n("PHONE_NUMBER_OPTIONAL"),
          kbType: $kbType.phone
        }),
        createField({ id: "contactName", placeholder: $l10n("NAME_OPTIONAL") })
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

function buildContactAddPage(kernel) {
  const { client, resultId, run } = createPageContext(kernel, "contactAddResult")

  return createPage({
    views: [
      createCard([
        createField({
          id: "addPhone",
          placeholder: $l10n("PHONE_NUMBERS_HINT"),
          kbType: $kbType.phone
        }),
        createField({ id: "addName", placeholder: $l10n("NAME_OPTIONAL") })
      ]),
      createPrimaryButton({
        title: $l10n("SUBMIT"),
        handler: () =>
          run(() =>
            client.addContact({
              phone_number: getFieldText("addPhone"),
              name: getFieldText("addName")
            })
          )
      }),
      createResultView(resultId)
    ]
  })
}

module.exports = {
  buildContactQueryPage,
  buildContactAddPage
}
