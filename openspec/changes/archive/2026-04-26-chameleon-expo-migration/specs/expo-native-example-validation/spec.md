## ADDED Requirements

### Requirement: Private Expo example consumes the published package surface

仓库 SHALL 提供一个私有的 Expo Managed 示例应用，并让它通过包名 `@system-ui-js/base` 与本地 `file:..` 依赖消费根包导出面，而不是直接深度引用源码目录。

#### Scenario: Install and inspect the Native example app

- **WHEN** 维护者检查或安装 `example/` 应用依赖
- **THEN** 系统 MUST 将 `example/package.json` 标记为 `private: true`，并通过 `@system-ui-js/base: file:..` 消费根包，而不是从 `../src/lib/*` 直接导入源码

### Requirement: Expo example validates iOS and Android packaging

仓库 SHALL 使用私有 Expo 示例应用承担 Native smoke validation，确保根包在 iOS 与 Android 导出路径上都可被消费和打包。

#### Scenario: Export the example for both mobile platforms

- **WHEN** 维护者执行 `yarn --cwd example expo export` 的 iOS 与 Android 导出流程
- **THEN** 系统 MUST 成功生成两个平台的导出结果，并验证根包的发布形态可被 Expo Native 项目消费
