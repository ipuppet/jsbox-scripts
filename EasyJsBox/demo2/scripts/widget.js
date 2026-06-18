const { AppKernelBase } = require("./app")

/**
 * @typedef {AppKernel} AppKernel
 */
class AppKernel extends AppKernelBase {
    constructor() {
        super()
        this.setting.setReadonly()
    }

    get logFile() {
        return "widget.log"
    }
}

class Widget {
    static kernel = new AppKernel()

    static widgetInstance(widget, ...data) {
        if ($file.exists(`/scripts/widget/${widget}.js`)) {
            try {
                const { Widget: WidgetClass } = require(`./widget/${widget}.js`)
                this.kernel.logger.info(`Loading widget: ${widget}`)
                return new WidgetClass(...data)
            } catch (error) {
                this.kernel.logger.error(`Error loading widget: ${widget}`)
                this.kernel.logger.error(error)
            }
        } else {
            this.kernel.logger.error(`Widget not found: ${widget}`)
            return false
        }
    }

    static renderError() {
        $widget.setTimeline({
            render: () => ({
                type: "text",
                props: {
                    text: "Invalid argument"
                }
            })
        })
    }

    static renderDefault() {
        const widget = Widget.widgetInstance("Default", Widget.kernel)
        widget.render()
    }

    static render(widgetName = $widget.inputValue ?? "Default") {
        switch (widgetName) {
            case "Default":
                Widget.renderDefault()
                break
            default:
                Widget.renderError()
        }
    }
}

module.exports = {
    Widget,
    run: () => {
        Widget.render()
    }
}
