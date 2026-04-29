import type { PositionPoint, SituationNode } from "./topologyTypes";

const POSITION_EPSILON = 1e-8;

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

function isSamePosition(left: PositionPoint, right: PositionPoint): boolean {
  return (
    Math.abs(left.longitude - right.longitude) < POSITION_EPSILON &&
    Math.abs(left.latitude - right.latitude) < POSITION_EPSILON &&
    Math.abs(left.height - right.height) < POSITION_EPSILON
  );
}
