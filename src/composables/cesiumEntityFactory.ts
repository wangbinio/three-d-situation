import {
  Cartesian3,
  Color,
  ColorBlendMode,
  ColorMaterialProperty,
  CustomShader,
  Entity,
  HorizontalOrigin,
  PolylineDashMaterialProperty,
  UniformType,
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
const NODE_SELECTION_SCALE = 1.18;
const NODE_MODEL_COLOR_BLEND_AMOUNT = 0;
const OFFLINE_NODE_COLOR = Color.fromCssColorString("#596579");
const texturedModelShaderByBrightness = new Map<number, CustomShader>();

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
  const modelColor = resolveNodeModelColor(style.color, style.applyModelTint, node.status);
  const modelCustomShader = resolveNodeModelCustomShader(
    style.applyModelTint,
    style.brightnessBoost,
    node.status,
  );

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
      show: true,
      image: style.iconUri,
      width: iconPixelSize,
      height: iconPixelSize,
      scale: selected ? NODE_SELECTION_SCALE : 1,
      color: node.status === NodeStatus.Online ? Color.WHITE : OFFLINE_NODE_COLOR,
      horizontalOrigin: HorizontalOrigin.CENTER,
      verticalOrigin: VerticalOrigin.BOTTOM,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    properties: {
      kind: "node",
      nodeId: node.id,
      node,
    },
    model: {
      uri: style.modelUri,
      scale: style.scale * (selected ? NODE_SELECTION_SCALE : 1),
      minimumPixelSize: style.minimumPixelSize * appConfig.nodeIconScaleFactor,
      maximumScale: style.maximumScale * appConfig.nodeIconScaleFactor,
      lightColor: Color.WHITE,
      color: modelColor,
      customShader: modelCustomShader,
      ...resolveNodeModelBlendOptions(style.applyModelTint, node.status),
      show: true,
    },
  };
}

// 计算模型主色；贴图模型在线时保留原材质，仅在离线态统一压暗。
function resolveNodeModelColor(
  styleColor: string,
  applyModelTint: boolean,
  nodeStatus: NodeStatus,
): Color | undefined {
  if (nodeStatus !== NodeStatus.Online) {
    return OFFLINE_NODE_COLOR;
  }

  if (!applyModelTint) {
    return undefined;
  }

  return Color.fromCssColorString(styleColor);
}

// 计算模型颜色混合策略；纯几何模型保留明度层次，贴图模型避免被强行盖色。
function resolveNodeModelBlendOptions(
  applyModelTint: boolean,
  nodeStatus: NodeStatus,
): Partial<NonNullable<Entity.ConstructorOptions["model"]>> {
  if (nodeStatus !== NodeStatus.Online) {
    return {
      colorBlendMode: ColorBlendMode.HIGHLIGHT,
    };
  }

  if (!applyModelTint) {
    return {};
  }

  return {
    colorBlendMode: ColorBlendMode.MIX,
    colorBlendAmount: NODE_MODEL_COLOR_BLEND_AMOUNT,
  };
}

// 为贴图模型创建局部亮度增益，避免修改全局场景光照后拖黑 3D Tiles 底图。
function resolveNodeModelCustomShader(
  applyModelTint: boolean,
  brightnessBoost: number,
  nodeStatus: NodeStatus,
): CustomShader | undefined {
  if (applyModelTint || nodeStatus !== NodeStatus.Online || brightnessBoost <= 1) {
    return undefined;
  }

  let shader = texturedModelShaderByBrightness.get(brightnessBoost);
  if (shader !== undefined) {
    return shader;
  }

  shader = new CustomShader({
    uniforms: {
      u_brightnessBoost: {
        type: UniformType.FLOAT,
        value: brightnessBoost,
      },
    },
    fragmentShaderText: `
      void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
        material.diffuse = min(material.diffuse * u_brightnessBoost, vec3(1.0));
      }
    `,
  });
  texturedModelShaderByBrightness.set(brightnessBoost, shader);
  return shader;
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

  const sourceStyle = getNodeTypeStyle(sourceNode.type);
  const targetStyle = getNodeTypeStyle(targetNode.type);
  return {
    id: `${LINK_ENTITY_PREFIX}${link.id}`,
    name: `${link.sourceNodeId} -> ${link.targetNodeId}`,
    show: true,
    polyline: {
      positions: [
        Cartesian3.fromDegrees(
          sourceNode.longitude,
          sourceNode.latitude,
          sourceNode.height + sourceStyle.heightOffset + 1,
        ),
        Cartesian3.fromDegrees(
          targetNode.longitude,
          targetNode.latitude,
          targetNode.height + targetStyle.heightOffset + 1,
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
