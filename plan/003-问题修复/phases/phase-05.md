# Phase 05 完整验证与交付复核

## 状态

已完成

## 实现思路

完成所有实现后执行完整质量门禁，重点覆盖单元测试、类型检查、构建、Playwright 页面验证和视觉截图。由于本次修复包含三维模型、Cesium credit、图例交互和折线显示，最终验收不能只依赖 DOM 断言，必须保留截图并人工检查画面。

## 需要新增或修改的文件

- `docs/verification-report.md`
- `tasks/todo-03-fix-plan-discussion.md`
- 可能修改：`e2e/situation.spec.ts`
- 可能新增：Playwright 截图输出文件或报告附件

## 待办条目

- [ ] 运行完整单元测试。依赖：Phase 04 完成。
- [ ] 运行 TypeScript 类型检查。依赖：单元测试通过。
- [ ] 运行生产构建。依赖：类型检查通过。
- [ ] 运行 Playwright e2e，覆盖页面加载、图例可见、状态栏可见。依赖：构建或 dev server 可用。
- [ ] 使用 Playwright 截图确认：无左上标题、无 Cesium credit、9 类图标语义正确、底栏一行、图例单列。依赖：e2e 页面可加载。
- [ ] 手动点击图例每类行，确认目标、历史航迹和关联链路同步显隐。依赖：截图环境可用。
- [ ] 切换两个复选框，确认只影响显示，不清空历史数据。依赖：图例交互验证完成。
- [ ] 更新 `docs/verification-report.md`，记录命令、结果、截图路径和残余风险。依赖：全部验证完成。
- [ ] 更新任务文档 Review 区域，说明最终实现和验证结果。依赖：验证报告完成。

## 验证命令

- `npm run test:unit -- --run`
- `npm run type-check`
- `npm run build`
- `npm run test:e2e`

## 疑问或需澄清事项

无。
