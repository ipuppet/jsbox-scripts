# EasyJsBox

> 一个简单的JSBox应用框架

可以在安装脚本后将其安装为 JSBox 模块，安装为模块后将：

- 可在脚本中直接使用，如 `const { VERSION, Kernel } = require('easy-jsbox')`
- 无法使用“检查更新”功能

[相关文档](./docs/README.md)

## 创建新项目

基于 `demo2` 模板一键生成新项目，并自动替换占位符：

```bash
npm run create -- MyApp
```

指定输出目录与作者信息：

```bash
npm run create -- --name "My App" --output ../MyApp --author ipuppet --github https://github.com/user/repo
```

运行 `npm run create -- --help` 查看全部参数。
