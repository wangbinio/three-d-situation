# GLB 模型发暗修复

## 计划

- [x] 确认 GLB 模型发暗根因，区分贴图模型与纯几何模型的渲染策略。
- [x] 先补失败测试，覆盖节点模型参数和 Viewer 默认光照初始化。
- [x] 收敛 `cesiumEntityFactory` 与 `useCesiumViewer` 的模型/光照实现，移除不稳定提亮逻辑。
- [x] 运行相关单测与类型检查，记录验证结果。

## 评审记录

- 根因一：`soldier.glb`、`car.glb`、`uav.glb` 属于带贴图/材质的真实模型，继续沿用 `colorBlendMode=MIX` 且 `colorBlendAmount=1` 会把原始材质近似整片盖色，导致模型显脏、发灰、发暗。
- 根因二：Viewer 层把场景光照改成跟随相机方向的“手电筒”，并叠加 bloom、固定时间等补丁，虽然能局部提亮，但渲染语义不稳定，容易出现过曝或视角相关的亮度跳变。
- `src/config/nodeTypeStyle.ts` 新增 `applyModelTint`，将贴图模型与纯几何模型分流：贴图模型在线时保留原材质，纯几何模型继续按配置色做轻度混色。
- 用户进一步定位后确认：`imageBasedLightingFactor` 在当前 `Entity.model` + 资产组合上会触发加载异常，因此该参数已彻底移除，不再作为亮度修复手段。
- `src/config/nodeTypeStyle.ts` 新增 `brightnessBoost`，只给贴图模型配置局部亮度增益，当前 `soldier.glb` / `car.glb` 默认 `1.35`，`uav.glb` 默认 `1.2`。
- `src/composables/cesiumEntityFactory.ts` 改为使用配置层的 `scale`、`minimumPixelSize`、`maximumScale`，去掉硬编码 `scale=1` 与 `minimumPixelSize=64`，同时把离线态统一压暗，并通过 `CustomShader` 仅提升贴图模型的 `diffuse` 亮度。
- `src/composables/useCesiumViewer.ts` 改为固定方向主光并关闭环境光遮蔽，移除 bloom、相机跟随光和固定北京时间中午的时间补丁。
- 之后又撤回 `useCesiumViewer.ts` 的全局场景光照改动，避免 3D Tiles 底图被整体拖黑；最终亮度修复完全落在模型级参数和贴图模型专用着色器上。
- 验证顺序：先运行 `npm run test:unit -- --run src/config/nodeTypeStyle.spec.ts src/composables/cesiumEntityFactory.spec.ts src/composables/useCesiumViewer.spec.ts`，确认新增测试在旧实现下失败；实现后同命令通过。
- 验证通过：`npm run type-check`。
- 验证通过：`npm run build`；仍保留既有的大 chunk 告警和 `protobufjs` 的 direct eval 告警，不是本次改动引入。
