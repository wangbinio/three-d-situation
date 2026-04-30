# 三维态势展示

基于 Vue 3、Vite、TypeScript、Pinia 和 CesiumJS 的三维态势展示应用。应用使用 Cesium 自带离线底图，加载自部署三维瓦片模型，周期性轮询拓扑接口，展示网络节点、历史轨迹、活跃链路、图例、状态栏和节点信息标牌。

## 环境要求

- Node.js `^20.19.0 || >=22.12.0`
- npm
- Playwright Chromium，用于 e2e 验证

## 项目配置

| 变量                             | 说明                                        |
| -------------------------------- | ------------------------------------------- |
| `VITE_TILESET_URL`               | 三维瓦片 `tileset.json` 地址。              |
| `VITE_TOPOLOGY_URL`              | 拓扑接口完整地址。                          |
| `VITE_TOPOLOGY_POLL_INTERVAL_MS` | 拓扑轮询周期，默认 `5000`。                 |
| `VITE_HISTORY_MAX_POINTS`        | 单节点历史轨迹最大点数，默认 `720`。        |
| `VITE_NODE_ICON_SCALE_FACTOR`    | 目标类型图标缩放因子，默认 `2`。            |
| `VITE_GROUND_DEFAULT_HEIGHT`     | 地面目标默认高度，默认 `62` 米。            |
| `VITE_DRONE_DEFAULT_HEIGHT`      | 无人机默认高度，默认 `100` 米。             |
| `VITE_HIDE_INVALID_COORDINATE`   | 是否隐藏无效坐标和 `0.0,0.0`，默认 `true`。 |
| `VITE_TOPOLOGY_PROXY_TARGET`     | 本地 dev/preview 代理目标。                 |
| `VITE_TILESET_PROXY_TARGET`      | 本地三维瓦片 dev/preview 代理目标。         |

详细部署说明见 `docs/deploy-notes.md`。

## 目标类型图标

地图节点使用 `public/models/node-icons/svg/` 下的 SVG 图标。用户只需要替换同名文件即可换图标，例如把 `III类设备.svg` 覆盖为新的 III 类设备图标。替换后重新构建或重新部署静态资源即可生效。

`VITE_NODE_ICON_SCALE_FACTOR` 控制地图节点图标大小，默认 `2`，实际显示尺寸约为 `24px * 缩放因子`。例如 `1` 约为 24px，`1.5` 约为 36px，`2` 约为 48px。图例中的图标固定为 28px，不受该参数影响。

如果需要新增文件名或调整类型与图标的对应关系，修改 `src/config/nodeTypeStyle.ts` 中各类型的 `iconUri`。

## 内网部署说明

- Cesium 底图使用自带 `NaturalEarthII` 离线影像，随 `/cesium` 静态资源部署，不依赖默认 Bing/Cesium ion 公网影像。
- 3D Tiles 模型通过 `VITE_TILESET_URL` 配置，推荐在内网网关下使用 `/3dtiles/tileset.json` 这类同源路径。
- 若需要高精度内网影像或真实地形，需要额外部署内网瓦片服务或 terrain 服务。

## 安装

```sh
npm install
```

## 开发运行

```sh
npm run dev
```

## 生产构建

```sh
npm run build
npm run preview
```

## 类型检查与单元测试

```sh
npm run type-check
npm run test:unit
npm run test:unit -- --run
```

## Playwright e2e

```sh
npx playwright install
npm run build
npm run test:e2e
npm run test:e2e -- --project=chromium
npm run test:e2e -- --debug
```

## 上线前验证

```sh
npm run type-check
npm run test:unit -- --run
npm run build
CI=1 npm run test:e2e -- --project=chromium
```

## 本地测试拓扑服务

测试后端地址为 `http://127.0.0.1:8000/topology` 时，建议使用同源代理避免浏览器 CORS 拦截：

```sh
VITE_TILESET_URL=/3dtiles/tileset.json \
VITE_TILESET_PROXY_TARGET=http://192.168.233.1:8080 \
VITE_TOPOLOGY_URL=/topology \
VITE_TOPOLOGY_PROXY_TARGET=http://127.0.0.1:8000 \
npm run dev -- --host 0.0.0.0
```

完整 e2e 验证：

```sh
VITE_TILESET_URL=/3dtiles/tileset.json \
VITE_TILESET_PROXY_TARGET=http://192.168.233.1:8080 \
VITE_TOPOLOGY_URL=/topology \
VITE_TOPOLOGY_PROXY_TARGET=http://127.0.0.1:8000 \
npm run build

CI=1 \
LIVE_TOPOLOGY_URL=http://127.0.0.1:8000/topology \
LIVE_TOPOLOGY_DIRECT=1 \
VITE_TILESET_PROXY_TARGET=http://192.168.233.1:8080 \
VITE_TOPOLOGY_PROXY_TARGET=http://127.0.0.1:8000 \
npm run test:e2e -- --project=chromium
```

验收报告见 `docs/verification-report.md`。
