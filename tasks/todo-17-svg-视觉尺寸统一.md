# todo-17 SVG 视觉尺寸统一

## 计划

- [x] 检查 `设备.svg`、`无人机.svg` 的 `viewBox`、留白和当前引用关系。
- [x] 将两张下载 SVG 收敛为与现有图标一致的 `40x40` 画布和主体占比。
- [x] 运行相关资源测试，确认不会破坏现有图标加载约定。

## Review

- 原因已确认：下载 SVG 使用大画布坐标系和不同留白习惯，虽然界面外框像素固定，但图形主体在外框里的占比偏小，所以视觉上显得更小。
- 已将 `设备.svg` 和 `无人机.svg` 重绘为与项目现有资源一致的 `40x40` 画布、较高主体占比和更接近的线宽风格。
- `设备.svg` 当前仍未被 `nodeTypeStyle.ts` 引用；`无人机.svg` 已被无人机类型映射使用。
- 验证结果：`npm run test:unit -- --run src/__tests__/nodeIconAssets.spec.ts src/components/LegendPanel.spec.ts` 通过。
