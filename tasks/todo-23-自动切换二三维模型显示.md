# 自动切换二三维模型显示

## 计划

- [x] 审查当前节点实体的二维 SVG 与三维 GLB 渲染方式，确认最小改动落点。
- [x] 先补失败测试，覆盖远距离只显示二维、近距离只显示三维，以及切换阈值配置解析。
- [x] 实现基于 Cesium 距离显示条件的自动切换，并保持现有节点颜色、选中态和类型过滤逻辑不变。
- [x] 运行相关单测与类型检查，回填评审记录和验证结果。

## 评审记录

- 当前根因是 `createNodeEntityOptions` 同时为每个节点挂载 `billboard` 和 `model`，且二者都 `show: true`，导致远近视角下二维 SVG 与三维 GLB 始终叠加渲染。
- 本次采用 Cesium 原生 `DistanceDisplayCondition` 做硬切换，而不是引入相机监听或 `postRender` 计算。这样改动只落在实体配置层，不增加额外事件订阅，也不会影响 `useSituationScene` 的增量更新逻辑。
- 为避免切换临界点同时显示二维和三维，使用统一阈值加 `1` 米缝隙：`model` 显示区间为 `[0, switchDistance]`，`billboard` 显示区间为 `[switchDistance + 1, +Infinity)`。
- 阈值已配置化到 `src/config/appConfig.ts`，新增环境变量 `VITE_NODE_MODEL_SWITCH_DISTANCE`，默认值为 `3000` 米；后续如果现场觉得切换过早或过晚，只需调环境变量，不需要改代码。
- 同步修正了 `src/composables/cesiumEntityFactory.spec.ts` 中多处历史失真断言，包括旧的 GLB 文件名、旧比例和旧混色参数，确保测试现在反映真实实现。
- 验证通过：`npm run test:unit -- --run src/config/appConfig.spec.ts src/config/nodeTypeStyle.spec.ts src/composables/cesiumEntityFactory.spec.ts src/composables/useSituationScene.spec.ts`。
- 验证通过：`npm run type-check`。
- 验证通过：`npm run build`；仍保留既有大 chunk 警告和 `protobufjs` 的 direct eval 告警，不是本次改动引入。
- 补充验证：尝试执行 `npm run test:e2e -- e2e/situation.spec.ts --project=chromium`，但现有用例在 `getByTestId("situation-page")` 处失败，属于既有页面选择器/用例老化问题，未能为本次距离切换提供浏览器级自动验收。
