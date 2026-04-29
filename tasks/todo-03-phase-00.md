# Phase 00 执行任务

## 计划

- [x] 安装 `cesium` 并同步 `package-lock.json`。
- [x] 新增 `.env.example`、`appConfig.ts`、`nodeTypeStyle.ts` 和必要类型声明。
- [x] 为配置解析和节点类型样式补充单元测试。
- [x] 在入口预留 Cesium 静态资源路径并更新模板测试基线。
- [x] 运行 `npm run type-check`、`npm run test:unit`、`npm run build`。
- [x] 提供是否更新项目文档的选项。

## 复核

- `npm run type-check` 通过。
- `npm run test:unit -- --run` 通过，3 个测试文件、9 个测试用例全部通过。
- `npm run build` 通过。
- `npm install cesium` 成功，但 npm 输出了现有 Vite/Vue Devtools 相关 peer dependency 警告。
- 本阶段只执行 Phase 00，不初始化 Cesium Viewer，不接入真实三维地图。
- 当前默认模式没有可用的 `AskUserQuestion` 工具，因此在最终回复中提供“是否更新项目文档”的明确选项。
