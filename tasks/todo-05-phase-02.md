# Phase 02 执行任务

## 计划

- [x] 定义后端原始响应类型和前端归一化类型。
- [x] 建立拓扑测试 fixture，覆盖有效坐标、无效坐标、活跃链路和根级 summary。
- [x] 编写并实现坐标解析与响应归一化测试。
- [x] 编写并实现历史轨迹纯函数测试。
- [x] 运行 `npm run type-check`、`npm run test:unit -- --run`、`npm run build`。
- [x] 提供是否更新项目文档的选项。

## 复核

- `npm run type-check` 通过。
- `npm run test:unit -- --run` 通过，8 个测试文件、26 个测试用例全部通过。
- `npm run build` 通过。
- `TopologyResponse.summary` 已建模为根级字段，与 `code`、`data` 同层。
- 解析层未引入 Cesium，也未接入网络请求，符合 Phase 02 范围。
- 当前默认模式没有可用的 `AskUserQuestion` 工具，因此在最终回复中提供“是否更新项目文档”的明确选项。
