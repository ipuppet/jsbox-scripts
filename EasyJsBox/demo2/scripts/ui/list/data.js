const { Toast } = require("../../libs/easy-jsbox")

const DEFAULT_ITEMS = [
    { uuid: $text.uuid, text: "Hello", tag: "" },
    { uuid: $text.uuid, text: "World", tag: "demo" },
    { uuid: $text.uuid, text: "{{APP_NAME}}", tag: "" }
]

/**
 * @typedef {import("../../app-main").AppKernel} AppKernel
 * @typedef {{ uuid: string, text: string, tag?: string }} ListItem
 */

class ListData {
    itemSize = {}
    copied = {}

    /**
     * @param {AppKernel} kernel
     */
    constructor(kernel) {
        this.kernel = kernel
        this.items = this.load()
    }

    get dataFile() {
        return "list/items.json"
    }

    load() {
        try {
            const data = this.kernel.fileStorage.readAsJSON(this.dataFile)
            if (Array.isArray(data) && data.length > 0) {
                return data
            }
        } catch {}
        return DEFAULT_ITEMS.map(item => ({ ...item, uuid: $text.uuid }))
    }

    save() {
        this.kernel.fileStorage.writeSync(
            this.dataFile,
            $data({ string: JSON.stringify(this.items, null, 2) })
        )
    }

    getByIndex(index) {
        if (typeof index === "object") {
            index = index.row
        }
        return this.items[index]
    }

    getIndexByUUID(uuid) {
        return this.items.findIndex(item => item.uuid === uuid)
    }

    addItem(text, save = true) {
        const item = { uuid: $text.uuid, text: text.trim(), tag: "" }
        if (!item.text) return
        this.items.unshift(item)
        if (save) this.save()
        return item
    }

    update(text, uuid) {
        const index = this.getIndexByUUID(uuid)
        if (index === -1) return
        this.items[index].text = text.trim()
        this.save()
    }

    setTag(uuid, tag) {
        const index = this.getIndexByUUID(uuid)
        if (index === -1) return
        this.items[index].tag = tag
        this.save()
    }

    delete(uuid) {
        const index = this.getIndexByUUID(uuid)
        if (index === -1) return
        this.items.splice(index, 1)
        this.save()
    }

    copy(uuid) {
        const item = this.items.find(entry => entry.uuid === uuid)
        if (!item) return
        $clipboard.setText(item.text)
        Toast.success($l10n("COPIED"))
        this.copied = { uuid }
    }

    moveItem(source, destination) {
        if (source === destination) return
        const item = this.items.splice(source, 1)[0]
        this.items.splice(destination, 0, item)
        this.save()
    }

    filter(keyword = "") {
        const text = keyword.trim().toLowerCase()
        if (!text) return this.items
        return this.items.filter(item => {
            return item.text.toLowerCase().includes(text) || (item.tag ?? "").toLowerCase().includes(text)
        })
    }
}

module.exports = ListData
