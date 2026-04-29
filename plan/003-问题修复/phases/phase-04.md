# Phase 04 线宽与历史航迹去重

## 状态

已完成

## 实现思路

该阶段收口 Cesium 折线细节和历史数据维护规则。历史航迹和链路线宽都改为 `1`。历史轨迹追加逻辑从严格相等改为阈值比较：当经度、纬度、高度三者变化都小于 `1e-8` 时视为没有移动，不追加新点。

## 需要新增或修改的文件

- `src/composables/cesiumEntityFactory.ts`
- `src/composables/cesiumEntityFactory.spec.ts`
- `src/domain/topologyHistory.ts`
- `src/domain/topologyHistory.spec.ts`
- 可能修改：`src/config/appConfig.ts`
- 可能修改：`src/config/appConfig.spec.ts`

## 待办条目

- [ ] 将历史航迹 polyline `width` 改为 `1`。依赖：Phase 03 后节点高度和轨迹高度偏移稳定。
- [ ] 将链路 polyline `width` 改为 `1`。依赖：Phase 03 后节点模型位置稳定。
- [ ] 在历史轨迹模块定义坐标变化阈值 `1e-8`。依赖：无。
- [ ] 修改 `isSamePosition`：三维变化都小于阈值才跳过追加。依赖：阈值常量。
- [ ] 保持 `maxPoints` 裁剪逻辑不变，默认仍为 `720` 且可配置。依赖：去重逻辑完成。
- [ ] 补充边界测试：完全相等、小于阈值、等于阈值、单轴超过阈值、超过上限裁剪。依赖：实现完成。
- [ ] 确认关闭历史航迹显示时，历史数据仍继续维护。依赖：Phase 02 显示开关。

## 验证方式

- `npm run test:unit -- --run src/domain/topologyHistory.spec.ts src/composables/cesiumEntityFactory.spec.ts`
- 使用固定节点连续刷新，确认静止目标不会持续增长历史点。

## 疑问或需澄清事项

无。
