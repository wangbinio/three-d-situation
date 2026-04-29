# 三维态势展示详细技术方案

## 1. 目标与范围

本项目是一个基于 Vue 3、Vite、TypeScript 的浏览器端三维态势展示应用，用于加载三维地图并持续展示仿真过程中网络节点目标和节点间链路信息。当前仓库仍是 Vue 官方模板级工程，已有 `src/main.ts`、`src/App.vue`、空路由、Pinia 示例 store、Vitest 单测和 Playwright e2e 测试入口，尚未接入 CesiumJS、业务组件、接口服务或配置体系。

本阶段目标是形成一套可直接落地的总体设计，指导后续按 TDD 方式实现以下能力：

- 加载 `tileset.json` 管理的三维地图数据。
- 周期性获取目标拓扑数据，并解析节点、链路、状态、位置和 IP 信息。
- 按节点类型渲染 9 种不同颜色和形态的三维目标图标，其中包含 1 个按 IP 识别的无人机特殊类型。
- 绘制节点实时位置、历史轨迹、活跃链路和可交互信息标牌。
- 通过配置控制地图地址、接口地址、轮询周期、历史轨迹点数和目标类型样式。

## 2. 当前工程事实

### 2.1 技术栈现状

当前 `package.json` 已包含：

- 运行时依赖：`vue`、`vue-router`、`pinia`。
- 构建与测试依赖：`vite`、`typescript`、`vue-tsc`、`vitest`、`@vue/test-utils`、`playwright`、`eslint`、`prettier`。
- 暂未包含：`cesium`、Cesium 静态资源处理插件、网络请求封装库或运行时 schema 校验库。

### 2.2 代码结构现状

当前关键入口如下：

- `src/main.ts`：创建 Vue 应用，注册 Pinia 与 router。
- `src/App.vue`：仍是模板页面，只显示 Vue 文档链接。
- `src/router/index.ts`：路由为空数组。
- `src/stores/counter.ts`：模板 counter store，可删除或替换为业务 store。
- `src/__tests__/App.spec.ts`：断言模板文本 `You did it!`。
- `e2e/vue.spec.ts`：断言首页 `h1` 为 `You did it!`。

因此后续实现需要同步调整单测和 e2e 测试，避免模板断言阻碍业务页面上线。

### 2.3 样例数据事实

`plan/001-总体设计/res.json` 的实际样例特征：

- `code` 为 `0`，`msg` 为 `ok`。
- `data.topo.node` 实际包含 6 个节点。
- `data.topo.link` 实际包含 5 条链路。
- `summary` 与 `code`、`data` 位于同一层级，不是 `data` 的子字段；因此应读取根级 `summary.node_count` 和 `summary.link_count` 做数量校验。
- 节点坐标存在 `113.057538,28.663600` 这种二维坐标，也存在 `0.0,0.0` 这种疑似占位坐标。
- 部分节点存在 `node_ports`、`node_up_time` 等附加字段，但当前展示需求暂不依赖这些字段。

## 3. 推荐总体架构

### 3.1 架构分层

建议采用“配置层、领域模型层、接口层、状态层、Cesium 场景层、Vue 交互层”的分层方式，避免把 Cesium 操作、接口请求和 UI 逻辑全部堆进单个组件。

```text
src/
  config/
    appConfig.ts
    nodeTypeStyle.ts
  domain/
    topologyTypes.ts
    topologyParser.ts
    topologyHistory.ts
  services/
    topologyApi.ts
  stores/
    situationStore.ts
  composables/
    useCesiumViewer.ts
    useTileset.ts
    useTopologyPolling.ts
    useSituationScene.ts
    useNodeSelection.ts
    useScreenOverlay.ts
  components/
    SituationMap.vue
    LegendPanel.vue
    NodeInfoCard.vue
    SituationToolbar.vue
  views/
    SituationView.vue
  assets/
    models/node-icons/
  test/
    fixtures/topology.ts
```

### 3.2 责任边界

- `config/` 只负责读取和归一化配置，不直接访问 Cesium 或接口。
- `domain/` 只负责类型定义、数据解析、坐标转换前的数据清洗、历史轨迹维护规则。
- `services/` 只负责 HTTP 请求、超时、错误转换和响应返回。
- `stores/` 只保存业务状态，例如节点、链路、历史轨迹、选中节点、加载状态和错误状态。
- `composables/` 负责把 Vue 生命周期与 Cesium 生命周期桥接起来。
- `components/` 负责界面呈现和用户交互，不直接解析后端原始字段。

这种拆分的核心收益是：解析逻辑可单测，Cesium 逻辑可局部 mock，UI 组件不会被后端字段格式和 Cesium API 细节污染。

## 4. 依赖与配置方案

### 4.1 新增依赖

建议新增：

```sh
npm install cesium
```

如果后续发现 Vite 对 Cesium 静态资源处理不稳定，再引入 `vite-plugin-cesium`。第一阶段优先直接使用 Cesium 官方 ESM 导入方式，减少额外插件依赖。

### 4.2 Cesium 静态资源配置

Cesium 初始化需要导入样式，并确保 Cesium 能定位 Workers、Assets、Widgets 等静态资源。方案如下：

- 在 `src/main.ts` 或 `src/composables/useCesiumViewer.ts` 导入 `cesium/Build/Cesium/Widgets/widgets.css`。
- 在 `public/cesium/` 放置 Cesium 运行所需静态资源，或通过 Vite 插件自动复制。
- 在应用启动前设置 `window.CESIUM_BASE_URL = '/cesium'`。

官方参考：Cesium `Viewer` 可通过 `new Viewer('cesiumContainer')` 初始化，三维瓦片推荐使用 `Cesium3DTileset.fromUrl(url)` 加载并加入 `scene.primitives`。

### 4.3 环境变量

建议新增 `.env.development`、`.env.production` 或由部署环境注入：

```env
VITE_TILESET_URL=http://192.168.233.1:8080/3DTILES/tileset.json
VITE_TOPOLOGY_URL=http://192.168.2.1:8000/api/v1/network/topology/query?online_nodes_only=true&active_links_only=false&exclude_class_I=false&exclude_class_III=false&with_summary=true
VITE_TOPOLOGY_POLL_INTERVAL_MS=5000
VITE_HISTORY_MAX_POINTS=720
VITE_HIDE_INVALID_COORDINATE=true
```

`appConfig.ts` 负责把这些字符串转换为稳定配置：

- `tilesetUrl: string`
- `topologyUrl: string`
- `pollIntervalMs: number`
- `historyMaxPoints: number`
- `hideInvalidCoordinate: boolean`

配置解析时需要做边界保护：轮询周期小于 1000ms 时回退到 5000ms，历史轨迹点数小于 1 时回退到 720。

### 4.4 跨域处理

接口和三维瓦片都来自局域网地址，浏览器可能遇到 CORS 限制。建议：

- 开发环境在 `vite.config.ts` 中配置代理，例如 `/api/topology` 转发到 `http://192.168.2.1:8000`。
- 生产环境由 Nginx 或网关统一反向代理地图服务和拓扑接口。
- 业务配置仍保留完整 URL 能力，便于无代理场景直接访问。

## 5. 数据模型设计

### 5.1 后端原始类型

建议在 `domain/topologyTypes.ts` 定义后端原始类型：

```ts
export interface TopologyResponse {
  code: number;
  msg?: string;
  summary?: RawTopologySummary;
  data?: {
    topo?: {
      node?: RawTopologyNode[];
      link?: RawTopologyLink[];
    };
  };
}
```

函数声明处需要添加中文注释，复杂解析逻辑也要添加少量中文注释，符合项目代码规范。

### 5.2 前端归一化模型

前端渲染不应直接依赖后端原始字段，建议归一化为：

```ts
export interface SituationNode {
  id: string;
  type: NodeType;
  status: NodeStatus;
  longitude: number;
  latitude: number;
  height: number;
  ipAddress: string;
  raw: RawTopologyNode;
  hasValidLocation: boolean;
}

export interface SituationLink {
  id: string;
  status: LinkStatus;
  sourceNodeId: string;
  targetNodeId: string;
  raw: RawTopologyLink;
}
```

### 5.3 坐标解析规则

`node_location` 解析规则：

- 使用英文逗号分隔，经度、纬度必需，高度可选。
- 缺少高度时使用 `0`。
- 经纬度无法解析为数字时标记为无效坐标。
- 经度不在 `[-180, 180]` 或纬度不在 `[-90, 90]` 时标记为无效坐标。
- `0.0,0.0` 在样例中很可能是占位值，默认根据 `VITE_HIDE_INVALID_COORDINATE=true` 隐藏，避免节点被渲染到几内亚湾附近。若业务确实存在真实 `(0,0)` 坐标，可通过配置关闭该策略。

### 5.4 节点类型映射

节点类型枚举以基础 8 类加 1 个无人机特殊类型组成，共 9 类：

| 类型值 | 名称 | 推荐形态 | 推荐颜色 |
| --- | --- | --- | --- |
| 1 | 一类设备终端 | 球体 | `#21d4fd` |
| 2 | 一类设备簇头 | 四面体 | `#00c853` |
| 3 | 二类设备车载 | 正方体 | `#ffb300` |
| 4 | 二类设备接入 | 圆柱 | `#ff7043` |
| 5 | 二类设备骨干 | 六棱柱 | `#7e57c2` |
| 6 | IV类设备网关 | 圆锥 | `#26a69a` |
| 7 | 二类设备-台式机 | 扁盒体 | `#5c6bc0` |
| 8 | III类设备 | 菱形体 | `#ef5350` |
| 30 | 无人机 | 旋翼无人机 | `#00e5ff` |

其中类型 `30` 不直接来自后端 `node_type`，而是前端在归一化阶段基于 `node_manage_ip_addr` 识别后覆盖得到。

`nodeTypeStyle.ts` 应统一维护类型、名称、颜色、图标模型路径和图例文本，渲染层只读取配置，不硬编码类型名称。

## 6. 三维目标图标方案

### 6.1 推荐方案：本地无色 glTF/GLB 图标加 Cesium 着色

为满足“本地资源目录加载无色三维图标，通过配置设定颜色”的要求，推荐把 8 个基础几何图标做成白色或灰白色 `.glb` 文件，放入：

```text
src/assets/models/node-icons/
  sphere.glb
  tetrahedron.glb
  cube.glb
  cylinder.glb
  hex-prism.glb
  cone.glb
  desktop.glb
  diamond.glb
```

渲染时使用 Cesium `Entity.model` 或低层 `Model` 加载，并通过 Cesium 的模型颜色混合能力按类型着色。这样用户只需要修改配置中的颜色，不需要维护 8 份不同颜色模型。

### 6.2 图标资源生成方式

可选生成路径：

- Blender 手工创建基础几何体，赋予白色基础材质后导出 GLB。
- 使用 Three.js 脚本生成几何体并导出 GLB，适合保持资产可复现。
- 第一阶段为了降低成本，也可以先使用 Cesium 内建 Entity 几何体实现球体、正方体、圆柱，四面体、圆锥、菱形体再用 GLB 补齐。

推荐最终统一使用 GLB。原因是所有类型都走同一套渲染路径，后续替换模型或调整尺寸时更稳定。

### 6.3 尺寸与可见性

节点图标应支持以下配置：

- `scale`：模型缩放比例。
- `minimumPixelSize`：远距离观察时的最小像素尺寸。
- `maximumScale`：避免近距离过大。
- `heightOffset`：节点离地偏移，避免与瓦片模型重叠。

## 7. Cesium 场景设计

### 7.1 Viewer 初始化

`useCesiumViewer.ts` 负责在 Vue 组件挂载后初始化 Viewer，并在组件卸载时调用 `viewer.destroy()` 清理资源。

建议关闭非必要控件：

- `animation: false`
- `timeline: false`
- `baseLayerPicker: false`
- `geocoder: false`
- `homeButton: false`
- `sceneModePicker: false`
- `navigationHelpButton: false`
- `selectionIndicator: false`
- `infoBox: false`

为了实时态势渲染，建议使用 `requestRenderMode: true`，每次更新节点、链路、标牌位置后显式调用 `viewer.scene.requestRender()`，降低空闲时 GPU 压力。

### 7.2 三维瓦片加载

`useTileset.ts` 负责：

- 读取 `appConfig.tilesetUrl`。
- 使用 `Cesium3DTileset.fromUrl(tilesetUrl)` 加载瓦片。
- 加载成功后加入 `viewer.scene.primitives`。
- 调用 `viewer.flyTo(tileset)` 或 `viewer.camera.flyTo()` 定位到地图区域。
- 捕获加载失败并写入 store 的错误状态。

### 7.3 节点渲染

`useSituationScene.ts` 负责维护 Cesium 实体缓存：

```text
nodeEntities: Map<nodeId, Entity>
trackEntities: Map<nodeId, Entity>
linkEntities: Map<linkId, Entity>
```

更新策略：

- 每轮接口数据到达后，按节点 ID 增量更新，不全量销毁重建。
- 新节点创建 Entity。
- 已存在节点更新 `position`、`show`、模型颜色和业务属性。
- 不再返回的节点可标记为离线或移除，第一阶段建议移除并保留历史轨迹缓存一段时间。
- 无效坐标节点默认不创建三维实体，但仍可计入数据状态，便于后续错误提示。

### 7.4 历史轨迹渲染

每个节点维护一个环形数组，最多 `historyMaxPoints` 个点，默认 720。若轮询周期为 5 秒，720 个点约等于 1 小时轨迹。

轨迹规则：

- 节点坐标有效时才追加轨迹点。
- 与上一点经纬高完全相同或距离小于阈值时不重复追加，减少无意义折线点。
- 每个节点使用与目标图标相同颜色绘制轨迹。
- Cesium 中使用 `polyline.positions` 渲染历史折线。
- 轨迹点超过上限时移除最旧点。

### 7.5 链路渲染

链路绘制规则：

- 只绘制 `link_status === 1` 的活跃链路。
- 源节点或目标节点不存在时不绘制。
- 源节点或目标节点坐标无效时不绘制。
- 使用绿色虚线，推荐 `PolylineDashMaterialProperty`。
- 线宽建议 2 到 3 像素。
- 链路 Entity ID 使用 `link:${link_id}`，避免与节点 ID 冲突。

链路更新同样采用增量策略：本轮不存在或不满足绘制条件的链路隐藏或删除。

## 8. 标牌与交互设计

### 8.1 选中节点

使用 Cesium `ScreenSpaceEventHandler` 监听左键点击，通过 `scene.pick` 判断是否点击到节点 Entity。

选中节点后：

- store 记录 `selectedNodeId`。
- Vue 层展示 `NodeInfoCard`。
- Cesium 层可以为选中节点添加轻微高亮，例如增大 scale 或添加外圈。

### 8.2 信息标牌推荐使用 HTML 覆盖层

需求中标牌需要显示多字段、右上角关闭按钮、右键关闭、可拖动。这类交互用 Cesium Label 实现成本高，因此推荐使用 Vue HTML 覆盖层：

- `NodeInfoCard.vue` 负责渲染卡片内容和关闭按钮。
- `useScreenOverlay.ts` 在 `viewer.scene.postRender` 中把节点世界坐标转换为屏幕坐标。
- 卡片初始位置显示在节点屏幕位置右上方。
- 用户拖动后保存屏幕偏移量。
- 相机移动、缩放、旋转时，卡片根据节点屏幕坐标加偏移量同步更新。

标牌字段：

- 节点 ID，建议省略中间长串，完整 ID 放到 title。
- 节点类型中文名。
- 节点状态：在线或离线。
- 位置：经度、纬度、高度。
- IP 地址：`node_manage_ip_addr`。

### 8.3 目标与标牌连接线

由于标牌是 HTML 覆盖层，连接线建议使用同一覆盖层内的 SVG：

- SVG 覆盖整个 Cesium 容器。
- 起点为节点世界坐标投影到屏幕后的点。
- 终点为标牌边缘或中心点。
- stroke 使用节点类型颜色。
- 每次 `postRender`、标牌拖动、节点位置更新后重新计算线段。

这种方式比创建三维 polyline 连接到“屏幕标牌”更直接，也更符合可拖动 UI 的需求。

### 8.4 关闭行为

- 点击卡片右上角关闭按钮：清空 `selectedNodeId` 或关闭对应节点卡片。
- 右键卡片：阻止浏览器默认菜单并关闭卡片。
- 点击地图空白区域：可选关闭卡片，第一阶段建议不关闭，避免误触。

## 9. 图例设计

`LegendPanel.vue` 固定在界面右上角，读取 `nodeTypeStyle.ts` 生成图例。图例每项包含：

- 小型 SVG 或 CSS 几何示意图。
- 节点类型中文名。
- 颜色块。

图例不直接依赖 Cesium 模型，避免为了展示图例再加载 3D 资源。若后续要求图例与真实模型完全一致，可扩展为缩略图资源。

## 10. 数据获取与状态管理

### 10.1 接口服务

`topologyApi.ts` 提供单一请求函数：

```ts
export async function fetchTopologySnapshot(url: string, signal?: AbortSignal): Promise<TopologyResponse>;
```

要求：

- 使用 `fetch`。
- 支持 `AbortSignal`，组件卸载或下一轮请求开始前可取消上一轮。
- 非 2xx HTTP 状态转换为业务错误。
- JSON 解析失败转换为业务错误。

### 10.2 周期轮询

`useTopologyPolling.ts` 负责 5 秒主动请求一次。设计要求：

- 组件挂载后立即请求一次，而不是等待第一个 5 秒周期。
- 每轮请求完成后再安排下一轮，避免接口慢时请求重叠。
- 组件卸载时清理定时器并取消进行中的请求。
- 页面不可见时可暂停轮询，页面恢复可立即刷新一次。
- 连续失败时保留上一轮有效数据，并显示错误状态。

### 10.3 Pinia store

`situationStore.ts` 建议状态：

```ts
interface SituationState {
  nodes: Map<string, SituationNode>;
  links: Map<string, SituationLink>;
  histories: Map<string, PositionPoint[]>;
  selectedNodeId: string | null;
  loading: boolean;
  lastUpdatedAt: number | null;
  errorMessage: string | null;
}
```

Pinia 的响应式 `Map` 在模板层消费时需要转换为数组 getter，例如 `nodeList`、`activeLinkList`、`selectedNode`。

## 11. 错误处理与边界条件

### 11.1 接口返回异常

- `code !== 0`：不更新场景，展示错误消息。
- `data.topo.node` 缺失：按空节点列表处理，并记录错误或警告。
- `data.topo.link` 缺失：按空链路列表处理。
- 根级 `summary` 缺失：不报错，跳过数量校验。
- `summary` 存在但数量不一致：不阻断渲染，只记录校验警告。

### 11.2 节点异常

- 缺少 `node_id`：丢弃该节点。
- `node_type` 不在基础集合 `1` 到 `8`，且 IP 也未命中无人机名单：使用“未知类型”兜底样式，或不渲染。第一阶段建议使用兜底样式并在标牌中显示原始类型值。
- 坐标无效：默认不渲染实体、不绘制轨迹和链路，但保留节点数据用于统计和错误定位。
- IP 缺失：标牌中显示 `--`。

### 11.3 链路异常

- 缺少 `link_id`：使用 `src_node + dst_node` 组合生成临时 ID。
- 缺少源节点或目标节点：不绘制。
- `link_status !== 1`：不绘制绿色虚线。

## 12. 性能设计

### 12.1 增量更新优先

5 秒轮询一次时，节点和链路数量可能增长。渲染层必须基于 ID 复用 Cesium Entity，避免每轮全量 `removeAll()` 后重建，减少闪烁和 GC 压力。

### 12.2 历史轨迹限长

默认每节点 720 点。如果节点数较多，历史轨迹会成为主要实体数量和点数量来源。必须通过 `historyMaxPoints` 限长，并跳过重复坐标点。

### 12.3 显式渲染

启用 `requestRenderMode` 后，数据更新、标牌拖动、选中状态变化时调用 `scene.requestRender()`。这样空闲时不持续重绘，有利于长时间监控场景。

### 12.4 大规模优化预留

如果节点数量超过数千，Entity API 可能出现性能瓶颈。届时可升级为：

- 节点用 `Primitive` 或 `ModelInstanceCollection`。
- 轨迹分批合并为 `PolylineCollection`。
- 标牌只对选中节点渲染，避免批量 HTML 覆盖层。

第一阶段不提前引入这些复杂度。

## 13. UI 页面设计

### 13.1 页面布局

`SituationView.vue` 作为主页面：

```text
<main class="situation-page">
  <SituationMap />
  <LegendPanel />
  <SituationToolbar />
  <NodeInfoCard v-if="selectedNode" />
</main>
```

页面占满视口，Cesium 容器绝对铺满，图例和标牌位于同一个 overlay 层中。

### 13.2 工具栏

第一阶段可提供简洁状态栏：

- 节点数量。
- 活跃链路数量。
- 最近更新时间。
- 当前接口状态。
- 手动刷新按钮。

这能帮助测试和现场排查，不影响核心三维展示。

## 14. 测试方案

### 14.1 单元测试

优先为纯函数写测试：

- `parseNodeLocation`：二维坐标、三维坐标、空字符串、非法数字、越界、`0.0,0.0`。
- `normalizeTopologyResponse`：正常响应、`code !== 0`、缺失 `summary`、缺失 node/link、未知节点类型。
- `appendHistoryPoint`：追加、重复点跳过、超过 720 点裁剪。
- `resolveActiveLinks`：缺失端点、离线链路、无效坐标端点。

### 14.2 组件测试

- `LegendPanel`：9 种节点类型全部展示，文本与配置一致，其中无人机类型可正常显示。
- `NodeInfoCard`：显示节点状态、位置、IP，关闭按钮触发事件，右键关闭事件有效。
- `SituationToolbar`：节点数量、链路数量、更新时间展示正确。

### 14.3 Cesium 相关测试

Cesium Viewer 不适合在 jsdom 中完整运行。建议：

- 把 Cesium API 包装在 composable 内。
- 单测 mock `viewer.entities.add/remove`、`scene.primitives.add`、`scene.requestRender`。
- 对真实 WebGL 行为通过 Playwright e2e 验证页面可加载、图例可见、接口 mock 后节点卡片可出现。

### 14.4 e2e 测试

使用 Playwright：

- 拦截拓扑接口，返回 `plan/001-总体设计/res.json` 的简化 fixture。
- 访问首页，断言图例存在。
- 等待轮询完成，断言状态栏节点数量为 6 或有效坐标节点数量符合预期。
- 点击 mock 节点对应屏幕区域较难稳定，第一阶段可通过暴露测试按钮或测试模式选中节点，验证标牌展示和关闭。

## 15. 推荐实施顺序

### 15.1 第一阶段：基础骨架和配置

1. 安装 `cesium`。
2. 新增 `appConfig.ts` 和 `nodeTypeStyle.ts`。
3. 替换模板 `App.vue`，建立 `SituationView.vue` 和基础布局。
4. 更新路由，使根路径显示态势页面。
5. 更新模板单测和 e2e 断言。

### 15.2 第二阶段：数据模型和接口

1. 定义原始拓扑类型和归一化类型。
2. 实现坐标解析和响应归一化。
3. 编写对应单元测试，并先确保测试覆盖失败路径。
4. 实现 `topologyApi.ts` 和 `useTopologyPolling.ts`。
5. 接入 Pinia store。

### 15.3 第三阶段：Cesium 地图和节点

1. 实现 Viewer 初始化和销毁。
2. 加载三维 Tileset。
3. 渲染节点 Entity。
4. 增量更新节点位置和样式。
5. 接入历史轨迹。

### 15.4 第四阶段：链路和交互

1. 渲染活跃链路绿色虚线。
2. 实现节点点击选择。
3. 实现 HTML 标牌、关闭按钮和右键关闭。
4. 实现标牌拖动和 SVG 连接线。
5. 实现图例面板和状态工具栏。

### 15.5 第五阶段：验收和优化

1. 完成单测、组件测试和 e2e 测试。
2. 使用真实三维瓦片地址和真实拓扑接口联调。
3. 验证 CORS、资源路径、生产构建和部署路径。
4. 根据节点数量压测历史轨迹和链路渲染性能。

## 16. 文件改造清单

建议新增：

- `src/config/appConfig.ts`
- `src/config/nodeTypeStyle.ts`
- `src/domain/topologyTypes.ts`
- `src/domain/topologyParser.ts`
- `src/domain/topologyHistory.ts`
- `src/services/topologyApi.ts`
- `src/stores/situationStore.ts`
- `src/composables/useCesiumViewer.ts`
- `src/composables/useTileset.ts`
- `src/composables/useTopologyPolling.ts`
- `src/composables/useSituationScene.ts`
- `src/composables/useNodeSelection.ts`
- `src/composables/useScreenOverlay.ts`
- `src/components/SituationMap.vue`
- `src/components/LegendPanel.vue`
- `src/components/NodeInfoCard.vue`
- `src/components/SituationToolbar.vue`
- `src/views/SituationView.vue`
- `src/test/fixtures/topology.ts`

建议修改：

- `package.json`：增加 `cesium` 依赖。
- `vite.config.ts`：根据 Cesium 静态资源和开发代理需要调整。
- `src/main.ts`：设置 Cesium base URL，导入 Cesium 样式或应用全局样式。
- `src/App.vue`：替换模板内容为路由出口或直接挂载态势页面。
- `src/router/index.ts`：配置根路由。
- `src/__tests__/App.spec.ts`：更新模板测试。
- `e2e/vue.spec.ts`：更新 e2e 测试。

可删除或保留：

- `src/stores/counter.ts`：模板 store，无业务价值，建议后续删除。

## 17. 关键技术决策

### 17.1 为什么不用 Cesium Label 实现标牌

Cesium Label 适合纯文本标注，但需求包含关闭按钮、右键关闭、富文本字段和拖动。HTML 覆盖层由 Vue 管理状态和事件，更容易测试和维护。Cesium 只负责把节点世界坐标投影到屏幕坐标。

### 17.2 为什么图标推荐 GLB

Cesium 内建 Entity 几何体无法优雅覆盖所有要求形态，尤其是四面体、菱形体、台式机形态。统一 GLB 模型可以保证渲染路径一致，并通过配置颜色实现用户可修改样式。

### 17.3 为什么需要归一化数据层

后端字段使用 `node_id`、`node_location`、`src.src_node` 等原始结构，直接在组件中使用会导致 UI、Cesium 和接口格式耦合。归一化后，渲染层只关心 `id`、`position`、`status`、`type`，后端字段变化时只需要调整 parser。

### 17.4 为什么不强依赖 summary

`summary` 与 `code`、`data` 位于同一层级，不能按 `data.summary` 读取。实现应优先使用根级 `summary.node_count` 和 `summary.link_count` 校验列表数量；当根级 `summary` 缺失时不阻断渲染，只跳过数量校验并保留告警能力。

## 18. 验收标准

第一版完成后应满足：

- 页面打开后能加载配置中的三维 Tileset。
- 页面每 5 秒请求一次目标接口，首次进入立即请求。
- 样例数据中有效坐标节点能显示在地图对应位置。
- 9 种节点类型配置完整，图例在右上角展示。
- 节点按类型显示不同颜色和形态。
- 每个节点最多保存 720 个历史轨迹点，轨迹颜色与节点颜色一致。
- 活跃链路以绿色虚线连接源节点和目标节点。
- 点击节点后显示可关闭、可右键关闭、可拖动的信息标牌。
- 标牌与节点之间显示同色连接线。
- 接口失败、地图加载失败、无效坐标不会导致页面崩溃。
- `npm run type-check`、`npm run test:unit`、`npm run build` 通过。

## 19. 参考资料

- CesiumJS `Cesium3DTileset.fromUrl`：https://cesium.com/learn/cesiumjs/ref-doc/Cesium3DTileset.html
- CesiumJS `Viewer` 初始化：https://github.com/cesiumgs/cesium/blob/main/README.md
- CesiumJS `Camera.flyTo`：https://cesium.com/learn/cesiumjs/ref-doc/Camera.html
- CesiumJS `Label` 属性参考：https://cesium.com/learn/cesiumjs/ref-doc/Label.html
- Vue 3 Composition API 与生命周期：https://cn.vuejs.org/guide/extras/composition-api-faq
