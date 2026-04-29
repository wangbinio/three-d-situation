# 图标大小控制与替换说明

## 计划

- [x] 修复 SVG Billboard 使用 SVG intrinsic size 导致图标过大的问题。
- [x] 保留 `VITE_NODE_ICON_SCALE_FACTOR` 作为用户调节地图图标大小的入口。
- [x] 补充用户替换同名 SVG 图标的 README 和部署说明。
- [x] 更新单元测试覆盖固定像素尺寸。
- [x] 运行完整验证并提交。

## 结果

- 地图节点图标改为固定像素尺寸：默认 `24px * VITE_NODE_ICON_SCALE_FACTOR`，当前默认 `2` 时约 48px。
- 选中态只通过 `scale: 1.18` 放大，不再把 SVG intrinsic size 直接作为显示尺寸。
- README 和部署说明已补充同名 SVG 替换方式、文件对应关系和缩放因子说明。
- 已通过全量单元测试、类型检查、生产构建和 Playwright E2E。
