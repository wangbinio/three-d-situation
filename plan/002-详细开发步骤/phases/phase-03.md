# Phase 03 接口服务、轮询与状态管理

## 1. 阶段目标

实现拓扑接口请求、可取消的非重叠轮询、Pinia 业务状态和页面状态派生能力。此阶段将 Phase 02 的纯数据解析接入真实数据流，但仍不负责 Cesium 渲染。

## 2. 实现思路

用 `fetchTopologySnapshot` 封装 HTTP 请求和 JSON 解析，用 `useTopologyPolling` 控制定时刷新并避免请求重叠。Pinia store 负责保存节点、链路、历史轨迹、选中节点、加载状态、错误状态和更新时间。组件通过 getter 使用数组形式数据，避免模板直接遍历响应式 `Map` 带来的可读性问题。

## 3. 需要新增的文件

- `src/services/topologyApi.ts`
- `src/services/topologyApi.spec.ts`
- `src/stores/situationStore.ts`
- `src/stores/situationStore.spec.ts`
- `src/composables/useTopologyPolling.ts`
- `src/composables/useTopologyPolling.spec.ts`

## 4. 需要修改的文件

- `src/components/SituationToolbar.vue`
- `src/views/SituationView.vue`

## 5. 待办条目

| 编号 | 待办 | 简要说明 | 前置依赖 |
| --- | --- | --- | --- |
| 03-01 | 编写接口服务测试 | Mock `fetch`，覆盖 2xx、非 2xx、JSON 解析失败和 AbortSignal。 | Phase 02 |
| 03-02 | 实现 `fetchTopologySnapshot` | 返回原始 `TopologyResponse`，不在服务层做复杂归一化。 | 03-01 |
| 03-03 | 编写 store 测试 | 覆盖加载成功、失败保留旧数据、选择节点、清空选择和历史轨迹更新。 | Phase 02 |
| 03-04 | 实现 `situationStore.ts` | 使用 actions 接收快照并调用归一化函数，维护节点、链路和历史轨迹。 | 03-03 |
| 03-05 | 编写轮询 composable 测试 | 使用 fake timer 覆盖立即请求、完成后再排下一轮、卸载取消请求、页面隐藏暂停。 | 03-02, 03-04 |
| 03-06 | 实现 `useTopologyPolling` | 避免 `setInterval` 固定重叠请求，采用请求完成后 `setTimeout` 下一轮。 | 03-05 |
| 03-07 | 接入状态栏 | `SituationToolbar` 展示 store 中节点数、活跃链路数、更新时间和错误信息。 | 03-04 |
| 03-08 | 接入页面生命周期 | `SituationView` 或上层容器挂载时启动轮询，卸载时停止。 | 03-06 |
| 03-09 | 执行阶段验证 | 运行 `npm run type-check`、`npm run test:unit`、`npm run build`。 | 03-01 至 03-08 |

## 6. 验收标准

- 首次进入页面时立即请求一次拓扑数据。
- 默认每 5 秒刷新一次，且慢请求不会产生重叠请求。
- 请求失败时保留上一轮有效数据并显示错误状态。
- 页面卸载时定时器和请求都被清理。
- 状态栏可以展示节点数、活跃链路数和最近更新时间。

## 7. 风险与注意事项

- 测试 fake timer 与 Promise 微任务容易交错，测试中需要显式等待异步刷新。
- store 内不要保存后端原始响应作为主数据源，应保存归一化后的节点和链路。
