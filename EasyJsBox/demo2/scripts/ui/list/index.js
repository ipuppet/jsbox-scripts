const { NavigationView, SearchBar } = require("../../libs/easy-jsbox")
const ListData = require("./data")
const ListViews = require("./views")
const ListDelegates = require("./delegates")

/**
 * @typedef {import("../../app-main").AppKernel} AppKernel
 */

class ListUI extends ListData {
  filterKeyword = ""
  editButtonId = "list-navbtn-edit"

  /**
   * @param {AppKernel} kernel
   */
  constructor(kernel) {
    super(kernel)
    this.views = new ListViews(kernel)
    this.delegates = new ListDelegates(kernel, this, this.views)
  }

  get displayItems() {
    return this.filter(this.filterKeyword)
  }

  getByIndex(index) {
    if (typeof index === "object") {
      index = index.row
    }
    return this.displayItems[index]
  }

  setDelegate() {
    this.delegates.setEditingCallback(status => {
      const editButton = this.navigationView.navigationBarItems
        .getButtons()
        .find(button => button.id === this.editButtonId)
      if (editButton) {
        editButton.setTitle(status ? $l10n("DONE") : $l10n("EDIT"))
      }
    })
    this.delegates.setDelegate()
  }

  listReady() {
    this.setDelegate()
    this.updateList()
  }

  updateList(reload = false) {
    const listView = $(this.views.listId)
    if (!listView) return

    if (reload) {
      this.views.clearTextHeightCache()
    }

    listView.data = this.displayItems.map(item => this.views.lineData(item, this.copied.uuid === item.uuid))
    this.updateListBackground()
  }

  updateListBackground() {
    const view = $(this.views.listId)
    if (!view) return

    if (this.displayItems.length > 0) {
      view.ocValue().$setBackgroundView(undefined)
    } else {
      view.ocValue().$setBackgroundView($ui.create(this.views.getEmptyBackground(false)))
    }
  }

  addItemFromInput() {
    $input.text({
      placeholder: $l10n("LIST_ADD_PLACEHOLDER"),
      handler: text => {
        if ((text ?? "").trim()) {
          this.addItem(text)
          this.updateList(true)
        }
      }
    })
  }

  getListView() {
    return this.views.getListView(this.views.listId, [], {
      ready: () => this.listReady()
    })
  }

  getPage() {
    const searchBar = new SearchBar()
    searchBar.controller.setEvent("onChange", text => {
      this.filterKeyword = text ?? ""
      this.delegates.setEditing(false)
      this.updateList(true)
    })

    const navigationView = new NavigationView()
    this.navigationView = navigationView

    navigationView.navigationBarTitle($l10n("LIST"))
    navigationView.navigationBarItems
      .setTitleView(searchBar)
      .pinTitleView()
      .setRightButtons([
        {
          symbol: "plus.circle",
          tapped: () => this.addItemFromInput()
        }
      ])
      .setLeftButtons([
        {
          id: this.editButtonId,
          title: $l10n("EDIT"),
          tapped: () => this.delegates.setEditing()
        }
      ])

    navigationView.navigationBar.setBackgroundColor($color("primarySurface"))
    navigationView.setView(this.getListView())

    return navigationView.getPage()
  }
}

module.exports = ListUI
