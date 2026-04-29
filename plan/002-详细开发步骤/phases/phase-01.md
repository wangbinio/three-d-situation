# Phase 01 应用骨架与页面布局

## 1. 阶段目标

替换 Vue 模板页面，建立三维态势展示的页面骨架、路由入口、基础覆盖层、图例面板和状态栏。此阶段以静态布局和可测试 UI 为主，不依赖真实接口和真实 Cesium Viewer。

## 2. 实现思路

先将根路由指向 `SituationView.vue`，由视图组件承载地图容器和覆盖层。`SituationMap.vue` 先提供 Cesium 容器占位，后续 Phase 04 再初始化 Viewer。`LegendPanel.vue` 读取 `nodeTypeStyle.ts` 渲染图例，`SituationToolbar.vue` 显示静态或 mock 状态。这样 UI 骨架可以在不加载 WebGL 的情况下先完成组件测试和 e2e 基线。

## 3. 需要新增的文件

- `src/views/SituationView.vue`
- `src/components/SituationMap.vue`
- `src/components/LegendPanel.vue`
- `src/components/SituationToolbar.vue`
- `src/components/LegendPanel.spec.ts`
- `src/components/SituationToolbar.spec.ts`
- `src/views/SituationView.spec.ts`

## 4. 需要修改的文件

- `src/App.vue`
- `src/router/index.ts`
- `src/__tests__/App.spec.ts`
- `e2e/vue.spec.ts`

## 5. 待办条目

| 编号 | 待办 | 简要说明 | 前置依赖 |
| --- | --- | --- | --- |
| 01-01 | 创建 `SituationView.vue` | 建立全屏页面结构，包含地图容器层和 UI 覆盖层。 | Phase 00 |
| 01-02 | 创建 `SituationMap.vue` | 提供 `ref` 容器和基础样式，暂不初始化 Cesium。 | 01-01 |
| 01-03 | 创建 `LegendPanel.vue` | 从节点类型配置渲染 9 项图例，包含颜色、形态名和类型名。 | Phase 00 |
| 01-04 | 创建 `SituationToolbar.vue` | 展示节点数量、链路数量、更新时间、接口状态和手动刷新按钮占位。 | 01-01 |
| 01-05 | 配置根路由 | 根路径 `/` 指向 `SituationView.vue`。 | 01-01 |
| 01-06 | 简化 `App.vue` | 改为 `<RouterView />` 或直接承载根页面，保持路由方案一致。 | 01-05 |
| 01-07 | 编写组件测试 | 覆盖图例数量、状态栏文本、根页面包含地图容器。 | 01-03, 01-04, 01-06 |
| 01-08 | 更新 e2e 测试 | 断言首页出现态势展示容器、图例和状态栏，不再断言模板文本。 | 01-07 |
| 01-09 | 执行阶段验证 | 运行 `npm run type-check`、`npm run test:unit`、`npm run build`，必要时运行 `npm run test:e2e`。 | 01-01 至 01-08 |

## 6. 验收标准

- 访问根路径显示态势展示页面骨架。
- 页面右上角展示 10 类节点图例。
- 页面包含状态栏和地图容器占位。
- 单测和 e2e 不再依赖 Vue 模板默认文案。
- 类型检查、单测和构建通过。

## 7. 风险与注意事项

- 页面样式需要保证 Cesium 容器未来能铺满视口，避免 Phase 04 初始化 Viewer 后高度为 0。
- 组件不要直接读取接口或 Cesium API，避免静态布局阶段引入外部不稳定因素。
