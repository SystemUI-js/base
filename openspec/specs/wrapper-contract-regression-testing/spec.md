## Purpose

定义包装层公开契约的 Jest 回归测试能力，确保 `@system-ui-js/base` 在依赖升级与 Native 适配过程中持续验证自身转发逻辑，而不是依赖上游实现细节或已删除的 Web Demo。

## Requirements

### Requirement: Wrapper contract regression tests exist

仓库 SHALL 提供围绕包装层公开契约的最小 Jest 回归测试，以验证主题解析、窗口尺寸配置合并、标题 action 传递与 Native-safe action button 样式路径等关键行为。

#### Scenario: Run the wrapper regression suite

- **WHEN** 维护者执行 `yarn test --runInBand`
- **THEN** 系统 MUST 运行包装层回归测试并验证包装器契约行为，而不是依赖已删除的 Web Demo 进行间接验证

### Requirement: Wrapper tests mock chameleon at the module boundary

仓库 SHALL 在包装层测试中通过 `jest.mock('@system-ui-js/chameleon')` 隔离上游组件实现细节，使断言聚焦在本仓库对 props 与主题令牌的转发逻辑上。

#### Scenario: Inspect the wrapper test implementation

- **WHEN** 维护者检查包装层测试文件
- **THEN** 系统 MUST 通过模块级 mock 隔离 `@system-ui-js/chameleon`，而不是对上游渲染细节进行脆弱断言
