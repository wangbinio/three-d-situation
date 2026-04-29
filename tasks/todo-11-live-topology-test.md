# 测试后端拓扑服务完整联调

## 执行计划

- [x] 探测 `http://127.0.0.1:8000/topology` 响应状态与 JSON 结构。
- [x] 统计真实节点数、链路数、活跃链路数、无效坐标数。
- [x] 新增显式启用的 live e2e，用真实拓扑响应验证页面状态栏。
- [x] 使用测试拓扑服务执行类型检查、单测、构建和 Chromium e2e。
- [x] 使用 Playwright 重新截图并人工观察三维地图、目标、历史轨迹和链路。
- [x] 复现并修复 dev 模式访问黑屏问题。
- [x] 更新验收报告，记录本地测试后端联调结果。

## 评审记录

- `curl http://127.0.0.1:8000/topology` 返回 `HTTP 200`，响应结构符合 `TopologyResponse`。
- 本次样本统计：`summary.node_count=29`、`summary.link_count=12`、活跃链路 11、无效坐标 0、在线节点 28、离线节点 1。
- 2026-04-28 复测样本：`summary.node_count=31`、`summary.link_count=17`、活跃链路 14。
- 浏览器直接跨端口请求 `http://127.0.0.1:8000/topology` 时出现 `Failed to fetch`，原因是测试后端未返回 CORS 允许头。
- 已新增 Vite `/topology` 同源代理，通过 `VITE_TOPOLOGY_PROXY_TARGET=http://127.0.0.1:8000` 转发到测试后端。
- 使用 `VITE_TOPOLOGY_URL=/topology` 和代理后，浏览器直连 e2e 通过。
- 验证通过：`VITE_TOPOLOGY_URL=/topology VITE_TOPOLOGY_PROXY_TARGET=http://127.0.0.1:8000 npm run type-check`。
- 验证通过：`VITE_TOPOLOGY_URL=/topology VITE_TOPOLOGY_PROXY_TARGET=http://127.0.0.1:8000 npm run test:unit -- --run`，19 个测试文件、65 个用例通过。
- 验证通过：`VITE_TOPOLOGY_URL=/topology VITE_TOPOLOGY_PROXY_TARGET=http://127.0.0.1:8000 npm run build`。
- 验证通过：`CI=1 LIVE_TOPOLOGY_URL=http://127.0.0.1:8000/topology LIVE_TOPOLOGY_DIRECT=1 VITE_TOPOLOGY_PROXY_TARGET=http://127.0.0.1:8000 npm run test:e2e -- --project=chromium`，4 个 Chromium e2e 用例通过。
- Playwright 严格截图输出：`tasks/visual-check/strict-full.png`、`tasks/visual-check/strict-map.png`、`tasks/visual-check/strict-metrics.json`。
- 严格截图指标：页面状态 `已更新`，画布 `1424x960`，`/topology` 成功 6 次，`tileset.json` 成功 1 次，`.b3dm` 成功 61 次，无 4xx/5xx，控制台无 error。
- 人工观察结论：三维地图已出现，目标点已出现，历史轨迹已出现，绿色虚线活跃链路已出现；不是黑屏或加载态卡死。
- dev 黑屏根因：`/cesium/Assets/approximateTerrainHeights.json` 和 `/cesium/Assets/IAU2006_XYS/IAU2006_XYS_18.json` 在 dev server 下被 Vite fallback 成 `index.html`，Network 显示 200 但内容是 HTML，Cesium 解析 JSON 时报 `Unexpected token '<'`。
- 已在 `vite.config.ts` 为 dev server 增加 `/cesium/*` 静态资源中间件，直接从 `node_modules/cesium/Build/Cesium` 返回资源，并为 `.json`、`.wasm`、图片、脚本和样式补齐 MIME。
- dev 修复后验证：`tasks/visual-check/dev-fixed-localhost.png`、`tasks/visual-check/dev-fixed-lan-ip.png` 均可见三维瓦片、目标、历史轨迹和链路；Cesium JSON 资源返回 `application/json`，无 4xx/5xx 和 console error。
