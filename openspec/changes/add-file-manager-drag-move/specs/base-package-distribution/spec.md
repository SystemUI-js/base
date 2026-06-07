## ADDED Requirements

### Requirement: 公共 barrel 导出 FileManager 拖拽相关类型

`@system-ui-js/base` 的库 barrel `src/lib/index.ts` SHALL 重新导出 FileManager 拖拽特性新增的全部公共类型，使消费者可在不深引内部路径的情况下静态约束 FileManager 的渲染与移动回调。新导出的类型 MUST 至少包含：`FileManagerDisplayMode`、`FileManagerRenderPosition`、`FileManagerEntryInfo`、`FileManagerMoveContext`、`FileManagerMoveError`、`FileManagerMoveErrorReason`。

#### Scenario: 消费者从包入口静态引用 FileManager 拖拽类型

- **WHEN** 消费者从 `@system-ui-js/base` 入口按名引用上述 6 个类型
- **THEN** 类型 MUST 全部可被静态解析，发布产物的类型声明 MUST 通过这 6 个类型的具名导出，且 MUST NOT 要求消费者从内部子路径引用

#### Scenario: FileManagerMoveErrorReason 枚举值锁定语义

- **WHEN** 消费者基于导出的 `FileManagerMoveErrorReason` 做穷尽 switch
- **THEN** 类型 MUST 至少容纳 `'invalid-target'`、`'self-target'`、`'descendant-target'`、`'conflict'`、`'cancelled'`、`'rename-failed'` 六个语义化字面量，MUST NOT 引入 `'grid'`、`'reorder'`、`'multi-select'` 等本次范围外语义

## MODIFIED Requirements

### Requirement: Publishable base package metadata

仓库 SHALL 为 `@system-ui-js/base` 定义可发布的包元数据，包括包名、对外入口映射、类型声明入口与发布文件范围，使消费者能够以标准包方式安装和引用该基础包。该包对外暴露的 `FileSystemLike` 注入契约 MUST 通过 `promises` 暴露必填 `rename(oldPath: string, newPath: string): Promise<void>` 与可选 `exists?(path: string): Promise<boolean>`，作为 FileManager 拖入文件夹移动能力对调用方注入的文件系统的最小契约。

#### Scenario: Inspect package manifest for distribution

- **WHEN** 维护者检查用于发布 `@system-ui-js/base` 的包配置
- **THEN** 配置 MUST 明确声明 `@system-ui-js/base` 的包名、入口导出与类型信息

#### Scenario: 注入的文件系统类型契约包含 rename 与可选 exists

- **WHEN** 消费者实现 `FileSystemLike` 以注入 FileManager
- **THEN** 类型层 MUST 要求实现 `promises.rename(oldPath, newPath): Promise<void>`，MUST 允许实现可选 `promises.exists(path): Promise<boolean>`，MUST 保持现有 `promises.readdir` 契约不变
