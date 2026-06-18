const { AppKernelBase } = require("./app")

/**
 * @typedef {AppKernel} AppKernel
 */
class AppKernel extends AppKernelBase {
    constructor() {
        super()
        this.setting.setReadonly()
    }

    addOpenInJsboxButton() {
        this.useJsboxNav()
        this.setNavButtons([
            {
                image: $image("assets/icon.png"),
                handler: () => this.openInJsbox()
            }
        ])
    }
}

class AppUI {
    static kernel = new AppKernel()

    static renderLiteUI() {
        this.kernel.addOpenInJsboxButton()
        this.kernel.UIRender({
            type: "label",
            props: {
                text: $l10n("LITE_ENV_MESSAGE"),
                align: $align.center,
                lines: 0
            },
            layout: $layout.fill
        })
    }

    static renderSiriUI() {
        $ui.render({
            views: [
                {
                    type: "label",
                    props: {
                        id: "shortcuts-root-label",
                        lines: 0,
                        text: "{{APP_NAME}}"
                    },
                    layout: $layout.center
                }
            ]
        })
        $intents.finish("{{APP_NAME}}")
    }
}

module.exports = {
    run: () => {
        if ($app.env === $env.siri) {
            AppUI.renderSiriUI()
        } else {
            AppUI.renderLiteUI()
        }
    }
}
