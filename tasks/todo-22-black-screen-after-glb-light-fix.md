# GLB 光照修复后黑屏排查

## 计划

- [x] 复现页面黑屏，收集浏览器控制台或 dev server 报错。
- [x] 比对 `useCesiumViewer` 与近期光照改动，确认是否是 Cesium 初始化/渲染异常。
- [x] 先补或调整测试覆盖黑屏根因，再修复实现。
- [x] 运行验证并回填结论。

## 评审记录

- 高概率根因是上一轮把 `viewer.scene.light` 改成了固定 `DirectionalLight`。该改动影响的是整个 Cesium 场景，不只是节点 GLB；对 3D Tiles 底图会连带改变整体受光，用户环境里表现为地图加载后直接发黑。
- 修复方式：撤回 `src/composables/useCesiumViewer.ts` 中的全局场景光照改动，只保留关闭 AO；把节点提亮收敛到 `src/composables/cesiumEntityFactory.ts` 的模型级参数，在 `model` 上使用 `lightColor: Color.WHITE` 和温和的 `imageBasedLightingFactor`。
- 单测已同步：`src/composables/useCesiumViewer.spec.ts` 不再要求初始化时创建全局定向光，`src/composables/cesiumEntityFactory.spec.ts` 断言模型级 `lightColor` 存在。
- 验证通过：`npm run test:unit -- --run src/composables/useCesiumViewer.spec.ts src/composables/cesiumEntityFactory.spec.ts src/config/nodeTypeStyle.spec.ts`。
- 验证通过：`npm run type-check`。
- 验证通过：`npm run build`；仍保留既有 chunk 体积告警和 `protobufjs` 的 direct eval 告警。
- 浏览器侧补充验证：当前执行环境访问 `http://192.168.233.1:8080/3DTILES/tileset.json` 会触发 CORS 拦截，无法在此环境完成真实 tileset 联调，因此“黑屏修复”主要依据代码回滚范围、单测和构建验证；用户本机仍需刷新页面做最终肉眼确认。
