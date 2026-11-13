## ADDED Requirements

### Requirement: FileManager 支持拖入文件夹移动条目

Demo 展示站使用的 FileManager 组件 SHALL 支持将文件或文件夹拖动到目标文件夹条目上抬起鼠标后，把被拖动条目移动到该目标文件夹内。移动 MUST 通过注入的 `fileSystem.promises.rename(oldPath, newPath)` 完成，其中 `newPath` 由 `joinPath(targetFolderPath, sourceName)` 计算得出。FileManager MUST 仅响应 Chameleon `CList.onItemDragInto` 在 `payload.position === 'inside'` 的情况，绝不响应 `'before'` / `'after'` 重排。

#### Scenario: 拖动文件落到目标文件夹后通过 rename 完成移动

- **WHEN** 用户在启用 `draggable` 的 FileManager 中将一个文件条目拖入同级的另一个文件夹条目并抬起鼠标
- **THEN** 系统 MUST 调用一次 `fileSystem.promises.rename(sourcePath, joinPath(targetFolderPath, sourceName))`，移动成功后内部刷新 tick MUST 触发重新 `readdir` 并保持外部 `refreshKey` prop 不被修改

#### Scenario: 拖入非文件夹或自身/子孙/同父目录时优雅 no-op

- **WHEN** 用户拖动条目落到非文件夹目标、自身、自身的子孙目录，或与源同父目录的目标上
- **THEN** 系统 MUST NOT 调用 `fileSystem.promises.rename`，MUST NOT 修改任何条目，并对 `invalid-target` / `self-target` / `descendant-target` 通过 `onMoveError` 报出对应 reason；同父目录情况 MUST 保持完全静默 no-op（不触发 `onMoveError`、不触发 `onMoveSuccess`）

#### Scenario: 移动失败或被取消时报出语义化错误且不修改列表

- **WHEN** `onBeforeMove` 返回 `false`、可选 `exists(targetPath)` 返回 `true`、或 `fileSystem.promises.rename` 抛出错误
- **THEN** 系统 MUST 分别通过 `onMoveError` 报出 `cancelled` / `conflict` / `rename-failed` reason，MUST NOT 触发 `onMoveSuccess`，MUST NOT 乐观修改本地列表，MUST NOT 修改外部 `refreshKey` prop

### Requirement: FileManager displayMode 只支持 list 与 icon

FileManager SHALL 通过 `displayMode` prop 接受展示模式上下文，取值范围 MUST 限定为 `'list' | 'icon'`，并将该值作为 Chameleon `CList` 的 `type` 透传。FileManager MUST NOT 暴露 `'grid'` 选项，MUST NOT 通过 `displayMode` 启用 CList free icon positions 或图标自由布局。

#### Scenario: displayMode 为 list 时 CList 渲染为列表

- **WHEN** 调用方未传 `displayMode` 或传入 `'list'`
- **THEN** 系统 MUST 将 `CList` 渲染为 `type='list'`，并在 FileManager 包裹元素上附加 `system-ui-js__file-manager--list` 修饰类

#### Scenario: displayMode 为 icon 时 CList 渲染为图标

- **WHEN** 调用方传入 `displayMode='icon'`
- **THEN** 系统 MUST 将 `CList` 渲染为 `type='icon'`，并在 FileManager 包裹元素上附加 `system-ui-js__file-manager--icon` 修饰类，MUST NOT 启用 CList 图标自由位置或 `onIconPositionChange`

### Requirement: FileManager sizeRatio 由调用方定义并仅做钳制透传

FileManager SHALL 接受可选 `sizeRatio` prop，将其语义留给调用方解释。组件 MUST 把非有限值视为 `1`，并把有限值钳制到 `[0, 1]` 后通过 `renderItem(displayMode, sizeRatio, entry, position)` 的第二个参数透传给调用方自定义渲染。FileManager MUST NOT 将 `sizeRatio` 映射为 CSS 尺寸、像素、字号或任何视觉属性。

#### Scenario: 越界值被钳制到合法范围

- **WHEN** 调用方传入 `sizeRatio={2}`、`sizeRatio={-1}` 或 `sizeRatio={Number.NaN}`
- **THEN** 系统 MUST 分别以 `1`、`0`、`1` 作为第二个参数调用 `renderItem`，且默认渲染路径 MUST NOT 因 `sizeRatio` 而改变视觉表现

#### Scenario: renderItem 拿到当前模式、钳制后的 sizeRatio、条目信息与位置

- **WHEN** 调用方传入 `renderItem` 与 `displayMode='icon'`、`sizeRatio={0.5}` 渲染包含 3 条目的列表
- **THEN** 系统 MUST 对索引 0/1/2 分别调用一次 `renderItem('icon', 0.5, entryInfo, index)`，其中 `entryInfo` MUST 包含 `name`、`path`、`isDirectory`、可选 `isFile` / `isSymbolicLink` 布尔字段

### Requirement: Demo 导航控件位于 FileManager 之外

Demo 展示站 SHALL 把返回、前进、删除、新建文件夹、上传等导航与文件操作控件放置在 FileManager 组件外层的演示外壳中。FileManager 组件本身 MUST NOT 内置或渲染上述控件，MUST NOT 在 props 上要求调用方提供这些控件的处理函数作为必填项。

#### Scenario: Demo 文件浏览窗口呈现外层导航控件

- **WHEN** 用户在 Demo 中打开文件浏览窗口
- **THEN** 返回 / 前进 / 删除 / 新建文件夹 / 上传等控件 MUST 渲染在 FileManager DOM 子树之外的演示外壳中，FileManager 子树内 MUST NOT 出现这些控件

#### Scenario: 单独渲染 FileManager 不产生导航控件

- **WHEN** 在 Demo 之外仅渲染 `<FileManager />` 组件
- **THEN** 渲染结果 MUST NOT 包含返回 / 前进 / 删除 / 新建文件夹 / 上传等控件 DOM 节点
