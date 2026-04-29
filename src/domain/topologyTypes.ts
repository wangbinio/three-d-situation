export enum NodeStatus {
  Offline = 0,
  Online = 1,
}

export enum LinkStatus {
  Offline = 0,
  Active = 1,
}

export const DRONE_NODE_TYPE = 30;

export interface RawTopologySummary {
  node_count?: number;
  link_count?: number;
}

export interface RawTopologyNode {
  node_id?: string;
  node_type?: number;
  node_status?: number;
  node_location?: string;
  node_manage_ip_addr?: string;
  [key: string]: unknown;
}

export interface RawTopologyLinkEndpoint {
  src_node?: string;
  dst_node?: string;
  [key: string]: unknown;
}

export interface RawTopologyLink {
  link_id?: string;
  link_status?: number;
  src?: RawTopologyLinkEndpoint;
  dst?: RawTopologyLinkEndpoint;
  [key: string]: unknown;
}

export interface TopologyResponse {
  code: number;
  msg?: string;
  summary?: RawTopologySummary;
  data?: {
    topo?: {
      node?: RawTopologyNode[];
      link?: RawTopologyLink[];
    };
  };
}

export interface PositionPoint {
  longitude: number;
  latitude: number;
  height: number;
  timestamp: number;
}

export interface ParsedLocation {
  longitude: number;
  latitude: number;
  height: number;
  hasValidLocation: boolean;
}

export interface SituationNode {
  id: string;
  type: number;
  status: NodeStatus;
  longitude: number;
  latitude: number;
  height: number;
  ipAddress: string;
  raw: RawTopologyNode;
  hasValidLocation: boolean;
}

export interface SituationLink {
  id: string;
  status: LinkStatus;
  sourceNodeId: string;
  targetNodeId: string;
  raw: RawTopologyLink;
}

export interface TopologyValidationWarning {
  type: "node_count_mismatch" | "link_count_mismatch";
  expected: number;
  actual: number;
}

export interface NormalizedTopology {
  nodes: SituationNode[];
  links: SituationLink[];
  warnings: TopologyValidationWarning[];
}
