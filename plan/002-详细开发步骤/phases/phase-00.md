# Phase 00 基线准备与依赖接入

## 1. 阶段目标

完成 Cesium 接入前的工程基线整理，建立运行时配置入口，并把模板工程的默认断言调整为业务页面可继续演进的测试基线。本阶段不实现真实三维渲染，只确保后续阶段具备稳定依赖、环境变量、测试脚手架和资源路径约定。

## 2. 实现思路

先安装并验证 `cesium` 依赖，再建立配置解析模块，把瓦片地址、拓扑接口地址、轮询周期、历史轨迹点数和无效坐标策略统一收敛到 `appConfig.ts`。同时建立节点类型样式配置，后续页面、图例、Cesium 渲染都从同一配置读取类型名称、颜色、形态和模型路径，避免散落硬编码。

## 3. 需要新增的文件

- `src/config/appConfig.ts`
- `src/config/nodeTypeStyle.ts`
- `src/config/appConfig.spec.ts`
- `src/config/nodeTypeStyle.spec.ts`
- `.env.example`
- `src/types/cesium.d.ts`，仅在 TypeScript 对 `window.CESIUM_BASE_URL` 报错时新增。

## 4. 需要修改的文件

- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `src/main.ts`
- `src/__tests__/App.spec.ts`
- `e2e/vue.spec.ts`

## 5. 待办条目

| 编号 | 待办 | 简要说明 | 前置依赖 |
| --- | --- | --- | --- |
| 00-01 | 安装 Cesium 依赖 | 执行 `npm install cesium`，确保锁文件同步。 | 无 |
| 00-02 | 建立 `.env.example` | 写入 `VITE_TILESET_URL`、`VITE_TOPOLOGY_URL`、`VITE_TOPOLOGY_POLL_INTERVAL_MS`、`VITE_HISTORY_MAX_POINTS`、`VITE_HIDE_INVALID_COORDINATE`。 | 00-01 |
| 00-03 | 实现 `appConfig.ts` | 从 `import.meta.env` 读取配置并做数字、布尔值和默认值归一化。函数声明添加中文注释。 | 00-02 |
| 00-04 | 为配置解析写单测 | 覆盖默认值、非法轮询周期、非法历史点数、布尔值解析。先写失败测试，再实现或调整代码。 | 00-03 |
| 00-05 | 实现 `nodeTypeStyle.ts` | 定义基础 1 到 8 类节点类型，加上无人机 `30` 与手持背负设备 `31` 特殊类型的中文名、形态、颜色、模型路径、图例文本和兜底样式。 | 00-03 |
| 00-06 | 为节点类型样式写单测 | 校验 10 类完整、颜色非空、未知类型走兜底样式。 | 00-05 |
| 00-07 | 预留 Cesium 静态资源路径 | 在启动入口或配置模块中约定 `window.CESIUM_BASE_URL = '/cesium'`，必要时补充类型声明。 | 00-01 |
| 00-08 | 更新模板测试基线 | 将模板中的 `You did it!` 断言替换为后续业务页面稳定可用的占位断言。 | 00-03 |
| 00-09 | 执行阶段验证 | 运行 `npm run type-check`、`npm run test:unit`、`npm run build`。 | 00-01 至 00-08 |

## 6. 验收标准

- `cesium` 出现在 `package.json` 和锁文件中。
- `appConfig.ts` 能稳定输出默认配置和环境变量覆盖配置。
- `nodeTypeStyle.ts` 覆盖 10 种节点类型，并提供未知类型兜底。
- 单测覆盖配置解析和节点类型样式。
- 类型检查、单测和构建通过。

## 7. 风险与注意事项

- Cesium 资源路径若配置错误，构建可能通过但运行时报 Worker 或 Assets 404。Phase 04 需要再次用浏览器验证。
- 不要在本阶段接入真实 Viewer，避免把依赖接入和三维渲染问题混在一起。
