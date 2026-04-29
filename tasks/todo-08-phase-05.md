# Phase 05 执行任务

## 计划

- [x] 扩展节点类型样式配置，补充模型尺寸和离地偏移。
- [x] 实现 `cesiumEntityFactory.ts` 并覆盖节点、轨迹、链路 Entity 配置测试。
- [x] 实现 `useSituationScene.ts` 并覆盖增量更新、实体复用和 stale 移除测试。
- [x] 接入 `SituationMap.vue`，监听 store 数据更新 Cesium 场景。
- [x] 添加本地图标资产占位目录。
- [x] 运行 `npm run type-check`、`npm run test:unit -- --run`、`npm run build`、Chromium e2e。
- [x] 提供是否更新项目文档的选项。

## 复核

- `npm run type-check` 通过。
- `npm run test:unit -- --run` 通过，16 个测试文件、52 个测试用例全部通过。
- `npm run build` 通过。
- `CI=1 npm run test:e2e -- --project=chromium` 通过，1 个测试通过。
- 节点、轨迹、链路 Entity 配置均由归一化模型生成，不读取后端原始响应。
- `useSituationScene` 通过三类缓存复用 Entity，并移除 stale 实体，避免每轮全量重建。
- 构建仍有 Cesium 依赖带来的大 chunk 和 `protobufjs` direct eval 警告，沿用 Phase 04 风险记录。
- 当前默认模式没有可用的 `AskUserQuestion` 工具，因此在最终回复中提供“是否更新项目文档”的明确选项。
