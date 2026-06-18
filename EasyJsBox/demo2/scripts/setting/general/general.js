const appearance = require("./appearance")

/**
 * @typedef {import("../../app-main").AppKernel} AppKernel
 * @param {AppKernel} kernel
 */
module.exports = kernel => {
    return {
        items: [appearance]
    }
}
