# Phase 00 测试与基线约束

## 状态

已完成

## 实现思路

先确认当前测试基线，并建立后续阶段的测试调整策略。由于执行要求变更为“每个阶段完整测试通过后提交”，本阶段不保留失败测试状态；后续阶段会在对应功能实现时同步调整测试，保证每个提交点都是绿色状态。

## 需要新增或修改的文件

- `src/views/SituationView.spec.ts`
- `src/components/SituationToolbar.spec.ts`
- `src/components/LegendPanel.spec.ts`
- `src/composables/cesiumEntityFactory.spec.ts`
- `src/composables/useSituationScene.spec.ts`
- `src/domain/topologyHistory.spec.ts`
- `src/composables/useCesiumViewer.spec.ts`
- `e2e/situation.spec.ts`

## 待办条目

- [ ] 调整标题相关测试：断言页面不再包含左上角标题块。依赖：无。
- [ ] 调整工具栏测试：断言无手动刷新按钮，存在两个默认勾选复选框，并保持一行布局语义。依赖：无。
- [ ] 补充图例交互测试：点击图例项后触发对应类型显隐事件或状态变化。依赖：无。
- [ ] 补充场景显隐测试：类型隐藏时节点、轨迹、关联链路都隐藏；全局历史航迹和链路开关只影响显示。依赖：图例交互测试设计。
- [ ] 调整节点实体测试：断言节点使用 `model`，颜色来自类型配置，外圈在线白色、离线黑色。依赖：无。
- [ ] 调整线宽测试：断言历史航迹和链路线宽均为 `1`。依赖：无。
- [ ] 补充轨迹阈值测试：经纬高变化均小于 `1e-8` 时跳过，任一维度达到或超过阈值时追加。依赖：无。
- [ ] 补充 Cesium credit 测试：断言初始化配置或挂载结构能隐藏 credit。依赖：无。
- [ ] 运行 `npm run test:unit -- --run`，确认相关测试在旧实现上失败。依赖：以上测试调整完成。

## 验证方式

- `npm run test:unit -- --run`
- 必要时运行单文件 Vitest，确认失败原因对应新需求而不是测试写错。

## 疑问或需澄清事项

无。
