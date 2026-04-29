# Phase 07 集成验收、联调与优化

## 执行计划

- [x] 整理 Phase 00 至 Phase 06 测试覆盖清单。
- [x] 新增 Playwright mock e2e，覆盖拓扑接口拦截、状态栏数据和基础页面可用性。
- [x] 执行全量本地验证：类型检查、单测、构建、e2e。
- [x] 检查真实三维瓦片地址与真实拓扑接口的可达性，并记录外部环境结论。
- [x] 补充部署说明，记录环境变量、代理、Cesium 静态资源和验证命令。
- [x] 补充验收报告，沉淀自动化验证、真实服务联调、性能风险和遗留项。
- [x] 更新阶段索引，把 Phase 07 标记为已完成。

## 评审记录

- 新增 `e2e/situation.spec.ts`，通过 mock 拓扑接口验证首页、图例、状态栏节点数、活跃链路数，以及刷新失败后旧数据保留。
- 新增 `docs/deploy-notes.md`，记录环境变量、Cesium 静态资源、反向代理建议和上线前验证命令。
- 新增 `docs/verification-report.md`，整理 Phase 00 至 Phase 06 自动化覆盖、真实服务探测结果和后续复测项。
- 更新 `README.md`，替换 Vue 模板说明，改为项目运行、配置和验证说明。
- 三维瓦片默认地址探测返回 `HTTP 200`，但响应头未观察到 CORS 允许头。
- 拓扑接口默认地址 5 秒探测超时；已用本地测试拓扑服务 `http://127.0.0.1:8000/topology` 完成联调。
- 测试拓扑服务未开启 CORS，已通过 Vite `/topology` 同源代理完成浏览器联调。
- 验证通过：`npm run type-check`、`npm run test:unit -- --run`、`npm run build`、`CI=1 npm run test:e2e -- --project=chromium`。
