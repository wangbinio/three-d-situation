# SVG Billboard 黑屏修复

## 计划

- [x] 复现打开网页黑屏问题并抓取浏览器控制台错误。
- [x] 定位 SVG Billboard 改造后的 Cesium/WebGL 渲染根因。
- [x] 移除强制 WebGL1 配置，让 Cesium 使用兼容 Billboard 的默认 WebGL 路径。
- [x] 增加 E2E 控制台回归断言，防止 shader 编译错误再次漏检。
- [x] 运行完整验证并提交修复。

## 结果

- 根因是 Viewer 强制 `requestWebgl1=true`，SVG Billboard 渲染触发 Cesium 着色器使用 `flat` 关键字，在 WebGL1 下编译失败并导致黑屏。
- 修复方式为取消强制 WebGL1，保留原有 WebGL 上下文性能选项。
- E2E 已新增 WebGL/shader 控制台错误断言。
- 已通过全量单元测试、类型检查、生产构建、生产预览复测和 Playwright E2E。
