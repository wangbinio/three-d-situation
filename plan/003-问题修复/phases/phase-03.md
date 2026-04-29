# Phase 03 三维图标与状态外圈

## 状态

已完成

## 实现思路

生成 8 个简易无色 GLB 几何模型并放入 `public/models/node-icons/`，使现有 `/models/node-icons/*.glb` 配置可直接访问。节点渲染从 `point` 改为 `model`，使用类型颜色着色，并通过模型轮廓表达在线/离线状态：在线白色，离线黑色。

## 需要新增或修改的文件

- `public/models/node-icons/sphere.glb`
- `public/models/node-icons/tetrahedron.glb`
- `public/models/node-icons/cube.glb`
- `public/models/node-icons/cylinder.glb`
- `public/models/node-icons/hex-prism.glb`
- `public/models/node-icons/cone.glb`
- `public/models/node-icons/desktop.glb`
- `public/models/node-icons/diamond.glb`
- `src/config/nodeTypeStyle.ts`
- `src/config/nodeTypeStyle.spec.ts`
- `src/composables/cesiumEntityFactory.ts`
- `src/composables/cesiumEntityFactory.spec.ts`

## 待办条目

- [ ] 生成 8 个基础 GLB 模型，保持低面数、无色或白色材质。依赖：用户已确认允许生成资产。
- [ ] 确认 `modelUri` 与 `public/models/node-icons/` 访问路径一致。依赖：资产落盘。
- [ ] 将节点 Entity 从 `point` 改为 `model`，使用 `color` 和颜色混合能力应用类型颜色。依赖：模型路径有效。
- [ ] 将视觉尺寸缩小到当前约 1/2，优先调整 `minimumPixelSize`、`scale`、`maximumScale`。依赖：模型渲染完成。
- [ ] 使用模型轮廓或等效可视外圈表达状态：在线白色，离线黑色。依赖：模型渲染完成。
- [ ] 保持选中态可辨识，避免选中态把状态外圈颜色覆盖掉。依赖：状态外圈完成。
- [ ] 调整图例图标，使 10 类图标语义与当前节点类型配置一致，且不再显示形状文字。依赖：模型形态确认。
- [ ] 更新单测，确认节点 Entity 使用 `model` 且不再使用 `point`。依赖：实现完成。

## 验证方式

- `npm run test:unit -- --run src/config/nodeTypeStyle.spec.ts src/composables/cesiumEntityFactory.spec.ts src/components/LegendPanel.spec.ts`
- 浏览器中观察 10 类目标图标语义是否正确，在线/离线外圈是否正确。

## 疑问或需澄清事项

无。
