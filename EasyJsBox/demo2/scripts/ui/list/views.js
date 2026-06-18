const { UIKit, ViewController } = require("../../libs/easy-jsbox")

/**
 * @typedef {import("../../app-main").AppKernel} AppKernel
 * @typedef {import("./data").ListItem} ListItem
 */

class ListViews {
    listId = $text.uuid
    editingToolBarId = this.listId + "-edit-mode-tool-bar"

    horizontalMargin = 20
    verticalMargin = 14
    fontSize = 16
    copiedIndicatorSize = 6
    tagHeight = this.verticalMargin + 5
    tagColor = $color("lightGray")
    editModeToolBarHeight = 44

    #textHeightCache = {}

    /**
     * @param {AppKernel} kernel
     */
    constructor(kernel) {
        this.kernel = kernel
        this.viewController = new ViewController()
    }

    getTextHeight(text = "a") {
        return $text.sizeThatFits({
            text,
            font: $font(this.fontSize),
            width: UIKit.windowSize.width - this.horizontalMargin * 2
        }).height
    }

    getContentHeight(text) {
        if (!this.#textHeightCache[text]) {
            const lineHeight = this.getTextHeight("a")
            this.#textHeightCache[text] = Math.min(this.getTextHeight(text), lineHeight * 2)
        }
        return this.#textHeightCache[text]
    }

    clearTextHeightCache() {
        this.#textHeightCache = {}
    }

    edit(text, callback) {
        $input.text({
            text,
            placeholder: $l10n("LIST_EDIT_PLACEHOLDER"),
            handler: value => callback(value ?? "")
        })
    }

    /**
     * @param {ListItem} item
     * @param {boolean} indicator
     */
    lineData(item, indicator = false) {
        return {
            copied: { hidden: !indicator },
            content: { text: item.text },
            tag: {
                hidden: !(item.tag ?? "").trim(),
                text: item.tag ?? "",
                color: this.tagColor
            }
        }
    }

    listTemplate() {
        return {
            props: { bgcolor: $color("clear") },
            views: [
                {
                    type: "view",
                    views: [
                        {
                            type: "view",
                            props: {
                                id: "copied",
                                circular: this.copiedIndicatorSize,
                                hidden: true,
                                bgcolor: $color("green")
                            },
                            layout: (make, view) => {
                                make.centerY.equalTo(view.super)
                                make.size.equalTo(this.copiedIndicatorSize)
                                make.left
                                    .equalTo(view.super)
                                    .inset(this.horizontalMargin / 2 - this.copiedIndicatorSize / 2)
                            }
                        },
                        {
                            type: "label",
                            props: {
                                id: "content",
                                lines: 2,
                                font: $font(this.fontSize)
                            },
                            layout: (make, view) => {
                                make.left.right.equalTo(view.super).inset(this.horizontalMargin)
                                make.top.equalTo(this.verticalMargin)
                            }
                        },
                        {
                            type: "label",
                            props: {
                                id: "tag",
                                lines: 1,
                                color: this.tagColor,
                                autoFontSize: true,
                                align: $align.leading
                            },
                            layout: (make, view) => {
                                make.bottom.equalTo(view.super)
                                make.left.right.equalTo(view.prev)
                                make.height.equalTo(this.tagHeight)
                            }
                        }
                    ],
                    layout: $layout.fill
                }
            ]
        }
    }

    getEmptyBackground(hidden = false) {
        return {
            type: "label",
            props: {
                color: $color("secondaryText"),
                hidden,
                text: $l10n("NONE"),
                align: $align.center
            },
            layout: $layout.fill
        }
    }

    getListEditModeToolBarView({ selectButtonEvents, deleteButtonEvents } = {}) {
        return UIKit.blurBox({ id: this.editingToolBarId }, [
            UIKit.separatorLine(),
            {
                type: "view",
                views: [
                    {
                        type: "button",
                        props: {
                            id: this.editingToolBarId + "-select-button",
                            title: $l10n("SELECT_ALL"),
                            titleColor: $color("tint"),
                            bgcolor: $color("clear")
                        },
                        layout: (make, view) => {
                            make.left.inset(this.horizontalMargin)
                            make.centerY.equalTo(view.super)
                        },
                        events: selectButtonEvents
                    },
                    {
                        type: "button",
                        props: {
                            id: this.editingToolBarId + "-delete-button",
                            symbol: "trash",
                            hidden: true,
                            tintColor: $color("red"),
                            bgcolor: $color("clear")
                        },
                        layout: (make, view) => {
                            make.height.equalTo(view.super)
                            make.width.equalTo(this.horizontalMargin * 2)
                            make.right.inset(this.horizontalMargin / 2)
                            make.centerY.equalTo(view.super)
                        },
                        events: deleteButtonEvents
                    }
                ],
                layout: (make, view) => {
                    make.left.right.top.equalTo(view.super)
                    make.bottom.equalTo(view.super.safeAreaBottom)
                }
            }
        ])
    }

    getListView(id = this.listId, data = [], events) {
        return {
            type: "list",
            props: {
                id,
                associateWithNavigationBar: false,
                bgcolor: $color("clear"),
                separatorInset: $insets(0, this.horizontalMargin, 0, 0),
                data,
                allowsMultipleSelectionDuringEditing: true,
                template: this.listTemplate(),
                backgroundView: $ui.create(this.getEmptyBackground())
            },
            events,
            layout: $layout.fill
        }
    }
}

module.exports = ListViews
