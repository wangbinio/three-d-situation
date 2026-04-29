# todo-19 手持背负类型实现

## 计划

- [x] 收敛 `006-answer.md` 的确认项，并剔除误写的高度处理规则。
- [x] 生成 `plan/006-新增手持背负类型/006-final.md`。
- [x] 先补测试，覆盖类型 `31`、优先级、图例数量和样式基线。
- [x] 实现手持背负类型识别、样式配置与 SVG 画布统一。
- [x] 同步相关文档到 10 类口径。
- [x] 运行单测、类型检查和构建验证。

## Review

- 已生成 `plan/006-新增手持背负类型/006-final.md`，固化类型 `31`、特殊类型优先级、IP 范围、样式口径和文档同步范围。
- 已在 `src/domain/topologyTypes.ts` 新增手持背负设备类型常量，并在 `src/domain/topologyParser.ts` 中扩展特殊类型判定为“先无人机 `30`，后手持背负设备 `31`”。
- 已在 `src/config/nodeTypeStyle.ts` 新增“手持背负设备”样式项：颜色 `#0e932e`、`shape=人形`、`modelUri=/models/node-icons/cube.glb`，尺寸参数沿用普通设备一档。
- 已将 `public/models/node-icons/svg/手持背负.svg` 统一为与项目现有图标一致的 `40x40` 画布，并保留 `aria-label` / `title` 约定。
- 已修复资源目录中的异常文件名串位问题，恢复 `III类设备.svg` 正常内容，并补回 `设备.svg` 资源文件。
- 已同步 `plan/001-总体设计/001-final.md`、`plan/002-详细开发步骤/phases/phase-00.md`、`plan/002-详细开发步骤/phases/phase-01.md`、`plan/003-问题修复/fix-steps.md`、`plan/003-问题修复/phases/phase-03.md`、`plan/003-问题修复/phases/phase-05.md`、`docs/deploy-notes.md` 到 10 类口径。
- 验证结果：
- `npm run test:unit -- --run src/domain/topologyParser.spec.ts src/config/nodeTypeStyle.spec.ts src/components/LegendPanel.spec.ts` 通过。
- `npm run test:unit -- --run` 通过，`20` 个文件、`79` 个测试全部通过。
- `npm run type-check` 通过。
- `npm run build` 通过；仍有上游 `protobufjs` 的 `eval` 告警和 chunk 体积告警，但不是本次改动引入的失败。
