# Phase 05 节点、轨迹与链路渲染

## 1. 阶段目标

基于 Pinia 中的归一化拓扑数据，在 Cesium 场景中增量渲染节点目标、历史轨迹和活跃链路。节点按类型使用不同颜色和形态，轨迹使用同类型颜色，活跃链路使用绿色虚线。

## 2. 实现思路

通过 `useSituationScene` 维护 Cesium Entity 缓存，以节点 ID 和链路 ID 做增量更新，避免每轮轮询全量销毁重建。渲染层只消费 `SituationNode`、`SituationLink` 和历史轨迹，不直接解析后端原始字段。坐标转换在渲染层完成，把经纬高转换为 Cesium `Cartesian3`。

## 3. 需要新增的文件

- `src/composables/useSituationScene.ts`
- `src/composables/useSituationScene.spec.ts`
- `src/composables/cesiumEntityFactory.ts`
- `src/composables/cesiumEntityFactory.spec.ts`
- `src/assets/models/node-icons/.gitkeep`，如 GLB 资产暂未准备则先保留目录。

## 4. 需要修改的文件

- `src/components/SituationMap.vue`
- `src/config/nodeTypeStyle.ts`，如需要补充模型路径和尺寸配置。
- `src/stores/situationStore.ts`，如需要补充渲染层 getter。

## 5. 待办条目

| 编号 | 待办 | 简要说明 | 前置依赖 |
| --- | --- | --- | --- |
| 05-01 | 编写节点 Entity 工厂测试 | Mock Cesium，验证节点模型、颜色、尺寸、业务属性和无效坐标处理。 | Phase 02, Phase 04 |
| 05-02 | 实现节点 Entity 工厂 | 根据节点类型配置创建或更新模型 Entity，保留完整节点信息到 properties。 | 05-01 |
| 05-03 | 编写轨迹 Entity 测试 | 验证轨迹 positions、颜色、show 状态和空轨迹处理。 | 05-02 |
| 05-04 | 实现轨迹 Entity 工厂 | 使用 polyline 渲染历史轨迹，颜色取节点类型颜色。 | 05-03 |
| 05-05 | 编写链路 Entity 测试 | 验证只绘制活跃链路、缺失端点不绘制、使用绿色虚线。 | 05-02 |
| 05-06 | 实现链路 Entity 工厂 | 使用 `PolylineDashMaterialProperty` 创建活跃链路虚线。 | 05-05 |
| 05-07 | 编写增量更新测试 | 验证新增、更新、删除或隐藏节点、轨迹和链路时不全量重建。 | 05-02, 05-04, 05-06 |
| 05-08 | 实现 `useSituationScene` | 维护 `nodeEntities`、`trackEntities`、`linkEntities` 三类缓存，并在更新后 `requestRender()`。 | 05-07 |
| 05-09 | 接入 `SituationMap.vue` | 监听 store 数据变化并调用场景更新。 | 05-08 |
| 05-10 | 执行阶段验证 | 使用 mock 数据验证节点、轨迹和链路渲染；运行类型检查、单测和构建。 | 05-01 至 05-09 |

## 6. 验收标准

- 有效坐标节点能出现在 Cesium 场景中。
- 无效坐标节点默认不创建三维实体，但不会影响其他节点渲染。
- 节点样式来自 `nodeTypeStyle.ts`，不在渲染函数中硬编码类型名称。
- 历史轨迹随轮询数据增长且不超过上限。
- 活跃链路以绿色虚线连接源节点和目标节点。
- 每轮数据更新复用已有 Entity，避免明显闪烁。

## 7. 风险与注意事项

- 如果 GLB 资产未准备，第一版可用 Cesium 内建几何体或占位模型过渡，但配置层要保留最终 GLB 路径。
- 链路端点必须使用归一化节点 ID 查找，不能直接假设链路两端都在当前节点列表中。
