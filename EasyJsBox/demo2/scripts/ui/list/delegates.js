const { UIKit } = require("../../libs/easy-jsbox")

/**
 * @typedef {import("../../app-main").AppKernel} AppKernel
 * @typedef {import("./index").ListUI} ListUI
 * @typedef {import("./views").ListViews} ListViews
 */

class ListDelegates {
  #setEditingCallback

  /**
   * @param {AppKernel} kernel
   * @param {ListUI} data
   * @param {ListViews} views
   */
  constructor(kernel, data, views) {
    this.kernel = kernel
    this.data = data
    this.views = views
  }

  get listSelected() {
    const selected = $(this.views.listId)?.ocValue()?.$indexPathsForSelectedRows()?.jsValue()
    return Array.isArray(selected) ? selected : []
  }

  get defaultMenuItems() {
    return [
      {
        inline: true,
        items: [
          {
            title: $l10n("TAG"),
            symbol: "tag",
            handler: (tableView, indexPath) => {
              const item = this.data.getByIndex(indexPath)
              $input.text({
                placeholder: $l10n("ADD_TAG"),
                text: item.tag ?? "",
                handler: text => {
                  text = (text ?? "").trim()
                  if (text.length > 0) {
                    this.data.setTag(item.uuid, text)
                  } else {
                    this.data.setTag(item.uuid, "")
                  }
                  this.data.updateList(true)
                }
              })
            }
          }
        ]
      },
      {
        inline: true,
        items: [
          {
            title: $l10n("SHARE"),
            symbol: "square.and.arrow.up",
            handler: (tableView, indexPath) => {
              const item = this.data.getByIndex(indexPath)
              $share.sheet(item.text)
            }
          },
          {
            title: $l10n("COPY"),
            symbol: "square.on.square",
            handler: (tableView, indexPath) => {
              this.data.copy(this.data.getByIndex(indexPath).uuid)
            }
          },
          {
            title: $l10n("DELETE"),
            symbol: "trash",
            destructive: true,
            items: [
              {
                title: $l10n("CONFIRM"),
                destructive: true,
                handler: (tableView, indexPath) => {
                  const item = this.data.getByIndex(indexPath)
                  tableView.delete(indexPath)
                  this.data.delete(item.uuid)
                  $delay(0.25, () => tableView.reload())
                }
              }
            ]
          }
        ]
      }
    ]
  }

  get menu() {
    return { items: this.defaultMenuItems }
  }

  setEditingCallback(callback) {
    this.#setEditingCallback = callback
  }

  createUIMenu = ({ title, image, actions, inline = false, destructive = false } = {}) => {
    let options
    if (inline) {
      options = options | (1 << 0)
    }
    if (destructive) {
      options = options | (1 << 1)
    }
    return $objc("UIMenu").$menuWithTitle_image_identifier_options_children(
      title ?? "",
      image,
      null,
      options ?? 0,
      actions
    )
  }

  createUIAction = ({ title, image, handler, destructive = false } = {}) => {
    const action = $objc("UIAction").$actionWithTitle_image_identifier_handler(
      title,
      image,
      null,
      $block("void, UIAction *", () => {
        handler(action)
      })
    )

    if (destructive) {
      action.$setAttributes(1 << 1)
    }

    return action
  }

  createUIContextualAction = ({ title, handler, color, image, destructive = false } = {}) => {
    const action = $objc("UIContextualAction").$contextualActionWithStyle_title_handler(
      destructive ? 1 : 0,
      title,
      $block("void, UIContextualAction *, UIView *, block", async (action, sourceView, completionHandler) => {
        completionHandler = performed => {
          if (performed) {
            $(this.views.listId).ocValue().$setEditing_animated(false, true)
          }
        }
        await handler(action, sourceView, completionHandler)
      })
    )
    if (color) {
      action.$setBackgroundColor(color)
    }
    if (image) {
      action.$setImage(image)
    }

    return action
  }

  updateEditingToolBar() {
    const isEmpty = this.listSelected.length === 0

    const editButton = $(this.views.editingToolBarId + "-select-button")
    const deleteButton = $(this.views.editingToolBarId + "-delete-button")

    editButton.title = isEmpty ? $l10n("SELECT_ALL") : $l10n("DESELECT_ALL")
    deleteButton.hidden = isEmpty
  }

  toggleAllSelected(deselectAll = false, updateEditModeToolBar = true) {
    const length = this.data.displayItems.length
    const tableView = $(this.views.listId).ocValue()
    if (deselectAll || this.listSelected.length !== 0) {
      for (let i = 0; i < length; i++) {
        const indexPath = $indexPath(0, i).ocValue()
        tableView.$deselectRowAtIndexPath_animated(indexPath, false)
      }
    } else {
      for (let i = 0; i < length; i++) {
        const indexPath = $indexPath(0, i).ocValue()
        tableView.$selectRowAtIndexPath_animated_scrollPosition(indexPath, false, 0)
      }
    }

    if (updateEditModeToolBar && tableView.$isEditing()) {
      this.updateEditingToolBar()
    }
  }

  deleteSelected() {
    UIKit.deleteConfirm($l10n("DELETE_CONFIRM_MSG"), () => {
      const selected = this.listSelected.sort((a, b) => a.row - b.row)
      const uuids = selected.map(indexPath => this.data.getByIndex(indexPath).uuid)

      this.setEditing(false)
      uuids.forEach(uuid => this.data.delete(uuid))
      selected.forEach(item => {
        $(this.views.listId).delete(item)
      })
      this.data.updateList(true)
    })
  }

  setEditing(mode) {
    const tableView = $(this.views.listId).ocValue()
    const status = mode !== undefined ? mode : !tableView.$isEditing()

    if (status === tableView.$isEditing()) {
      return
    }

    tableView.$setEditing(status)
    if (typeof this.#setEditingCallback === "function") {
      this.#setEditingCallback(status)
    }

    if (!status) {
      $(this.views.editingToolBarId).remove()
    } else {
      const toolBar = $ui.create(
        this.views.getListEditModeToolBarView({
          selectButtonEvents: { tapped: () => this.toggleAllSelected() },
          deleteButtonEvents: { tapped: () => this.deleteSelected() }
        })
      )
      $ui.window.add(toolBar)
      $(this.views.editingToolBarId).layout((make, view) => {
        make.left.right.bottom.equalTo(view.super)
        make.top.equalTo(view.super.safeAreaBottom).offset(-this.views.editModeToolBarHeight)
      })
    }
  }

  shouldBeginMultipleSelectionInteractionAtIndexPath() {
    this.setEditing(true)
    return true
  }

  didSelectRowAtIndexPath(tableView, indexPath) {
    if (tableView.$isEditing()) {
      this.updateEditingToolBar()
      return
    }
    if (tableView.$hasActiveDrag()) {
      return
    }

    const item = this.data.getByIndex(indexPath.jsValue())
    this.views.edit(item.text, text => {
      tableView.$deselectRowAtIndexPath_animated(indexPath, true)
      if (item.text !== text) {
        this.data.update(text, item.uuid)
        this.data.updateList(true)
      }
    })
  }

  didDeselectRowAtIndexPath(tableView, indexPath) {
    if (tableView.$isEditing()) {
      this.updateEditingToolBar()
    }
  }

  contextMenuConfigurationForRowAtIndexPath(tableView, indexPath, point) {
    if (tableView.$isEditing()) return

    const generateUIMenu = menu => {
      const actions = []
      menu.items.forEach(item => {
        if (item.items) {
          actions.push(generateUIMenu(item))
        } else {
          actions.push(
            this.createUIAction({
              title: item.title,
              image: item.symbol,
              handler: () => {
                item.handler(tableView.jsValue(), indexPath.jsValue())
              },
              destructive: item.destructive
            })
          )
        }
      })

      return this.createUIMenu({
        title: menu.title,
        image: menu.symbol,
        actions,
        inline: menu.inline,
        destructive: menu.destructive
      })
    }

    return $objc("UIContextMenuConfiguration").$configurationWithIdentifier_previewProvider_actionProvider(
      null,
      null,
      $block("UIMenu *, NSArray *", () => generateUIMenu(this.menu))
    )
  }

  leadingSwipeActionsConfigurationForRowAtIndexPath(tableView, indexPath) {
    return $objc("UISwipeActionsConfiguration").$configurationWithActions([
      this.createUIContextualAction({
        title: $l10n("COPY"),
        color: $color("systemLink"),
        handler: async (action, sourceView, completionHandler) => {
          this.data.copy(this.data.getByIndex(indexPath.jsValue()).uuid)
          completionHandler(true)
        }
      })
    ])
  }

  trailingSwipeActionsConfigurationForRowAtIndexPath(tableView, indexPath) {
    tableView = tableView.jsValue()
    indexPath = indexPath.jsValue()

    return $objc("UISwipeActionsConfiguration").$configurationWithActions([
      this.createUIContextualAction({
        destructive: true,
        title: $l10n("DELETE"),
        handler: (action, sourceView, completionHandler) => {
          const item = this.data.getByIndex(indexPath)
          this.data.delete(item.uuid)
          tableView.delete(indexPath)
          $delay(0.25, () => tableView.reload())
          completionHandler(true)
        }
      })
    ])
  }

  heightForRowAtIndexPath(tableView, indexPath) {
    tableView = tableView.jsValue()
    indexPath = indexPath.jsValue()
    const item = this.data.getByIndex(indexPath)
    const tagHeight = (item?.tag ?? "").trim() ? this.views.tagHeight : this.views.verticalMargin
    const itemHeight = this.views.getContentHeight(item?.text ?? "a")
    this.data.itemSize[indexPath.row] = this.views.verticalMargin + itemHeight + tagHeight
    return this.data.itemSize[indexPath.row]
  }

  delegate() {
    return $delegate({
      type: "UITableViewDelegate",
      events: {
        "tableView:shouldBeginMultipleSelectionInteractionAtIndexPath:": () => {
          return this.shouldBeginMultipleSelectionInteractionAtIndexPath()
        },
        "tableView:didBeginMultipleSelectionInteractionAtIndexPath:": () => {
          this.setEditing(true)
        },
        "tableView:didSelectRowAtIndexPath:": (tableView, indexPath) => {
          this.didSelectRowAtIndexPath(tableView, indexPath)
        },
        "tableView:didDeselectRowAtIndexPath:": (tableView, indexPath) => {
          this.didDeselectRowAtIndexPath(tableView, indexPath)
        },
        "tableView:contextMenuConfigurationForRowAtIndexPath:point:": (tableView, indexPath, point) => {
          return this.contextMenuConfigurationForRowAtIndexPath(tableView, indexPath, point)
        },
        "tableView:leadingSwipeActionsConfigurationForRowAtIndexPath:": (tableView, indexPath) => {
          return this.leadingSwipeActionsConfigurationForRowAtIndexPath(tableView, indexPath)
        },
        "tableView:trailingSwipeActionsConfigurationForRowAtIndexPath:": (tableView, indexPath) => {
          return this.trailingSwipeActionsConfigurationForRowAtIndexPath(tableView, indexPath)
        },
        "tableView:heightForRowAtIndexPath:": (tableView, indexPath) => {
          return this.heightForRowAtIndexPath(tableView, indexPath)
        }
      }
    })
  }

  itemsForBeginningDragSession(session, indexPath) {
    const item = this.data.getByIndex(indexPath.jsValue())
    const itemProvider = $objc("NSItemProvider").$alloc().$initWithObject(item.text)
    const dragItem = $objc("UIDragItem").$alloc().$initWithItemProvider(itemProvider)

    const context = session.$localContext()
    if (context) {
      context.$addObject(dragItem)
    } else {
      const mutableArray = NSMutableArray.$new()
      mutableArray.$addObject(dragItem)
      session.$setLocalContext(mutableArray)
    }

    return [dragItem]
  }

  dragDelegate() {
    return $delegate({
      type: "UITableViewDragDelegate",
      events: {
        "tableView:itemsForBeginningDragSession:atIndexPath:": (tableView, session, indexPath) => {
          return this.itemsForBeginningDragSession(session, indexPath)
        }
      }
    })
  }

  reorder(coordinator) {
    const item = coordinator.$items().$firstObject()
    const source = item.$sourceIndexPath().jsValue().row
    const destinationIndexPath = coordinator.$destinationIndexPath()
    const destination = destinationIndexPath.jsValue().row

    this.data.moveItem(source, destination)
    this.data.updateList(true)

    coordinator.$dropItem_toRowAtIndexPath(item.$dragItem(), destinationIndexPath)
  }

  dropDelegate() {
    return $delegate({
      type: "UITableViewDropDelegate",
      events: {
        "tableView:canHandleDropSession:": (tableView, session) => {
          return !tableView.$isEditing() && !this.data.filterKeyword
        },
        "tableView:dropSessionDidUpdate:withDestinationIndexPath:": (tableView, session, destinationIndexPath) => {
          const dropProposal = $objc("UITableViewDropProposal").$alloc()
          if (session.$localDragSession()) {
            dropProposal.$initWithDropOperation_intent(3, 1)
          } else {
            dropProposal.$initWithDropOperation_intent(2, 1)
          }
          return dropProposal
        },
        "tableView:performDropWithCoordinator:": (tableView, coordinator) => {
          if (coordinator.$session().$localDragSession()) {
            this.reorder(coordinator)
          }
        }
      }
    })
  }

  setDelegate() {
    const view = $(this.views.listId).ocValue()
    view.$setDelegate(this.delegate())
    view.$setDragDelegate(this.dragDelegate())
    view.$setDropDelegate(this.dropDelegate())
  }
}

module.exports = ListDelegates
