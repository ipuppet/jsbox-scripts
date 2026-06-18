# List

> 标准列表功能采用 **Controller + Data + Views + Delegates** 四层拆分，通过原生 `UITableView` delegate 实现上下文菜单、左右滑动、编辑模式与拖拽排序。

参考实现见 [`demo2/scripts/ui/list/`](../demo2/scripts/ui/list/)。

## 目录组织

为一个列表功能单独建一个目录，不要把所有逻辑写在一个文件里：

```
scripts/ui/<feature>/
├── index.js       # 控制器：组装页面、协调各层、对外暴露 getPage()
├── data.js        # 数据层：读写、增删改、过滤、持久化
├── views.js       # 视图层：列表模板、行数据映射、空状态、编辑工具栏
└── delegates.js   # 交互层：上下文菜单、滑动、编辑模式、拖拽
```

在 `factory.js` 或其他入口中引用：

```js
const ListUI = require("./list")
return new ListUI(kernel).getPage()
```

## 各层职责

### `data.js` — 数据层

只关心**数据本身**，不处理 UI：

- 定义数据模型（建议使用 `uuid` 作为唯一标识，避免排序/删除后索引错位）
- `load()` / `save()` 持久化（通常通过 `kernel.fileStorage`）
- `addItem()`、`update()`、`delete()`、`moveItem()` 等 CRUD
- 可选：`filter()` 供搜索使用

控制器通过继承或组合使用数据层。`demo2` 中 `ListUI extends ListData`。

### `views.js` — 视图层

只关心**列表长什么样**：

- `listId`：列表视图 id（建议用 `$text.uuid` 生成，避免多实例冲突）
- `listTemplate()`：行模板（`type: "list"` 的 `props.template`）
- `lineData(item)`：把模型对象映射为模板所需的数据结构
- `getListView(id, data, events)`：返回列表视图定义
- `getContentHeight(text)`：动态行高计算（配合 delegate 的 `heightForRowAtIndexPath`）
- `getEmptyBackground()`：无数据时的占位视图
- `getListEditModeToolBarView()`：编辑模式底部工具栏

### `delegates.js` — 交互层

通过 `$delegate` 挂载原生 `UITableView` 回调，处理所有手势级交互：

| 能力 | 实现方式 |
|------|----------|
| 长按上下文菜单 | `contextMenuConfigurationForRowAtIndexPath` + `UIMenu` / `UIAction` |
| 左滑 | `leadingSwipeActionsConfigurationForRowAtIndexPath` |
| 右滑 | `trailingSwipeActionsConfigurationForRowAtIndexPath` |
| 点击进入编辑 | `didSelectRowAtIndexPath` |
| 编辑模式多选 | `shouldBeginMultipleSelectionInteractionAtIndexPath` |
| 动态行高 | `heightForRowAtIndexPath` |
| 拖拽排序 | `UITableViewDragDelegate` + `UITableViewDropDelegate` |

菜单项在 `defaultMenuItems` 或 `menu` getter 中以声明式结构定义：

```js
{
    title: $l10n("DELETE"),
    symbol: "trash",
    destructive: true,
    items: [  // 子菜单，用于二次确认
        {
            title: $l10n("CONFIRM"),
            destructive: true,
            handler: (tableView, indexPath) => { /* ... */ }
        }
    ]
}
```

UIKit 菜单构建辅助方法（`createUIMenu`、`createUIAction`、`createUIContextualAction`）放在 `delegates.js` 内即可，与 CAIO 保持一致。

### `index.js` — 控制器

串联各层，是对外唯一入口：

1. 构造函数中初始化 `views`、`delegates`
2. `getPage()` 返回 `NavigationView.getPage()`
3. `listReady()` 在列表 `ready` 事件中调用：先 `setDelegate()`，再 `updateList()`
4. `updateList()` 刷新 `$(listId).data`
5. `getByIndex()` 应基于**当前展示的数据**（含过滤结果）返回条目

## 生命周期

```
getPage()
  └─ NavigationView.setView(getListView())
       └─ events.ready → listReady()
            ├─ setDelegate()          // 挂载 UITableView delegate
            └─ updateList()           // 首次填充 data

用户操作（点击 / 长按 / 滑动 / 拖拽）
  └─ delegates.js 中对应 handler
       └─ data.js 修改数据
            └─ controller.updateList(true)  // 刷新 UI
```

`updateList(reload)` 中建议：

```js
listView.data = this.displayItems.map(item => this.views.lineData(item))
this.updateListBackground()
```

若行高依赖文本内容，在 `reload === true` 时调用 `views.clearTextHeightCache()`。

## 创建新列表的步骤

### 1. 复制目录结构

从 `demo2/scripts/ui/list/` 复制到新目录，例如 `scripts/ui/notes/`。

### 2. 定义数据模型

在 `data.js` 中修改模型字段和持久化路径：

```js
// 示例：备忘录
{ uuid: string, title: string, body: string, updatedAt: number }
```

持久化文件路径建议按功能命名，如 `notes/items.json`。

### 3. 调整行模板

在 `views.js` 的 `listTemplate()` 和 `lineData()` 中匹配你的字段。模板中的 `id` 与 `lineData` 返回对象的 key 一一对应。

### 4. 定制菜单与滑动操作

在 `delegates.js` 中修改 `defaultMenuItems`，以及 `leadingSwipeActionsConfigurationForRowAtIndexPath` / `trailingSwipeActionsConfigurationForRowAtIndexPath`。

不需要的功能可以直接删除对应 delegate 方法及 `delegate()` 中的事件映射。

### 5. 组装页面

在 `index.js` 的 `getPage()` 中配置导航栏按钮、搜索栏等，保持 `getListView()` 的 `ready` 回调指向 `listReady()`。

### 6. 注册到应用入口

在 `factory.js` 中添加页面引用，并在 `strings/` 中补充文案 key。

## 上下文菜单

菜单通过递归结构生成 `UIMenu`：

```
menu
└── items[]
    ├── { inline, items: [...] }     // 同一行并排显示
    └── { title, symbol, handler }   // 单个操作
```

`contextMenuConfigurationForRowAtIndexPath` 在编辑模式下应直接 `return`，避免与多选冲突。

## 左右滑动

- **左滑（leading）**：通常放非破坏性操作，如「复制」
- **右滑（trailing）**：通常放「删除」等破坏性操作

通过 `createUIContextualAction` 创建 `UIContextualAction`，在 handler 完成后调用 `completionHandler(true)`。

## 编辑模式

1. 导航栏提供「编辑」按钮，调用 `delegates.setEditing()`
2. 列表设置 `allowsMultipleSelectionDuringEditing: true`
3. 进入编辑模式时，在窗口底部添加 `getListEditModeToolBarView()` 生成的工具栏
4. 通过 `setEditingCallback` 同步导航栏按钮文案（编辑 ↔ 完成）

批量删除使用 `UIKit.deleteConfirm()` 二次确认。

## 拖拽排序

`setDelegate()` 中同时挂载三个 delegate：

```js
view.$setDelegate(this.delegate())
view.$setDragDelegate(this.dragDelegate())
view.$setDropDelegate(this.dropDelegate())
```

仅在 `session.$localDragSession()` 存在时执行 `reorder()`，即只处理列表内部排序。

若列表处于**搜索/过滤**状态，索引与底层数组不对应，应在 `canHandleDropSession` 中禁用拖放。

## 搜索与过滤

搜索逻辑放在控制器层：

```js
searchBar.controller.setEvent("onChange", text => {
    this.filterKeyword = text ?? ""
    this.delegates.setEditing(false)  // 过滤时退出编辑模式
    this.updateList(true)
})
```

控制器重写 `getByIndex()`，使其从 `displayItems`（过滤后的结果）取值，保证 delegate 中的 `indexPath` 与展示数据一致。

## 简单列表 vs 完整列表

| 场景 | 推荐方案 |
|------|----------|
| 设置子页、少量静态条目 | 声明式 `props.menu` / `props.actions`（见 `file-manager.js`） |
| 主功能列表、需完整手势交互 | 本文档的四层结构 + 原生 delegate |

主功能页面应使用完整方案。设置页等轻量场景可用声明式 API，无需引入 `delegates.js`。

## 本地化

列表相关文案统一放在 `strings/en.strings` 与 `strings/zh-Hans.strings`，通过 `$l10n("KEY")` 引用。常用 key 示例：

```
SHARE / COPY / DELETE / CONFIRM / TAG / EDIT / DONE
SELECT_ALL / DESELECT_ALL / DELETE_CONFIRM_MSG / NONE / COPIED
```

## 检查清单

创建或审查一个列表功能时，确认以下事项：

- [ ] 四层文件职责清晰，控制器中没有大段 UI 模板或 `$delegate` 定义
- [ ] 数据条目使用 `uuid`，删除/更新通过 id 而非索引
- [ ] `listReady()` 中先 `setDelegate()` 再 `updateList()`
- [ ] `getByIndex()` 与当前展示数据（含过滤）一致
- [ ] 过滤激活时已禁用拖拽排序
- [ ] 破坏性操作有确认（菜单子项或 `UIKit.deleteConfirm`）
- [ ] 文案已加入 `strings/` 本地化文件
