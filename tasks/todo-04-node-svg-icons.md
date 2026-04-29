# 目标类型 SVG 图标区分度优化

## 计划

- [x] 将节点类型样式从纯 3D 模型识别扩展为 SVG Billboard 主识别。
- [x] 新增 8 类目标和未知类型的本地 SVG 图标资源。
- [x] 将 Cesium 节点实体从 `model` 改为 `billboard`，继续使用 `VITE_NODE_ICON_SCALE_FACTOR` 控制大小。
- [x] 图例改为展示同一套 SVG 图标，保证地图和图例一致。
- [x] 更新单元测试、资源测试和 E2E 测试。
- [x] 跑完整验证并提交 git commit。

## 结果

- 节点主视觉改为本地 SVG Billboard，避免纯 3D 几何体在远距离、旋转和缩放下难以区分。
- 图例直接展示同一套 SVG 图标，保证图例与地图节点视觉一致。
- 旧 GLB 资源保留为兼容资产，不再作为节点主识别方式。
- 已通过全量单元测试、类型检查、生产构建和 Playwright E2E。
