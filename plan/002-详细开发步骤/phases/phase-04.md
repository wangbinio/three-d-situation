# Phase 04 Cesium Viewer 与三维地图加载

## 1. 阶段目标

在页面中初始化 Cesium Viewer，加载配置中的 3D Tiles 瓦片集，并正确处理 Viewer 生命周期、Cesium 静态资源路径、地图加载状态和失败状态。本阶段只负责地图底座，不渲染业务节点。

## 2. 实现思路

通过 `useCesiumViewer` 封装 Viewer 初始化和销毁，通过 `useTileset` 封装 `Cesium3DTileset.fromUrl` 加载逻辑。`SituationMap.vue` 只负责提供 DOM 容器和调用 composable，不直接堆积 Cesium API 细节。测试中 mock Cesium 构造函数和方法，真实 WebGL 行为交给 e2e 或人工联调验证。

## 3. 需要新增的文件

- `src/composables/useCesiumViewer.ts`
- `src/composables/useCesiumViewer.spec.ts`
- `src/composables/useTileset.ts`
- `src/composables/useTileset.spec.ts`
- `src/styles/cesium.css`，仅当需要覆盖 Cesium 默认控件样式时新增。

## 4. 需要修改的文件

- `src/main.ts`
- `src/components/SituationMap.vue`
- `vite.config.ts`，仅当 Cesium 静态资源需要复制或代理时修改。
- `.env.example`

## 5. 待办条目

| 编号 | 待办 | 简要说明 | 前置依赖 |
| --- | --- | --- | --- |
| 04-01 | 编写 Viewer 初始化测试 | Mock `Viewer`，断言初始化参数关闭非必要控件并启用 `requestRenderMode`。 | Phase 00, Phase 01 |
| 04-02 | 实现 `useCesiumViewer` | 在挂载后初始化 Viewer，在卸载时调用 `destroy()`，返回 viewer ref 和错误状态。 | 04-01 |
| 04-03 | 接入 Cesium 样式和 base URL | 导入 `cesium/Build/Cesium/Widgets/widgets.css`，设置 `window.CESIUM_BASE_URL`。 | Phase 00 |
| 04-04 | 编写 Tileset 加载测试 | Mock `Cesium3DTileset.fromUrl`、`scene.primitives.add` 和 `viewer.flyTo`。 | 04-02 |
| 04-05 | 实现 `useTileset` | 根据配置加载瓦片，成功后加入 primitives，失败时返回错误。 | 04-04 |
| 04-06 | 接入 `SituationMap.vue` | 组件挂载时初始化 Viewer 并加载 Tileset，卸载时清理。 | 04-02, 04-05 |
| 04-07 | 验证资源路径 | 本地启动页面，确认 Cesium Worker、Assets、Widgets 没有 404。 | 04-06 |
| 04-08 | 执行阶段验证 | 运行 `npm run type-check`、`npm run test:unit`、`npm run build`，并在浏览器中手动验证地图容器。 | 04-01 至 04-07 |

## 6. 验收标准

- `SituationMap.vue` 能创建 Cesium Viewer。
- Viewer 卸载时能正确销毁，无明显控制台泄漏错误。
- 能按配置加载 `tileset.json` 并飞行到瓦片范围。
- 地图加载失败时页面不崩溃，并能显示错误状态或日志。
- 构建产物中 Cesium 资源路径可访问。

## 7. 风险与注意事项

- Cesium 在 jsdom 中不可完整运行，测试要以 mock 为主。
- 如果直接使用 Cesium ESM 后资源路径不稳定，再评估引入 `vite-plugin-cesium`，不要一开始叠加额外插件复杂度。
