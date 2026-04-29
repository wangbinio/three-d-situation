# Phase 02 显示状态与图例显隐联动

## 状态

已完成

## 实现思路

把显示控制状态提升到可被图例、工具栏和 Cesium 场景共同访问的位置。建议在 `situationStore` 中维护 `hiddenNodeTypes`、`showHistories`、`showLinks`，图例负责切换类型，工具栏负责切换全局轨迹和链路显示，场景层根据状态控制 Entity 可见性。

## 需要新增或修改的文件

- `src/stores/situationStore.ts`
- `src/stores/situationStore.spec.ts`
- `src/components/LegendPanel.vue`
- `src/components/LegendPanel.spec.ts`
- `src/components/SituationToolbar.vue`
- `src/components/SituationToolbar.spec.ts`
- `src/components/SituationMap.vue`
- `src/composables/useSituationScene.ts`
- `src/composables/useSituationScene.spec.ts`

## 待办条目

- [ ] 在 store 中新增显示状态：隐藏类型集合、历史航迹显示开关、链路显示开关，两个全局开关默认 `true`。依赖：Phase 01 工具栏结构。
- [ ] 增加 store action：切换类型显隐、设置历史航迹显示、设置链路显示。依赖：显示状态定义。
- [ ] 调整 `LegendPanel` 为单列可点击行，只显示几何图标和节点目标类型名。依赖：store action。
- [ ] 为图例隐藏态增加视觉反馈，例如透明度降低或划线，但仍保留可点击区域。依赖：图例点击完成。
- [ ] 将工具栏复选框与 store 双向事件绑定，保持默认勾选。依赖：store action。
- [ ] 扩展 `useSituationScene` 快照参数，传入显示控制状态。依赖：store 与父组件绑定完成。
- [ ] 节点隐藏规则：节点类型被隐藏时节点 Entity 隐藏。依赖：场景参数扩展。
- [ ] 轨迹隐藏规则：类型隐藏或全局历史航迹关闭时轨迹 Entity 隐藏，但不清空 `histories`。依赖：节点隐藏规则。
- [ ] 链路隐藏规则：全局链路关闭，或任一端点类型被隐藏时链路 Entity 隐藏。依赖：节点类型映射可用。
- [ ] 更新单测覆盖所有显隐组合。依赖：实现完成。

## 验证方式

- `npm run test:unit -- --run src/stores/situationStore.spec.ts src/components/LegendPanel.spec.ts src/components/SituationToolbar.spec.ts src/composables/useSituationScene.spec.ts`
- Playwright 手动点击图例项，确认目标、历史航迹和关联链路同步显隐。

## 疑问或需澄清事项

无。
