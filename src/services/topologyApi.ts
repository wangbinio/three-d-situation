import type { TopologyResponse } from "@/domain/topologyTypes";

// 请求一次拓扑快照，返回后端原始响应，业务归一化由 store 负责。
export async function fetchTopologySnapshot(
  url: string,
  signal?: AbortSignal,
): Promise<TopologyResponse> {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`拓扑接口请求失败：HTTP ${response.status}`);
  }

  try {
    return (await response.json()) as TopologyResponse;
  } catch {
    throw new Error("拓扑接口响应不是有效 JSON");
  }
}
