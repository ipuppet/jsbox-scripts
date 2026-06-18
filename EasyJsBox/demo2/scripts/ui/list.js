const { NavigationView, SearchBar } = require("../libs/easy-jsbox")

class ListUI {
    constructor(kernel) {
        this.kernel = kernel
    }

    getPage() {
        const searchBar = new SearchBar()
        searchBar.controller.setEvent("onChange", text => {
            if (text) {
                $ui.toast(text)
            }
        })

        const navigationView = new NavigationView()
        navigationView.navigationBarTitle($l10n("LIST"))
        navigationView.navigationBarItems.setTitleView(searchBar).pinTitleView()
        navigationView.navigationBar.setBackgroundColor($color("primarySurface"))

        navigationView.setView({
            type: "list",
            props: {
                data: ["Hello", "World", "{{APP_NAME}}"]
            },
            layout: $layout.fill
        })

        return navigationView.getPage()
    }
}

module.exports = ListUI
