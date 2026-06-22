const crypto = require("crypto-js")
const { parseConfig } = require("./parsers")

function assignOptional(target, entries) {
  entries.forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      target[key] = value
    }
  })
  return target
}

class SmsForwarderClient {
  constructor(kernel) {
    this.kernel = kernel
  }

  get baseUrl() {
    return (this.kernel.setting.get("server.baseUrl", "") || "").trim().replace(/\/$/, "")
  }

  get secret() {
    return (this.kernel.setting.get("server.secret", "") || "").trim()
  }

  get useSign() {
    return this.kernel.setting.get("server.useSign", false) === true
  }

  ensureBaseUrl() {
    if (!this.baseUrl) {
      throw new Error($l10n("SERVER_URL_REQUIRED"))
    }
  }

  ensureSignConfig() {
    if (this.useSign && !this.secret) {
      throw new Error($l10n("SIGN_SECRET_REQUIRED"))
    }
  }

  generateSign(timestamp) {
    const secret = this.secret
    if (!secret) {
      return ""
    }

    const stringToSign = `${timestamp}\n${secret}`
    const signature = crypto.HmacSHA256(stringToSign, secret).toString(crypto.enc.Base64)

    return encodeURIComponent(signature)
  }

  buildBody(data = {}) {
    const timestamp = Date.now()
    const shouldSign = this.useSign || this.secret.length > 0

    return {
      data,
      timestamp,
      sign: shouldSign ? this.generateSign(timestamp) : ""
    }
  }

  parseResponse(resp) {
    if (resp?.error) {
      throw new Error(resp.error.localizedDescription || $l10n("REQUEST_FAILED"))
    }

    const statusCode = resp?.response?.statusCode ?? 0
    if (statusCode >= 400) {
      const statusText = resp?.response?.localizedDescription || `HTTP ${statusCode}`
      throw new Error(statusText)
    }

    let result = resp?.data
    if (typeof result === "string") {
      if (!result) {
        throw new Error($l10n("REQUEST_FAILED"))
      }
      try {
        result = JSON.parse(result)
      } catch {
        throw new Error(result)
      }
    }

    if (!result || typeof result !== "object") {
      throw new Error($l10n("REQUEST_FAILED"))
    }

    if (result.code !== 200) {
      throw new Error(result.msg || $l10n("REQUEST_FAILED"))
    }

    return result.data
  }

  async request(uri, data = {}) {
    this.ensureBaseUrl()
    this.ensureSignConfig()

    const body = this.buildBody(data)
    const url = `${this.baseUrl}${uri}`

    this.kernel.logger.info(`SmsForwarder request: POST ${url}`)

    const resp = await $http.post({
      url,
      header: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body,
      timeout: 20
    })

    return this.parseResponse(resp)
  }

  queryConfig() {
    return this.request("/config/query", {}).then(parseConfig)
  }

  sendSms({ sim_slot, phone_numbers, msg_content }) {
    return this.request("/sms/send", {
      sim_slot,
      phone_numbers,
      msg_content
    })
  }

  querySms({ type, page_num, page_size, keyword }) {
    return this.request(
      "/sms/query",
      assignOptional(
        {
          type,
          page_num,
          page_size
        },
        [["keyword", keyword]]
      )
    )
  }

  queryCall({ type = 0, page_num, page_size, phone_number }) {
    return this.request(
      "/call/query",
      assignOptional(
        {
          page_num,
          page_size
        },
        [
          ["type", type > 0 ? type : undefined],
          ["phone_number", phone_number]
        ]
      )
    )
  }

  queryContact({ phone_number, name }) {
    return this.request(
      "/contact/query",
      assignOptional({}, [
        ["phone_number", phone_number],
        ["name", name]
      ])
    )
  }

  addContact({ phone_number, name }) {
    return this.request(
      "/contact/add",
      assignOptional(
        {
          phone_number
        },
        [["name", name]]
      )
    )
  }

  queryBattery() {
    return this.request("/battery/query", {})
  }

  sendWol({ mac, ip, port }) {
    const data = { mac }
    if (ip) {
      data.ip = ip
      if (port !== undefined && port !== null && port !== "") {
        data.port = port
      }
    }
    return this.request("/wol/send", data)
  }

  queryLocation() {
    return this.request("/location/query", {})
  }
}

module.exports = SmsForwarderClient
