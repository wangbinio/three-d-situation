# Phase 07 验收报告

## 验收时间

- 日期：2026-04-28
- 项目路径：`/home/sun/projects/web/three-d-situation`

## 自动化覆盖清单

| 范围            | 覆盖文件                                                                                                                      | 验收结论                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 配置解析        | `src/config/appConfig.spec.ts`、`src/config/nodeTypeStyle.spec.ts`                                                            | 覆盖默认值、边界值、节点类型样式兜底。                         |
| 拓扑解析        | `src/domain/topologyParser.spec.ts`、`src/domain/topologyHistory.spec.ts`                                                     | 覆盖根级 `summary`、节点链路归一化、坐标解析、历史轨迹上限。   |
| 接口与轮询      | `src/services/topologyApi.spec.ts`、`src/composables/useTopologyPolling.spec.ts`                                              | 覆盖 HTTP 错误、JSON 错误、非重叠轮询、卸载中止请求。          |
| 状态管理        | `src/stores/situationStore.spec.ts`                                                                                           | 覆盖快照应用、错误保留旧数据、选中节点生命周期、summary 警告。 |
| Cesium 生命周期 | `src/composables/useCesiumViewer.spec.ts`、`src/composables/useTileset.spec.ts`                                               | 通过 mock 覆盖 Viewer 初始化、销毁和瓦片加载失败保护。         |
| 场景渲染        | `src/composables/cesiumEntityFactory.spec.ts`、`src/composables/useSituationScene.spec.ts`                                    | 覆盖节点、轨迹、活跃链路、过期实体清理和选中高亮。             |
| 节点交互        | `src/composables/useNodeSelection.spec.ts`、`src/composables/useScreenOverlay.spec.ts`、`src/components/NodeInfoCard.spec.ts` | 覆盖节点 pick、屏幕投影、拖动偏移、连接线、关闭和右键关闭。    |
| 页面组件        | `src/components/*.spec.ts`、`src/views/SituationView.spec.ts`、`src/__tests__/App.spec.ts`                                    | 覆盖页面骨架、图例、状态栏、地图容器。                         |
| e2e             | `e2e/vue.spec.ts`、`e2e/situation.spec.ts`、`e2e/live-topology*.spec.ts`                                                       | 覆盖根页面、mock 拓扑接口、真实拓扑状态栏数据和失败保留旧数据。 |

## 本地自动化验证

| 命令                                          | 结果 | 说明                                                              |
| --------------------------------------------- | ---- | ----------------------------------------------------------------- |
| `npm run type-check`                          | 通过 | Vue 与 TypeScript 类型检查通过。                                  |
| `npm run test:unit -- --run`                  | 通过 | 19 个测试文件、65 个测试用例通过。                                |
| `npm run build`                               | 通过 | 构建成功；保留 Cesium 大 chunk 和 `protobufjs` direct eval 警告。 |
| `CI=1 npm run test:e2e -- --project=chromium` | 通过 | 启用真实拓扑联调后，4 个 Chromium e2e 用例通过。                  |

## 本地测试拓扑服务联调

| 项目           | 结果                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------- |
| 测试服务地址   | `http://127.0.0.1:8000/topology`                                                             |
| HTTP 探测      | `HTTP 200`，`Content-Type: application/json; charset=utf-8`                                  |
| 响应结构       | `code=0`，`summary` 与 `data` 同层，`data.topo.node/link` 存在                               |
| 初次样本统计   | 节点 29、链路 12、活跃链路 11、无效坐标 0、在线节点 28、离线节点 1                           |
| 复测样本统计   | 节点 31、链路 17、活跃链路 14                                                               |
| 浏览器完整测试 | 通过 `/topology` 同源代理完成，4 个 Chromium e2e 用例通过                                    |
| CORS 结论      | 直接跨端口请求 `http://127.0.0.1:8000/topology` 会触发 `Failed to fetch`；需 CORS 或同源代理 |

## Playwright 视觉验收

| 项目          | 结果                                                                                      |
| ------------- | ----------------------------------------------------------------------------------------- |
| 截图文件      | `tasks/visual-check/strict-full.png`、`tasks/visual-check/strict-map.png`                  |
| 指标文件      | `tasks/visual-check/strict-metrics.json`                                                   |
| 页面状态      | `已更新`，状态栏显示节点 26、活跃链路 7，图例 8 类完整显示                                |
| Canvas        | 存在，渲染尺寸 `1424x960`                                                                 |
| 网络资源      | `/topology` 成功 6 次，`tileset.json` 成功 1 次，`.b3dm` 成功 61 次，无 4xx/5xx            |
| 控制台        | 无 error；仅有 WebGL 性能类 warning                                                       |
| 三维地图      | 已出现，可见倾斜地形影像与中心 3D Tiles 区域                                              |
| 目标          | 已出现，可见多种颜色的圆形目标点                                                          |
| 历史轨迹      | 已出现，可见多色折线轨迹                                                                  |
| 链路信息      | 已出现，可见绿色虚线活跃链路                                                              |

## dev 模式黑屏复测

| 项目     | 结果                                                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------- |
| 复现命令 | `npm run dev -- --host 0.0.0.0`                                                                           |
| 根因     | dev server 未提供 `/cesium/*` 静态资源，部分 Cesium JSON 请求被 Vite fallback 成 `index.html`             |
| 典型错误 | `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`                                                 |
| 修复方式 | 在 `vite.config.ts` 增加 `/cesium/*` dev 中间件，映射到 `node_modules/cesium/Build/Cesium/*` 并补齐 MIME |
| 验证截图 | `tasks/visual-check/dev-fixed-localhost.png`、`tasks/visual-check/dev-fixed-lan-ip.png`                    |
| 复测结论 | dev 模式通过本机地址和局域网地址访问均已能显示三维瓦片、目标、历史轨迹和链路                              |

## 内网离线底图验收

| 项目     | 结果                                                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------- |
| 底图方案 | Cesium 自带 `NaturalEarthII` 离线底图                                                                     |
| 模型方案 | 自部署 3D Tiles，继续由 `VITE_TILESET_URL` 指向 `/3dtiles/tileset.json`                                   |
| 截图文件 | `tasks/visual-check/offline-basemap-preview.png`                                                          |
| 网络检查 | `externalRequests=[]`，未访问 `api.cesium.com`、`dev.virtualearth.net` 或其他公网地址                     |
| 资源统计 | `NaturalEarthII` 本地资源加载 1 次，`.b3dm` 加载 44 个，无 4xx/5xx 和 console error                       |
| 验收结论 | 内网模式下可使用本地离线底图叠加自部署 3D Tiles、目标、轨迹和链路                                         |

本地测试服务验证命令：

```sh
VITE_TOPOLOGY_URL=/topology \
VITE_TOPOLOGY_PROXY_TARGET=http://127.0.0.1:8000 \
npm run build

CI=1 \
LIVE_TOPOLOGY_URL=http://127.0.0.1:8000/topology \
LIVE_TOPOLOGY_DIRECT=1 \
VITE_TOPOLOGY_PROXY_TARGET=http://127.0.0.1:8000 \
npm run test:e2e -- --project=chromium
```

## 真实服务联调探测

| 目标     | 地址                                                        | 结果                                | 结论                                                           |
| -------- | ----------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------- |
| 三维瓦片 | `http://192.168.233.1:8080/3DTILES/tileset.json`            | `HTTP 200`，`Content-Length: 95340` | 服务可达；响应头未观察到 CORS 允许头，浏览器跨域访问仍有风险。 |
| 拓扑接口 | `http://192.168.2.1:8000/api/v1/network/topology/query?...` | 5 秒超时，`curl: (28)`              | 当前本机无法完成真实接口联调；需要后端服务或网络恢复后复测。   |

## 验收结论

- 前端自动化测试、构建链路和 mock 数据验收具备可重复性。
- 本地测试拓扑服务已完成完整浏览器联调，页面能展示真实拓扑数据。
- Playwright 截图已人工复核，三维地图、目标、历史轨迹和链路信息均可见。
- dev 模式黑屏问题已定位为 Cesium 静态资源 fallback，并通过 `/cesium/*` dev 静态资源中间件修复。
- 默认公网影像已替换为 Cesium 自带离线底图，生产预览网络检查未发现外部请求。
- 根级 `summary` 已按与 `code`、`data` 同层处理，不读取 `data.summary`。
- 接口失败路径已验证会保留上一轮有效数据并展示错误状态。
- Cesium 真实瓦片服务在网络层可达，但上线时需要确认 CORS 或同源代理。
- 真实拓扑接口当前不可达，Phase 07 的真实接口联调项被外部环境阻塞，不是已发现的前端代码缺陷。

## 后续复测项

- 拓扑接口恢复后，使用真实响应验证节点数量、链路数量、无效坐标隐藏和轮询稳定性。
- 在真实浏览器中连续运行不少于 30 分钟，观察实体数量、内存曲线、轮询错误和交互延迟。
- 若节点规模扩大到数百级，单独进行性能迭代，避免在验收阶段临时重写渲染架构。

## 003 问题修复最终验收

### 验收时间

- 日期：2026-04-28
- 范围：`plan/003-问题修复/fix-steps.md` 的 Phase 00 至 Phase 05

### 阶段提交

| 阶段 | 提交 | 验收结论 |
| --- | --- | --- |
| Phase 00 | `4a41e62 docs: 完成修复阶段00基线` | 建立绿色基线，忽略 Playwright 临时产物。 |
| Phase 01 | `940ea16 fix: 完成修复阶段01界面基线` | 移除左上标题、手动刷新按钮，新增两个默认勾选复选框，隐藏 Cesium credit。 |
| Phase 02 | `acff977 fix: 完成修复阶段02显隐联动` | 图例、工具栏和 Cesium 场景共用显隐状态。 |
| Phase 03 | `b3a3dfd fix: 完成修复阶段03三维图标` | 新增 GLB 节点模型，节点改用 `Entity.model`，在线/离线通过轮廓颜色表达。 |
| Phase 04 | `8349fd4 fix: 完成修复阶段04轨迹线宽` | 历史航迹和链路线宽均为 `1`，历史点追加支持 `1e-8` 阈值去重。 |
| Phase 05 | 本次提交 | 完整验证报告、截图复核和最终状态同步。 |

### 自动化验证

| 命令 | 结果 | 说明 |
| --- | --- | --- |
| `npm run test:unit -- --run` | 通过 | 19 个测试文件、71 个测试用例通过。 |
| `npm run type-check` | 通过 | Vue 与 TypeScript 类型检查通过。 |
| `npm run build` | 通过 | 构建成功；仍保留 Cesium 大 chunk 和 `protobufjs` direct eval 警告。 |
| `CI=1 npm run test:e2e` | 通过 | 12 个 e2e 中 6 个通过、6 个真实服务用例按环境变量配置跳过。 |

### 视觉复核

| 项目 | 结果 |
| --- | --- |
| 截图文件 | `tasks/visual-check/phase05-situation.png` |
| 指标文件 | `tasks/visual-check/phase05-metrics.json` |
| 标题 | `titleVisible=false`，左上角不再展示“三维态势展示”。 |
| Cesium credit | `cesiumCreditVisible=false`，左下角图标和文字不可见。 |
| 图例 | `legendRows=8`，右上角单列展示 8 类节点类型。 |
| 状态栏 | 一行显示节点、活跃链路、更新时间、接口状态和两个显示复选框。 |
| 三维图标资源 | 捕获到 `diamond.glb`、`hex-prism.glb`、`unknown.glb` 模型请求。 |

### 残余风险

- 本次截图使用 mock 拓扑数据；真实拓扑接口仍需要在网络可达环境下复测。
- 三维瓦片服务在当前截图环境中因 CORS 加载失败，但不影响节点、图例、状态栏和模型资源修复项验证。
- 构建仍有 Cesium 相关大 chunk 警告和 `protobufjs` direct eval 警告，属于既有依赖警告。
