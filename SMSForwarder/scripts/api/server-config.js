const SmsForwarderClient = require("./client")

class ServerConfig {
  constructor(kernel) {
    this.kernel = kernel
    this.cache = null
    this.fetchedAt = 0
  }

  clear() {
    this.cache = null
    this.fetchedAt = 0
  }

  async fetch({ force = false, maxAge = 5 * 60 * 1000 } = {}) {
    const expired = !this.fetchedAt || Date.now() - this.fetchedAt > maxAge
    if (!force && this.cache && !expired) {
      return this.cache
    }

    const client = new SmsForwarderClient(this.kernel)
    this.cache = await client.queryConfig()
    this.fetchedAt = Date.now()
    return this.cache
  }

  get snapshot() {
    return this.cache
  }
}

module.exports = ServerConfig
