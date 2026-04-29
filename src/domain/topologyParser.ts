import {
  DRONE_NODE_TYPE,
  HANDHELD_BACKPACK_NODE_TYPE,
  LinkStatus,
  NodeStatus,
  type NormalizedTopology,
  type ParsedLocation,
  type RawTopologyLink,
  type RawTopologyNode,
  type SituationLink,
  type SituationNode,
  type TopologyResponse,
  type TopologyValidationWarning,
} from "./topologyTypes";

interface ParseNodeLocationOptions {
  hideZeroZero?: boolean;
}

const INVALID_LOCATION: ParsedLocation = {
  longitude: 0,
  latitude: 0,
  height: 0,
  hasValidLocation: false,
};
const DRONE_DEFAULT_HEIGHT = 100;
const DRONE_IP_ADDRESSES = buildDroneIpAddressSet([
  ["172.16.6", 11, 18],
  ["172.16.7", 20, 30],
  ["172.16.8", 32, 42],
  ["172.16.9", 44, 73],
]);
const HANDHELD_BACKPACK_IP_ADDRESSES = buildDroneIpAddressSet([
  ["172.16.6", 2, 8],
  ["172.16.9", 76, 83],
  ["172.16.9", 91, 105],
]);

// 解析节点经纬高字符串，缺省高度按 0 处理，非法坐标返回无效位置。
export function parseNodeLocation(
  nodeLocation: string | undefined,
  options: ParseNodeLocationOptions = {},
): ParsedLocation {
  const hideZeroZero = options.hideZeroZero ?? true;
  if (typeof nodeLocation !== "string" || nodeLocation.trim().length === 0) {
    return { ...INVALID_LOCATION };
  }

  const parts = nodeLocation.split(",").map((part) => part.trim());
  if (parts.length < 2 || parts.length > 3) {
    return { ...INVALID_LOCATION };
  }

  const longitude = Number(parts[0]);
  const latitude = Number(parts[1]);
  const height = parts[2] === undefined || parts[2] === "" ? 0 : Number(parts[2]);

  if (!isValidCoordinate(longitude, latitude, height)) {
    return { ...INVALID_LOCATION };
  }

  if (hideZeroZero && longitude === 0 && latitude === 0) {
    return { longitude, latitude, height, hasValidLocation: false };
  }

  return {
    longitude,
    latitude,
    height,
    hasValidLocation: true,
  };
}

// 将后端拓扑响应归一化为前端稳定模型，并生成可选校验告警。
export function normalizeTopologyResponse(response: TopologyResponse): NormalizedTopology {
  if (response.code !== 0) {
    return createEmptyTopology();
  }

  const rawNodes = Array.isArray(response.data?.topo?.node) ? response.data.topo.node : [];
  const rawLinks = Array.isArray(response.data?.topo?.link) ? response.data.topo.link : [];
  const nodes = rawNodes.map(normalizeNode).filter((node): node is SituationNode => node !== null);
  const links = rawLinks.map(normalizeLink).filter((link): link is SituationLink => link !== null);

  return {
    nodes,
    links,
    warnings: createSummaryWarnings(response, nodes.length, links.length),
  };
}

function normalizeNode(rawNode: RawTopologyNode): SituationNode | null {
  const nodeId = readNonEmptyString(rawNode.node_id);
  if (nodeId === null) {
    return null;
  }

  const ipAddress = readNonEmptyString(rawNode.node_manage_ip_addr) ?? "--";
  const nodeType = resolveNodeType(rawNode, ipAddress);
  const parsedLocation = normalizeNodeLocation(parseNodeLocation(rawNode.node_location), nodeType);

  return {
    id: nodeId,
    type: nodeType,
    status: rawNode.node_status === NodeStatus.Online ? NodeStatus.Online : NodeStatus.Offline,
    longitude: parsedLocation.longitude,
    latitude: parsedLocation.latitude,
    height: parsedLocation.height,
    ipAddress,
    raw: rawNode,
    hasValidLocation: parsedLocation.hasValidLocation,
  };
}

function normalizeLink(rawLink: RawTopologyLink): SituationLink | null {
  const sourceNodeId = readNonEmptyString(rawLink.src?.src_node);
  const targetNodeId = readNonEmptyString(rawLink.dst?.dst_node);
  if (sourceNodeId === null || targetNodeId === null) {
    return null;
  }

  return {
    id: readNonEmptyString(rawLink.link_id) ?? `${sourceNodeId}_${targetNodeId}`,
    status: rawLink.link_status === LinkStatus.Active ? LinkStatus.Active : LinkStatus.Offline,
    sourceNodeId,
    targetNodeId,
    raw: rawLink,
  };
}

function createSummaryWarnings(
  response: TopologyResponse,
  actualNodeCount: number,
  actualLinkCount: number,
): TopologyValidationWarning[] {
  const warnings: TopologyValidationWarning[] = [];

  if (
    typeof response.summary?.node_count === "number" &&
    response.summary.node_count !== actualNodeCount
  ) {
    warnings.push({
      type: "node_count_mismatch",
      expected: response.summary.node_count,
      actual: actualNodeCount,
    });
  }

  if (
    typeof response.summary?.link_count === "number" &&
    response.summary.link_count !== actualLinkCount
  ) {
    warnings.push({
      type: "link_count_mismatch",
      expected: response.summary.link_count,
      actual: actualLinkCount,
    });
  }

  return warnings;
}

function createEmptyTopology(): NormalizedTopology {
  return {
    nodes: [],
    links: [],
    warnings: [],
  };
}

// 根据节点 IP 判断是否属于特殊类型名单，优先匹配无人机，再匹配手持背负设备。
function resolveNodeType(rawNode: RawTopologyNode, ipAddress: string): number {
  if (isDroneIpAddress(ipAddress)) {
    return DRONE_NODE_TYPE;
  }

  if (isHandheldBackpackIpAddress(ipAddress)) {
    return HANDHELD_BACKPACK_NODE_TYPE;
  }

  return typeof rawNode.node_type === "number" ? rawNode.node_type : 0;
}

// 在归一化阶段补齐无人机默认高度，避免后续渲染层与轨迹层看到不同结果。
function normalizeNodeLocation(parsedLocation: ParsedLocation, nodeType: number): ParsedLocation {
  if (
    nodeType !== DRONE_NODE_TYPE ||
    !parsedLocation.hasValidLocation ||
    parsedLocation.height >= 1
  ) {
    return parsedLocation;
  }

  return {
    ...parsedLocation,
    height: DRONE_DEFAULT_HEIGHT,
  };
}

function isValidCoordinate(longitude: number, latitude: number, height: number): boolean {
  return (
    Number.isFinite(longitude) &&
    Number.isFinite(latitude) &&
    Number.isFinite(height) &&
    longitude >= -180 &&
    longitude <= 180 &&
    latitude >= -90 &&
    latitude <= 90
  );
}

function readNonEmptyString(value: string | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

// 判断 IP 是否命中硬编码的无人机白名单。
function isDroneIpAddress(ipAddress: string): boolean {
  return DRONE_IP_ADDRESSES.has(ipAddress);
}

// 判断 IP 是否命中硬编码的手持背负设备白名单。
function isHandheldBackpackIpAddress(ipAddress: string): boolean {
  return HANDHELD_BACKPACK_IP_ADDRESSES.has(ipAddress);
}

// 根据固定区间生成无人机 IP 白名单，保持规则集中且便于维护。
function buildDroneIpAddressSet(
  ipRanges: readonly [prefix: string, start: number, end: number][],
): Set<string> {
  const ipAddresses = new Set<string>();

  for (const [prefix, start, end] of ipRanges) {
    for (let suffix = start; suffix <= end; suffix += 1) {
      ipAddresses.add(`${prefix}.${suffix}`);
    }
  }

  return ipAddresses;
}
