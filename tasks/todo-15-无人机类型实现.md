# todo-15 无人机类型实现

## 计划

- [x] 阅读 `plan/005-无人机类型/005-final.md` 与当前实现，确认影响面。
- [x] 先补测试，覆盖无人机类型识别、高度归一化、图例数量与样式基线。
- [x] 运行定向单测，确认新增用例先失败。
- [x] 实现归一化阶段无人机识别与高度补偿，扩展样式配置到 9 类。
- [x] 同步 `plan/001-总体设计/001-final.md` 等受影响文档。
- [x] 运行单测、类型检查和构建验证。

## Review

- 已在 `src/domain/topologyParser.ts` 增加无人机 IP 白名单、无人机类型覆盖和默认高度补偿逻辑；规则集中在归一化阶段完成。
- 已在 `src/domain/topologyTypes.ts` 定义无人机类型常量，并在 `src/config/nodeTypeStyle.ts` 新增无人机样式项，图例口径从 8 类扩展为 9 类。
- 已补测试并完成 TDD 闭环：新增用例先失败，随后通过；全量单测最终 `20` 个文件、`77` 个测试全部通过。
- 已同步 `plan/001-总体设计/001-final.md`、`plan/002-详细开发步骤/phases/phase-00.md`、`plan/002-详细开发步骤/phases/phase-01.md`、`plan/003-问题修复/fix-steps.md`、`plan/003-问题修复/phases/phase-03.md`、`plan/003-问题修复/phases/phase-05.md` 的 9 类口径。
- 已补 `public/models/node-icons/svg/无人机.svg` 的 `aria-label`/`title` 元数据，满足现有 SVG 资源断言约定。
- 验证结果：
- `npm run test:unit -- --run` 通过。
- `npm run type-check` 通过。
- `npm run build` 通过；仍存在上游 `protobufjs` 的 `eval` 告警和 Cesium 构建体积告警，但不是本次改动引入的失败。
- `git status` 无法用于本次收尾，仓库当前存在 `.git/objects/... is empty` 与 `fatal: bad object HEAD` 问题，需要单独修复 Git 对象库。
