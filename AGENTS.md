1. 默认使用 `yarn` 作为仓库唯一的包管理器，用于依赖安装、脚本执行与锁文件维护。
2. 不要使用 `npm install`、`npm ci` 或提交 `package-lock.json`；新增或升级依赖后需同步维护 `yarn.lock`。
