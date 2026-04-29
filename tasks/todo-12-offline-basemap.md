# Cesium 离线底图接入

## 执行计划

- [x] 将 Cesium Viewer 默认公网影像替换为自带 `NaturalEarthII` 离线底图。
- [x] 保留 `VITE_TILESET_URL` 自部署 3D Tiles 模型加载方式。
- [x] 更新单测，验证 Viewer 使用离线底图 provider。
- [x] 更新部署说明，明确内网部署不依赖默认 Bing/Cesium ion 影像。
- [x] 运行类型检查、单测、构建和 Playwright 截图验证。

## 评审记录

- Viewer 初始化时通过 `ImageryLayer.fromProviderAsync(TileMapServiceImageryProvider.fromUrl(buildModuleUrl("Assets/Textures/NaturalEarthII")))` 创建离线底图。
- 离线底图创建延迟到 `initializeViewer()` 中执行，避免模块加载早于 `window.CESIUM_BASE_URL = "/cesium"` 导致资源路径不稳定。
- 3D Tiles 加载仍由 `useTileset` 使用 `VITE_TILESET_URL` 控制，未写死模型服务地址。
- 验证通过：`npm run type-check`。
- 验证通过：`npm run test:unit -- --run`，19 个测试文件、65 个用例通过。
- 验证通过：`npm run build`，仅保留 Cesium 大包和 `protobufjs` direct eval 既有警告。
- 验证通过：`CI=1 LIVE_TOPOLOGY_URL=http://127.0.0.1:8000/topology LIVE_TOPOLOGY_DIRECT=1 ... npm run test:e2e -- --project=chromium`，4 个 Chromium e2e 用例通过。
- Playwright 生产预览截图：`tasks/visual-check/offline-basemap-preview.png`。
- Playwright 网络检查：`externalRequests=[]`，未访问 `api.cesium.com`、`dev.virtualearth.net` 或其他公网地址；`NaturalEarthII` 本地资源加载 1 次，`.b3dm` 加载 44 个，无 4xx/5xx 和 console error。
