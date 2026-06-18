const { NavigationView, NavigationBar } = require("../libs/easy-jsbox")

class HomeUI {
    constructor(kernel) {
        this.kernel = kernel
    }

    getPage() {
        const navigationView = new NavigationView()
        const useLargeTitle = this.kernel.setting.get("appearance.largeTitle") !== false

        navigationView.navigationBarTitle($l10n("HOME"))
        if (useLargeTitle) {
            navigationView.navigationBar.setLargeTitleDisplayMode(NavigationBar.LargeTitleDisplayModeAlways)
        }

        navigationView.navigationBarItems.setRightButtons([
            {
                symbol: "plus.circle",
                tapped: animate => {
                    animate.start()
                    $ui.alert({
                        title: $l10n("HOME_PLUS_BUTTON_MESSAGE"),
                        actions: [
                            {
                                title: $l10n("OK"),
                                handler: () => animate.done()
                            },
                            {
                                title: $l10n("CANCEL"),
                                handler: () => animate.cancel()
                            }
                        ]
                    })
                }
            }
        ])

        navigationView.setView({
            type: "markdown",
            props: {
                content: `## ${$l10n("HELLO_WORLD")}\n\n{{APP_NAME}}`
            },
            layout: $layout.fill
        })

        return navigationView.getPage()
    }
}

module.exports = HomeUI
