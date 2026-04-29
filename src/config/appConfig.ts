const DEFAULT_TILESET_URL = "http://192.168.233.1:8080/3DTILES/tileset.json";
const DEFAULT_TOPOLOGY_URL =
  "http://192.168.2.1:8000/api/v1/network/topology/query?online_nodes_only=true&active_links_only=false&exclude_class_I=false&exclude_class_III=false&with_summary=true";
const DEFAULT_POLL_INTERVAL_MS = 5000;
const DEFAULT_HISTORY_MAX_POINTS = 720;
const DEFAULT_NODE_ICON_SCALE_FACTOR = 2;
const MIN_POLL_INTERVAL_MS = 1000;

export interface AppConfig {
  tilesetUrl: string;
  topologyUrl: string;
  pollIntervalMs: number;
  historyMaxPoints: number;
  nodeIconScaleFactor: number;
  hideInvalidCoordinate: boolean;
}

export type AppConfigEnv = Partial<
  Record<
    | "VITE_TILESET_URL"
    | "VITE_TOPOLOGY_URL"
    | "VITE_TOPOLOGY_POLL_INTERVAL_MS"
    | "VITE_HISTORY_MAX_POINTS"
    | "VITE_NODE_ICON_SCALE_FACTOR"
    | "VITE_HIDE_INVALID_COORDINATE",
    string | boolean | undefined
  >
>;

// 解析运行时配置，保证业务代码拿到的是已归一化的稳定配置。
export function parseAppConfig(env: AppConfigEnv = {}): AppConfig {
  return {
    tilesetUrl: readString(env.VITE_TILESET_URL, DEFAULT_TILESET_URL),
    topologyUrl: readString(env.VITE_TOPOLOGY_URL, DEFAULT_TOPOLOGY_URL),
    pollIntervalMs: readNumber(
      env.VITE_TOPOLOGY_POLL_INTERVAL_MS,
      DEFAULT_POLL_INTERVAL_MS,
      MIN_POLL_INTERVAL_MS,
    ),
    historyMaxPoints: readNumber(
      env.VITE_HISTORY_MAX_POINTS,
      DEFAULT_HISTORY_MAX_POINTS,
      1,
    ),
    nodeIconScaleFactor: readPositiveFloat(
      env.VITE_NODE_ICON_SCALE_FACTOR,
      DEFAULT_NODE_ICON_SCALE_FACTOR,
    ),
    hideInvalidCoordinate: readBoolean(env.VITE_HIDE_INVALID_COORDINATE, true),
  };
}

export const appConfig = parseAppConfig({
  VITE_TILESET_URL: import.meta.env.VITE_TILESET_URL,
  VITE_TOPOLOGY_URL: import.meta.env.VITE_TOPOLOGY_URL,
  VITE_TOPOLOGY_POLL_INTERVAL_MS: import.meta.env.VITE_TOPOLOGY_POLL_INTERVAL_MS,
  VITE_HISTORY_MAX_POINTS: import.meta.env.VITE_HISTORY_MAX_POINTS,
  VITE_NODE_ICON_SCALE_FACTOR: import.meta.env.VITE_NODE_ICON_SCALE_FACTOR,
  VITE_HIDE_INVALID_COORDINATE: import.meta.env.VITE_HIDE_INVALID_COORDINATE,
});

// 读取字符串配置，空字符串按默认值处理。
function readString(value: string | boolean | undefined, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : fallback;
}

// 读取正整数配置，小于最小值或无法解析时回退到默认值。
function readNumber(
  value: string | boolean | undefined,
  fallback: number,
  minValue: number,
): number {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue) || parsedValue < minValue) {
    return fallback;
  }

  return Math.floor(parsedValue);
}

// 读取正浮点配置，小于等于 0 或无法解析时回退到默认值。
function readPositiveFloat(value: string | boolean | undefined, fallback: number): number {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
}

// 读取布尔配置，仅接受 true 和 false 字符串，其他值回退到默认值。
function readBoolean(value: string | boolean | undefined, fallback: boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return fallback;
  }

  const normalizedValue = value.trim().toLowerCase();
  if (normalizedValue === "true") {
    return true;
  }

  if (normalizedValue === "false") {
    return false;
  }

  return fallback;
}
