# Phase 04 执行任务

## 计划

- [x] 实现 `useCesiumViewer` 并覆盖 Viewer 初始化、参数和销毁测试。
- [x] 实现 `useTileset` 并覆盖 Tileset 加载、加入 primitives、相机定位和失败状态测试。
- [x] 接入 Cesium widgets 样式、静态资源构建复制和 `SituationMap.vue`。
- [x] 运行 `npm run type-check`、`npm run test:unit -- --run`、`npm run build`。
- [x] 检查 `dist/cesium` 静态资源是否生成。
- [x] 提供是否更新项目文档的选项。

## 复核

- `npm run type-check` 通过。
- `npm run test:unit -- --run` 通过，14 个测试文件、45 个测试用例全部通过。
- `npm run build` 通过。
- `dist/cesium` 已生成，包含 `Assets`、`ThirdParty`、`Widgets`、`Workers` 等目录，大小约 23 MB。
- 构建输出提示 Cesium 相关 bundle 超过 500 kB，并提示 `protobufjs` 内部使用 direct eval；这是依赖构建警告，不阻断本阶段验收。
- 当前默认模式没有可用的 `AskUserQuestion` 工具，因此在最终回复中提供“是否更新项目文档”的明确选项。
