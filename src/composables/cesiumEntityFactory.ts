import {
  Cartesian3,
  Color,
  ColorMaterialProperty,
  Entity,
  HorizontalOrigin,
  PolylineDashMaterialProperty,
  VerticalOrigin,
} from "cesium";

import { appConfig } from "@/config/appConfig";
import { getNodeTypeStyle } from "@/config/nodeTypeStyle";
import {
  LinkStatus,
  NodeStatus,
  type PositionPoint,
  type SituationLink,
  type SituationNode,
} from "@/domain/topologyTypes";

export const NODE_ENTITY_PREFIX = "node:";
export const TRACK_ENTITY_PREFIX = "track:";
export const LINK_ENTITY_PREFIX = "link:";
const NODE_ICON_BASE_PIXEL_SIZE = 24;

// 根据节点信息创建节点点位 Entity 配置；无效坐标节点不渲染。
export function createNodeEntityOptions(
  node: SituationNode,
  selected = false,
): Entity.ConstructorOptions | null {
  if (!node.hasValidLocation) {
    return null;
  }

  const style = getNodeTypeStyle(node.type);
  const iconPixelSize = NODE_ICON_BASE_PIXEL_SIZE * appConfig.nodeIconScaleFactor;

  return {
    id: `${NODE_ENTITY_PREFIX}${node.id}`,
    name: style.name,
    show: true,
    position: Cartesian3.fromDegrees(
      node.longitude,
      node.latitude,
      node.height + style.heightOffset,
    ),
    billboard: {
      image: style.iconUri,
      width: iconPixelSize,
      height: iconPixelSize,
      scale: selected ? 1.18 : 1,
      color: node.status === NodeStatus.Online ? Color.WHITE : Color.fromCssColorString("#596579"),
      horizontalOrigin: HorizontalOrigin.CENTER,
      verticalOrigin: VerticalOrigin.BOTTOM,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    properties: {
      kind: "node",
      nodeId: node.id,
      node,
    },
  };
}

// 根据节点历史轨迹创建折线 Entity 配置，少于两个点时隐藏轨迹。
export function createTrackEntityOptions(
  node: SituationNode,
  history: readonly PositionPoint[],
): Entity.ConstructorOptions | null {
  if (!node.hasValidLocation) {
    return null;
  }

  const style = getNodeTypeStyle(node.type);
  const positions = history.map((point) =>
    Cartesian3.fromDegrees(
      point.longitude,
      point.latitude,
      point.height + style.heightOffset,
    ),
  );

  return {
    id: `${TRACK_ENTITY_PREFIX}${node.id}`,
    name: `${node.id} 历史轨迹`,
    show: positions.length >= 2,
    polyline: {
      positions,
      width: 1,
      material: new ColorMaterialProperty(
        Color.fromCssColorString(style.color),
      ),
    },
    properties: {
      kind: "track",
      nodeId: node.id,
    },
  };
}

// 根据活跃链路和端点节点创建绿色虚线 Entity 配置。
export function createLinkEntityOptions(
  link: SituationLink,
  nodeById: ReadonlyMap<string, SituationNode>,
): Entity.ConstructorOptions | null {
  if (link.status !== LinkStatus.Active) {
    return null;
  }

  const sourceNode = nodeById.get(link.sourceNodeId);
  const targetNode = nodeById.get(link.targetNodeId);
  if (
    sourceNode === undefined ||
    targetNode === undefined ||
    !sourceNode.hasValidLocation ||
    !targetNode.hasValidLocation
  ) {
    return null;
  }

  return {
    id: `${LINK_ENTITY_PREFIX}${link.id}`,
    name: `${link.sourceNodeId} -> ${link.targetNodeId}`,
    show: true,
    polyline: {
      positions: [
        Cartesian3.fromDegrees(
          sourceNode.longitude,
          sourceNode.latitude,
          sourceNode.height,
        ),
        Cartesian3.fromDegrees(
          targetNode.longitude,
          targetNode.latitude,
          targetNode.height,
        ),
      ],
      width: 1,
      material: new PolylineDashMaterialProperty({
        color: Color.LIME,
        dashLength: 16,
      }),
    },
    properties: {
      kind: "link",
      linkId: link.id,
      sourceNodeId: link.sourceNodeId,
      targetNodeId: link.targetNodeId,
    },
  };
}
