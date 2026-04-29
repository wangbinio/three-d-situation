# 三维态势展示部署说明

## 环境变量

应用通过 Vite 环境变量读取运行配置。未配置时使用代码内默认值。

| 变量                             | 默认值                                                      | 说明                                     |
| -------------------------------- | ----------------------------------------------------------- | ---------------------------------------- |
| `VITE_TILESET_URL`               | `http://192.168.233.1:8080/3DTILES/tileset.json`            | 三维瓦片 `tileset.json` 地址。           |
| `VITE_TOPOLOGY_URL`              | `http://192.168.2.1:8000/api/v1/network/topology/query?...` | 拓扑接口完整地址。                       |
| `VITE_TOPOLOGY_POLL_INTERVAL_MS` | `5000`                                                      | 拓扑轮询周期，低于 `1000` 会回退默认值。 |
| `VITE_HISTORY_MAX_POINTS`        | `720`                                                       | 单节点历史轨迹最大点数。                 |
| `VITE_NODE_ICON_SCALE_FACTOR`    | `2`                                                         | 目标类型图标缩放因子，必须大于 `0`。     |
| `VITE_HIDE_INVALID_COORDINATE`   | `true`                                                      | 是否隐藏无效坐标和 `0.0,0.0` 占位坐标。  |
| `VITE_TOPOLOGY_PROXY_TARGET`     | 无                                                          | 本地 dev/preview 代理目标。              |
| `VITE_TILESET_PROXY_TARGET`      | 无                                                          | 本地三维瓦片 dev/preview 代理目标。      |

## 目标类型图标替换与大小控制

节点图标使用 `public/models/node-icons/svg/` 目录中的 SVG 文件，生产部署后对应访问路径为 `/models/node-icons/svg/*.svg`。如果只替换现有类型图标，保持文件名不变并覆盖同名 SVG 即可，例如：

| 类型 | 文件 |
| --- | --- |
| 一类设备终端 | `一类设备终端.svg` |
| 一类设备簇头 | `一类设备簇头.svg` |
| 二类设备车载 | `二类设备车载.svg` |
| 二类设备接入 | `二类设备接入.svg` |
| 二类设备骨干 | `二类设备骨干.svg` |
| Ⅳ类设备网关 | `Ⅳ类设备网关.svg` |
| 二类设备-台式机 | `二类设备-台式机.svg` |
| III类设备 | `III类设备.svg` |
| 无人机 | `无人机.svg` |
| 手持背负设备 | `手持背负.svg` |
| 未知类型 | `未知类型.svg` |

SVG 建议保留 `viewBox="0 0 40 40"`，主体图形尽量填满画布，并使用明确轮廓，避免远距离缩小后难以辨认。替换同名文件后重新执行 `npm run build` 并部署 `dist/`；如果是在已部署静态目录中直接覆盖 `/models/node-icons/svg/*.svg`，刷新浏览器缓存后即可生效。

地图节点图标大小由 `VITE_NODE_ICON_SCALE_FACTOR` 控制，默认 `2`，实际像素约为 `24px * 缩放因子`：

```env
VITE_NODE_ICON_SCALE_FACTOR=1.5
```

常用参考：`1` 约 24px，`1.5` 约 36px，`2` 约 48px。该参数只控制地图上的节点图标；右上角图例为了保持布局稳定，固定显示为 28px。如果需要新增文件名或改变类型映射，修改 `src/config/nodeTypeStyle.ts` 中对应类型的 `iconUri`。

## 本地运行

```sh
npm install
npm run dev
```

开发服务默认运行在 `http://localhost:5173`。如果浏览器直接访问局域网瓦片或拓扑接口，需要服务端允许当前页面源的 CORS 请求。

如果测试拓扑服务未开启 CORS，可以使用同源代理：

```sh
VITE_TILESET_URL=/3dtiles/tileset.json \
VITE_TILESET_PROXY_TARGET=http://192.168.233.1:8080 \
VITE_TOPOLOGY_URL=/topology \
VITE_TOPOLOGY_PROXY_TARGET=http://127.0.0.1:8000 \
npm run dev
```

## 生产构建

```sh
npm run build
npm run preview
```

构建产物位于 `dist/`。`vite.config.ts` 会在构建时把 `node_modules/cesium/Build/Cesium` 复制到 `dist/cesium`，运行时 `CESIUM_BASE_URL` 指向 `/cesium`。

## 内网底图与三维模型

应用已关闭 Cesium 默认公网影像底图，改用 Cesium 自带 `NaturalEarthII` 离线底图。该底图位于 `/cesium/Assets/Textures/NaturalEarthII`，随 Cesium 静态资源一起部署，不依赖 `api.cesium.com`、Bing Maps 或其他公网影像服务。

三维模型仍通过 `VITE_TILESET_URL` 加载自部署 3D Tiles。内网部署时建议使用同源路径，例如：

```env
VITE_TILESET_URL=/3dtiles/tileset.json
```

如需高精度内网影像或真实地形，应单独部署内网 XYZ/TMS/WMS/ArcGIS 影像服务或 Cesium terrain 服务，再扩展 Viewer 配置接入；不要依赖浏览器缓存公网底图。

## 反向代理建议

推荐由同一网关代理前端、三维瓦片和拓扑接口，避免浏览器跨域。

```nginx
location / {
  try_files $uri $uri/ /index.html;
}

location /3dtiles/ {
  proxy_pass http://192.168.233.1:8080/3DTILES/;
}

location /api/topology/ {
  proxy_pass http://192.168.2.1:8000/api/v1/network/topology/;
}
```

对应环境变量示例：

```env
VITE_TILESET_URL=/3dtiles/tileset.json
VITE_TOPOLOGY_URL=/api/topology/query?online_nodes_only=true&active_links_only=false&exclude_class_I=false&exclude_class_III=false&with_summary=true
```

## 上线前验证命令

```sh
npm run type-check
npm run test:unit -- --run
npm run build
CI=1 npm run test:e2e -- --project=chromium
```

使用本地测试拓扑服务做完整浏览器联调：

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

若需要验证全部 Playwright 项目，先确认 Firefox 和 WebKit 可执行文件已安装：

```sh
npx playwright install
npm run test:e2e
```

## 运行风险

- Cesium 及其依赖会产生较大的生产包，当前构建会提示 chunk 超过 `500 kB`。
- `protobufjs` 依赖包含 direct eval，构建工具会输出警告；当前不阻断构建。
- 当前底图使用 Cesium 自带 `NaturalEarthII` 离线影像，适合内网背景展示，但分辨率低于在线卫星影像。
- 默认三维瓦片服务目前可达，但响应头未观察到 `Access-Control-Allow-Origin`，跨域部署时浏览器可能拦截。
- 三维瓦片服务未开启 CORS 时，开发环境应使用 `VITE_TILESET_URL=/3dtiles/tileset.json` 和 `VITE_TILESET_PROXY_TARGET=http://192.168.233.1:8080`，Vite 会把 `/3dtiles/*` 转发到 `/3DTILES/*`。
- 默认拓扑接口在本机 5 秒探测中超时，需要后端服务或网络链路恢复后再做真实联调。
- 本地测试拓扑服务 `http://127.0.0.1:8000/topology` 当前可达，但未开启 CORS；浏览器联调应使用 `/topology` 同源代理，或让后端增加 `Access-Control-Allow-Origin`。
