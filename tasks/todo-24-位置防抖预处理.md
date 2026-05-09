# 位置防抖预处理

## 计划

- [x] 审查当前节点位置更新与历史轨迹追加链路，确认最小改动责任层。
- [x] 先补失败测试，覆盖经纬度 `1e-6` 与高度 `0.1` 米阈值下的位置复用和轨迹不追加。
- [x] 在不改动轮询、渲染结构的前提下，实现节点位置防抖预处理。
- [x] 运行相关单测、类型检查和必要构建，回填评审记录。

## 评审记录

- 当前问题根因是 `applyTopologyResponse` 每轮都会直接用最新快照整体覆盖 `nodes.value`，而 `appendHistoryPoint` 只负责“轨迹追加去重”，无法阻止地图上的当前位置抖动。
- 本次采用最小改动方案：经纬度阈值固定为 `1e-6`，高度阈值固定为 `0.1` 米；只要三项差值都在阈值内，就把本轮节点位置视为抖动，直接复用上一轮已接受的位置。
- 责任层收敛在两处：
- `src/stores/situationStore.ts`：先对 `normalizedTopology.nodes` 做位置稳定化，再统一写入 `nodes.value` 和 `histories.value`，保证当前位置和历史航迹使用同一份“已接受位置”。
- `src/domain/topologyHistory.ts`：把轨迹去重阈值同步更新为经纬度 `1e-6`、高度 `0.1` 米，并导出统一的坐标比较函数，避免 store 和 history 维护两套规则。
- 稳定化策略只复用上一轮的 `longitude`、`latitude`、`height`；节点的 `status`、`type`、`raw` 等其他字段仍然保留本轮最新值，因此不会吞掉状态变化。
- 阈值语义采用“在阈值内都算抖动”，也就是 `<= 1e-6` 与 `<= 0.1` 米时复用旧位置，只有超过阈值才更新。
- 验证通过：`npm run test:unit -- --run src/domain/topologyHistory.spec.ts src/stores/situationStore.spec.ts src/domain/topologyParser.spec.ts`。
- 验证通过：`npm run type-check`。
- 验证通过：`npm run build`；仍保留既有大 chunk 警告和 `protobufjs` 的 direct eval 告警，不是本次改动引入。
- 补充说明：当前工作区里 `src/composables/cesiumEntityFactory.ts` 存在一处与本任务无关的既有改动，导致对应单测无法作为本次验收依据，因此本次只采用位置防抖相关测试集做验证。
