import {
  DRONE_NODE_TYPE,
  HANDHELD_BACKPACK_NODE_TYPE,
} from "@/domain/topologyTypes";

export interface NodeTypeStyle {
  type: number;
  name: string;
  shape: string;
  color: string;
  modelUri: string;
  iconUri: string;
  legendText: string;
  applyModelTint: boolean;
  brightnessBoost: number;
  scale: number;
  minimumPixelSize: number;
  maximumScale: number;
  heightOffset: number;
}

const NODE_ICON_BASE_PATH = "/models/node-icons";
const NODE_SVG_ICON_BASE_PATH = `${NODE_ICON_BASE_PATH}/svg`;

export const UNKNOWN_NODE_TYPE_STYLE: NodeTypeStyle = {
  type: 0,
  name: "未知类型",
  shape: "未知问号",
  color: "#9e9e9e",
  modelUri: `${NODE_ICON_BASE_PATH}/未知类型.glb`,
  iconUri: `${NODE_SVG_ICON_BASE_PATH}/未知类型.svg`,
  legendText: "未知问号-未知类型",
  applyModelTint: true,
  brightnessBoost: 1,
  scale: 0.5,
  minimumPixelSize: 14,
  maximumScale: 60,
  heightOffset: 2,
};

export const NODE_TYPE_STYLES: readonly NodeTypeStyle[] = [
  {
    type: 1,
    name: "一类设备终端",
    shape: "终端点",
    color: "#21d4fd",
    modelUri: `${NODE_ICON_BASE_PATH}/一类设备终端.glb`,
    iconUri: `${NODE_SVG_ICON_BASE_PATH}/一类设备终端.svg`,
    legendText: "终端点-一类设备终端",
    applyModelTint: false,
    brightnessBoost: 1.35,
    scale: 1,
    minimumPixelSize: 14,
    maximumScale: 60,
    heightOffset: 2,
  },
  {
    type: 2,
    name: "一类设备簇头",
    shape: "簇头分支",
    color: "#00c853",
    modelUri: `${NODE_ICON_BASE_PATH}/一类设备簇头.glb`,
    iconUri: `${NODE_SVG_ICON_BASE_PATH}/一类设备簇头.svg`,
    legendText: "簇头分支-一类设备簇头",
    applyModelTint: true,
    brightnessBoost: 1,
    scale: 5,
    minimumPixelSize: 15,
    maximumScale: 65,
    heightOffset: 2,
  },
  {
    type: 3,
    name: "二类设备车载",
    shape: "车辆轮廓",
    color: "#ffb300",
    modelUri: `${NODE_ICON_BASE_PATH}/车.glb`,
    iconUri: `${NODE_SVG_ICON_BASE_PATH}/二类设备车载.svg`,
    legendText: "车辆轮廓-二类设备车载",
    applyModelTint: false,
    brightnessBoost: 1.35,
    scale: 1,
    minimumPixelSize: 15,
    maximumScale: 65,
    heightOffset: 2,
  },
  {
    type: 4,
    name: "二类设备接入",
    shape: "接入插口",
    color: "#ff7043",
    modelUri: `${NODE_ICON_BASE_PATH}/二类设备接入.glb`,
    iconUri: `${NODE_SVG_ICON_BASE_PATH}/二类设备接入.svg`,
    legendText: "接入插口-二类设备接入",
    applyModelTint: true,
    brightnessBoost: 1,
    scale: 1,
    minimumPixelSize: 15,
    maximumScale: 65,
    heightOffset: 2,
  },
  {
    type: 5,
    name: "二类设备骨干",
    shape: "骨干网格",
    color: "#7e57c2",
    modelUri: `${NODE_ICON_BASE_PATH}/二类设备骨干.glb`,
    iconUri: `${NODE_SVG_ICON_BASE_PATH}/二类设备骨干.svg`,
    legendText: "骨干网格-二类设备骨干",
    applyModelTint: true,
    brightnessBoost: 1,
    scale: 1,
    minimumPixelSize: 17,
    maximumScale: 75,
    heightOffset: 2,
  },
  {
    type: 6,
    name: "Ⅳ类设备网关",
    shape: "网关门形",
    color: "#26a69a",
    modelUri: `${NODE_ICON_BASE_PATH}/Ⅳ类设备网关.glb`,
    iconUri: `${NODE_SVG_ICON_BASE_PATH}/Ⅳ类设备网关.svg`,
    legendText: "网关门形-Ⅳ类设备网关",
    applyModelTint: true,
    brightnessBoost: 1,
    scale: 8,
    minimumPixelSize: 17,
    maximumScale: 75,
    heightOffset: 2,
  },
  {
    type: 7,
    name: "二类设备台式机",
    shape: "显示器",
    color: "#5c6bc0",
    modelUri: `${NODE_ICON_BASE_PATH}/二类设备台式机.glb`,
    iconUri: `${NODE_SVG_ICON_BASE_PATH}/二类设备台式机.svg`,
    legendText: "显示器-二类设备台式机",
    applyModelTint: true,
    brightnessBoost: 1,
    scale: 1,
    minimumPixelSize: 15,
    maximumScale: 65,
    heightOffset: 2,
  },
  {
    type: 8,
    name: "III类设备",
    shape: "菱形警示",
    color: "#ef5350",
    modelUri: `${NODE_ICON_BASE_PATH}/III类设备.glb`,
    iconUri: `${NODE_SVG_ICON_BASE_PATH}/III类设备.svg`,
    legendText: "菱形警示-III类设备",
    applyModelTint: true,
    brightnessBoost: 1,
    scale: 3,
    minimumPixelSize: 15,
    maximumScale: 65,
    heightOffset: 2,
  },
  {
    type: DRONE_NODE_TYPE,
    name: "无人机",
    shape: "旋翼无人机",
    color: "#00e5ff",
    modelUri: `${NODE_ICON_BASE_PATH}/无人机.glb`,
    iconUri: `${NODE_SVG_ICON_BASE_PATH}/无人机.svg`,
    legendText: "旋翼无人机-无人机",
    applyModelTint: false,
    brightnessBoost: 1.2,
    scale: 1,
    minimumPixelSize: 17,
    maximumScale: 75,
    heightOffset: 2,
  },
  {
    type: HANDHELD_BACKPACK_NODE_TYPE,
    name: "手持背负设备",
    shape: "人形",
    color: "#0e932e",
    modelUri: `${NODE_ICON_BASE_PATH}/人.glb`,
    iconUri: `${NODE_SVG_ICON_BASE_PATH}/手持背负.svg`,
    legendText: "人形-手持背负设备",
    applyModelTint: false,
    brightnessBoost: 1.35,
    scale: 1,
    minimumPixelSize: 15,
    maximumScale: 65,
    heightOffset: 2,
  },
];

export const DRONE_NODE_TYPE_STYLE = NODE_TYPE_STYLES.find(
  (style) => style.type === DRONE_NODE_TYPE,
)!;
export const HANDHELD_BACKPACK_NODE_TYPE_STYLE = NODE_TYPE_STYLES.find(
  (style) => style.type === HANDHELD_BACKPACK_NODE_TYPE,
)!;

const nodeTypeStyleMap = new Map(
  NODE_TYPE_STYLES.map((nodeTypeStyle) => [nodeTypeStyle.type, nodeTypeStyle]),
);

// 根据节点类型获取展示样式，未知类型统一返回兜底样式。
export function getNodeTypeStyle(nodeType: number): NodeTypeStyle {
  return nodeTypeStyleMap.get(nodeType) ?? UNKNOWN_NODE_TYPE_STYLE;
}
