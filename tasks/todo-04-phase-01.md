# Phase 01 执行任务

## 计划

- [x] 创建 `SituationView.vue`、`SituationMap.vue`、`LegendPanel.vue`、`SituationToolbar.vue`。
- [x] 配置根路由 `/` 指向态势页面，并简化 `App.vue` 为路由出口。
- [x] 为图例、状态栏和态势页面补充组件测试。
- [x] 更新 App 单测和 e2e 基线断言。
- [x] 运行 `npm run type-check`、`npm run test:unit -- --run`、`npm run build`。
- [x] 提供是否更新项目文档的选项。

## 复核

- `npm run type-check` 通过。
- `npm run test:unit -- --run` 通过，6 个测试文件、13 个测试用例全部通过。
- `npm run build` 通过。
- 额外尝试 `CI=1 npm run test:e2e -- --project=chromium`，因本机缺少 Playwright Chromium 可执行文件失败；已清理生成的 `playwright-report/` 和 `test-results/` 临时目录。
- 当前默认模式没有可用的 `AskUserQuestion` 工具，因此在最终回复中提供“是否更新项目文档”的明确选项。
