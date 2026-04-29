# Phase 03 执行任务

## 计划

- [x] 实现 `fetchTopologySnapshot` 并覆盖 HTTP、JSON 和 AbortSignal 测试。
- [x] 实现 `situationStore.ts` 并覆盖成功、失败、选择节点和历史轨迹测试。
- [x] 实现 `useTopologyPolling` 并覆盖立即请求、非重叠轮询、停止清理和页面隐藏暂停。
- [x] 接入 `SituationToolbar` 和 `SituationView` 生命周期。
- [x] 运行 `npm run type-check`、`npm run test:unit -- --run`、`npm run build`。
- [x] 提供是否更新项目文档的选项。

## 复核

- `npm run type-check` 通过。
- `npm run test:unit -- --run` 通过，11 个测试文件、39 个测试用例全部通过。
- `npm run build` 通过。
- `fetchTopologySnapshot` 只返回后端原始响应，归一化仍由 store 负责。
- `useTopologyPolling` 使用请求完成后再 `setTimeout` 下一轮的方式，避免慢请求重叠。
- `SituationView` 已在挂载时启动轮询并把 store 状态传给状态栏。
- 当前默认模式没有可用的 `AskUserQuestion` 工具，因此在最终回复中提供“是否更新项目文档”的明确选项。
