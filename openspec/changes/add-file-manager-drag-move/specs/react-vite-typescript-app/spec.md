## ADDED Requirements

### Requirement: Demo 文件浏览窗口 opt-in 拖拽并接入移动错误通知

Demo React + Vite + TypeScript 应用 SHALL 在文件浏览窗口中通过显式 `draggable={true}` 启用 FileManager 拖入文件夹移动能力，并把 FileManager 暴露的 `onMoveError` 接入 Demo 自身的通知 / 提示层，使非法或失败的拖拽对用户可感知。Demo 应用 MUST NOT 把返回 / 前进 / 删除 / 新建文件夹 / 上传等导航控件迁移到 FileManager 组件内部，这些控件 MUST 保持在 FileManager 外层的演示外壳中。

#### Scenario: 文件浏览窗口启用拖拽且失败通过通知层呈现

- **WHEN** 用户在 Demo 文件浏览窗口中触发一次会通过 `onMoveError` 报出 `conflict` / `rename-failed` / `cancelled` 的拖拽
- **THEN** Demo 通知 / 提示层 MUST 接收到该次错误事件并对用户呈现可感知的反馈，FileManager 内部 MUST NOT 弹出独立的错误 UI

#### Scenario: 外层导航控件位置在启用拖拽前后保持不变

- **WHEN** Demo 文件浏览窗口在启用 `draggable={true}` 前后两种状态下渲染
- **THEN** 返回 / 前进 / 删除 / 新建文件夹 / 上传等控件 MUST 始终渲染在 FileManager DOM 子树之外的演示外壳中，MUST NOT 因启用拖拽而被搬入 FileManager 子树
