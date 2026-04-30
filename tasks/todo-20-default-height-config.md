# 默认高度配置化

## 计划

- [x] 在配置层新增地面默认高度和无人机默认高度环境变量解析。
- [x] 先补失败测试，覆盖默认值、有效环境变量、非法环境变量回退、解析器参数生效。
- [x] 将拓扑归一化中的硬编码高度改为配置参数，生产路径从 `appConfig` 注入。
- [x] 同步 `.env.example` 和 `.env.production`，确保重新 build 即可生效。
- [x] 运行单元测试、类型检查和生产构建验证。

## 评审记录

- 新增 `VITE_GROUND_DEFAULT_HEIGHT` 和 `VITE_DRONE_DEFAULT_HEIGHT`，默认分别为 `62`、`100`，非法负数或非数字回退默认值。
- `src/stores/situationStore.ts` 将 `appConfig` 中的高度参数传入拓扑归一化，生产环境只需修改 `.env.production` 后重新执行 `npm run build`。
- `README.md`、`docs/deploy-notes.md`、`.env.example`、`.env.production` 已同步新变量。
- 验证通过：先运行目标单测确认失败，再实现后通过 `npm run test:unit -- --run src/config/appConfig.spec.ts src/domain/topologyParser.spec.ts src/stores/situationStore.spec.ts`。
- 验证通过：`npm run test:unit -- --run`，20 个测试文件、79 个用例通过。
- 验证通过：`npm run type-check`。
- 验证通过：`npm run build`；保留既有 Cesium 大 chunk 和 `protobufjs` direct eval 警告。
