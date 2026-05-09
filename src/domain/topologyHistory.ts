import type { PositionPoint, SituationNode } from "./topologyTypes";

const POSITION_EPSILON = 1e-6;
const HEIGHT_EPSILON_METERS = 0.1;

// 追加单个节点的历史轨迹点，并按配置上限裁剪旧点。
export function appendHistoryPoint(
  history: readonly PositionPoint[],
  node: SituationNode,
  maxPoints: number,
  timestamp: number = Date.now(),
): PositionPoint[] {
  if (!node.hasValidLocation || maxPoints < 1) {
    return [...history];
  }

  const nextPoint: PositionPoint = {
    longitude: node.longitude,
    latitude: node.latitude,
    height: node.height,
    timestamp,
  };

  const lastPoint = history.length > 0 ? history[history.length - 1] : undefined;
  if (lastPoint !== undefined && isSamePosition(lastPoint, nextPoint)) {
    return [...history];
  }

  const nextHistory = [...history, nextPoint];
  return nextHistory.slice(Math.max(0, nextHistory.length - Math.floor(maxPoints)));
}

// 判断两个位置是否落在防抖阈值内，经纬度用 1e-6，高度用 0.1 米。
export function isSamePosition(
  left: Pick<PositionPoint, "longitude" | "latitude" | "height">,
  right: Pick<PositionPoint, "longitude" | "latitude" | "height">,
): boolean {
  return (
    Math.abs(left.longitude - right.longitude) <= POSITION_EPSILON &&
    Math.abs(left.latitude - right.latitude) <= POSITION_EPSILON &&
    Math.abs(left.height - right.height) <= HEIGHT_EPSILON_METERS
  );
}
