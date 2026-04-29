# Phase 02 拓扑领域模型与解析

## 1. 阶段目标

建立后端拓扑响应的 TypeScript 类型、前端归一化模型、坐标解析、节点和链路解析、summary 数量校验与历史轨迹纯函数。本阶段只处理纯数据逻辑，不接入网络请求和 Cesium。

## 2. 实现思路

先用样例 `res.json` 抽取最小必要字段，定义 `RawTopologyNode`、`RawTopologyLink`、`TopologyResponse`、`SituationNode`、`SituationLink` 和 `PositionPoint`。再通过纯函数完成响应归一化，确保所有异常输入都能返回可控结果。`summary` 必须定义在响应根级，与 `code`、`data` 同层，不能放在 `data` 下。

## 3. 需要新增的文件

- `src/domain/topologyTypes.ts`
- `src/domain/topologyParser.ts`
- `src/domain/topologyHistory.ts`
- `src/domain/topologyParser.spec.ts`
- `src/domain/topologyHistory.spec.ts`
- `src/test/fixtures/topology.ts`

## 4. 需要修改的文件

- 无必须修改文件；如测试配置无法加载 fixture，可调整 `vitest.config.ts`。

## 5. 待办条目

| 编号 | 待办 | 简要说明 | 前置依赖 |
| --- | --- | --- | --- |
| 02-01 | 定义原始响应类型 | `TopologyResponse` 包含根级 `code`、`msg`、`summary`、`data`，其中 `summary` 不属于 `data`。 | Phase 00 |
| 02-02 | 定义前端归一化类型 | 定义 `SituationNode`、`SituationLink`、`PositionPoint`、节点状态和链路状态枚举。 | 02-01 |
| 02-03 | 建立测试 fixture | 从 `plan/001-总体设计/res.json` 提取小型 fixture，覆盖正常节点、无效坐标节点和活跃链路。 | 02-01 |
| 02-04 | 编写坐标解析失败测试 | 覆盖二维坐标、三维坐标、空字符串、非法数字、越界、`0.0,0.0`。 | 02-03 |
| 02-05 | 实现坐标解析函数 | 输出经度、纬度、高度和 `hasValidLocation`，默认隐藏 `0.0,0.0`。 | 02-04 |
| 02-06 | 编写响应归一化测试 | 覆盖 `code !== 0`、缺失 node、缺失 link、根级 summary 数量一致和不一致。 | 02-03 |
| 02-07 | 实现响应归一化函数 | 丢弃缺少 `node_id` 的节点，兼容未知节点类型和缺失 IP。 | 02-06 |
| 02-08 | 编写历史轨迹测试 | 覆盖追加、重复点跳过、超过上限裁剪和无效坐标不追加。 | 02-02 |
| 02-09 | 实现历史轨迹函数 | 使用纯函数维护每个节点的轨迹数组，不直接依赖 Pinia。 | 02-08 |
| 02-10 | 执行阶段验证 | 运行 `npm run type-check`、`npm run test:unit`、`npm run build`。 | 02-01 至 02-09 |

## 6. 验收标准

- 后端响应类型正确表达根级 `summary`。
- 坐标解析对缺省高度、无效坐标和 `0.0,0.0` 有明确行为。
- 响应归一化不会因字段缺失导致运行时崩溃。
- 历史轨迹最多保留配置上限数量的点。
- 单测覆盖主要边界条件并全部通过。

## 7. 风险与注意事项

- 不要把接口请求错误和响应解析错误混在同一个函数中；网络错误属于 Phase 03。
- 不要在 parser 中创建 Cesium `Cartesian3`，否则纯数据层会被 Cesium 依赖污染。
