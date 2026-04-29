# Phase 06 节点选择、标牌与拖动交互

## 1. 阶段目标

实现节点点击选择、节点信息标牌、关闭按钮、右键关闭、标牌拖动，以及节点与标牌之间的同色 SVG 连接线。此阶段完成主要用户交互体验。

## 2. 实现思路

使用 Cesium `ScreenSpaceEventHandler` 处理场景点击，通过 `scene.pick` 获取节点 Entity，再把选中节点 ID 写入 store。标牌使用 Vue HTML 覆盖层实现，而不是 Cesium Label。`useScreenOverlay` 在 `postRender` 中把节点世界坐标转换为屏幕坐标，并叠加用户拖动偏移量。连接线使用覆盖层 SVG 绘制，避免三维线条和屏幕 UI 坐标系不匹配。

## 3. 需要新增的文件

- `src/composables/useNodeSelection.ts`
- `src/composables/useNodeSelection.spec.ts`
- `src/composables/useScreenOverlay.ts`
- `src/composables/useScreenOverlay.spec.ts`
- `src/components/NodeInfoCard.vue`
- `src/components/NodeInfoCard.spec.ts`
- `src/components/OverlayConnector.vue`，如果连接线独立成组件。

## 4. 需要修改的文件

- `src/views/SituationView.vue`
- `src/components/SituationMap.vue`
- `src/stores/situationStore.ts`
- `src/composables/useSituationScene.ts`，如需要对选中节点高亮。

## 5. 待办条目

| 编号 | 待办 | 简要说明 | 前置依赖 |
| --- | --- | --- | --- |
| 06-01 | 编写节点选择测试 | Mock `scene.pick`，验证点击节点写入 `selectedNodeId`，点击非节点不破坏现有状态。 | Phase 05 |
| 06-02 | 实现 `useNodeSelection` | 注册 Cesium 左键点击事件，卸载时销毁 handler。 | 06-01 |
| 06-03 | 编写标牌组件测试 | 覆盖节点类型、状态、位置、IP 展示，关闭按钮和右键关闭事件。 | Phase 03 |
| 06-04 | 实现 `NodeInfoCard.vue` | 使用完整节点信息渲染标牌，长 ID 用 title 保留完整值。 | 06-03 |
| 06-05 | 编写屏幕坐标投影测试 | Mock Cesium `SceneTransforms` 或等价封装，验证节点坐标转换和不可见状态。 | Phase 04 |
| 06-06 | 实现 `useScreenOverlay` | 在 `postRender` 中同步节点屏幕位置、标牌位置和连接线端点。 | 06-05 |
| 06-07 | 实现标牌拖动 | 记录拖动偏移量，相机变化时用节点屏幕点加偏移计算标牌位置。 | 06-06 |
| 06-08 | 实现 SVG 连接线 | 起点为节点屏幕坐标，终点为标牌边缘或中心点，颜色取节点类型颜色。 | 06-07 |
| 06-09 | 实现选中高亮 | 可通过增大 scale、外圈或颜色强调选中节点，要求不破坏类型颜色识别。 | 06-02, Phase 05 |
| 06-10 | 执行阶段验证 | 运行类型检查、单测、构建，并在浏览器中验证选择、关闭、右键关闭和拖动。 | 06-01 至 06-09 |

## 6. 验收标准

- 点击节点后展示信息标牌。
- 标牌展示节点状态、位置和 IP 地址。
- 点击关闭按钮可以关闭标牌。
- 右键标牌可以关闭标牌，并阻止浏览器默认菜单。
- 标牌可以拖动，拖动后相机移动仍能保持相对偏移。
- 标牌与目标之间显示与节点类型相同颜色的细线。

## 7. 风险与注意事项

- 屏幕覆盖层需要处理节点被地球背面遮挡或投影失败的情况，此时应隐藏标牌或连接线。
- 拖动事件要避免影响 Cesium 相机拖拽；标牌拖动时需要阻止事件冒泡。
