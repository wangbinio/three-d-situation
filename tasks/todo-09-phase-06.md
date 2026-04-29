# Phase 06 节点选择、标牌与拖动交互

## 执行计划

- [x] 新增 `useNodeSelection` 单测，覆盖点击节点、点击非节点、卸载销毁。
- [x] 实现 `useNodeSelection`，通过 Cesium pick 写入选中节点。
- [x] 新增 `NodeInfoCard` 单测，覆盖字段展示、关闭按钮、右键关闭、拖动事件。
- [x] 实现 `NodeInfoCard`，展示状态、位置、IP 并阻止右键菜单。
- [x] 新增 `useScreenOverlay` 单测，覆盖屏幕投影、不可见状态、拖动偏移和连接线。
- [x] 实现 `useScreenOverlay`，在 postRender 同步节点锚点、标牌位置和连接线。
- [x] 新增 `OverlayConnector` 并接入 `SituationMap` 覆盖层。
- [x] 在 `SituationMap` 接入节点选择，在 `useSituationScene` 接入选中高亮。
- [x] 运行类型检查、单测、构建和 Chromium e2e，并清理临时测试产物。

## 评审记录

- 新增 Cesium 左键 pick 选择逻辑，兼容 Entity `properties` 和 `node:` ID 前缀。
- 标牌使用 HTML overlay 渲染，关闭按钮和右键关闭都会调用 `clearSelectedNode`。
- 拖动只修改屏幕偏移，不修改节点经纬高；相机移动后由 `postRender` 重新投影。
- 连接线使用 SVG 覆盖层绘制，颜色来自节点类型样式。
- 选中高亮采用模型 scale 和 minimumPixelSize 放大，不改变类型颜色。
- 验证通过：`npm run type-check`、`npm run test:unit -- --run`、`npm run build`、`CI=1 npm run test:e2e -- --project=chromium`。
