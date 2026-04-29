# Phase 01 静态 UI 与 Cesium Credit 修复

## 状态

已完成

## 实现思路

先处理不依赖复杂数据流的界面问题：移除左上角标题块，重构底部状态栏为一行信息和两个复选框，隐藏 Cesium 左下角 credit。该阶段不实现图例筛选，也不切换三维图标，降低改动耦合。

## 需要新增或修改的文件

- `src/views/SituationView.vue`
- `src/views/SituationView.spec.ts`
- `src/components/SituationToolbar.vue`
- `src/components/SituationToolbar.spec.ts`
- `src/composables/useCesiumViewer.ts`
- `src/composables/useCesiumViewer.spec.ts`
- 可能修改：`src/components/SituationMap.vue`

## 待办条目

- [ ] 删除 `SituationView` 中左上角标题块和相关样式。依赖：Phase 00 标题测试。
- [ ] 移除 `SituationToolbar` 的 `refresh` 事件、按钮和父组件绑定。依赖：Phase 00 工具栏测试。
- [ ] 增加 `showHistories` 和 `showLinks` 两个受控复选框，默认由父层传入 `true`。依赖：移除刷新按钮。
- [ ] 调整底栏布局为单行展示；小屏幕可横向滚动或紧凑换行，但桌面视口必须一行。依赖：复选框结构完成。
- [ ] 隐藏 Cesium credit，可优先通过独立 `creditContainer` 或 scoped/global CSS 处理。依赖：Viewer 初始化逻辑确认。
- [ ] 更新对应单元测试，删除旧的手动刷新断言。依赖：功能实现完成。
- [ ] 运行相关单测，确认 Phase 01 范围通过。依赖：测试更新完成。

## 验证方式

- `npm run test:unit -- --run src/views/SituationView.spec.ts src/components/SituationToolbar.spec.ts src/composables/useCesiumViewer.spec.ts`
- 手动或 Playwright 检查页面无标题块、无手动刷新按钮、无 Cesium 左下角图标文字。

## 疑问或需澄清事项

无。
