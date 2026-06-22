const SmsForwarderClient = require("../../../api/client")
const { runAction } = require("../../components/action")

function createPageContext(kernel, resultId) {
  const client = new SmsForwarderClient(kernel)

  return {
    client,
    resultId,
    run: action =>
      runAction({
        kernel,
        resultId,
        action
      })
  }
}

module.exports = {
  createPageContext
}
