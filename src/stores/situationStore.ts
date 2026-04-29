import { computed, ref } from "vue";
import { defineStore } from "pinia";

import { appConfig } from "@/config/appConfig";
import { appendHistoryPoint } from "@/domain/topologyHistory";
import { normalizeTopologyResponse } from "@/domain/topologyParser";
import {
  LinkStatus,
  type PositionPoint,
  type SituationLink,
  type SituationNode,
  type TopologyResponse,
  type TopologyValidationWarning,
} from "@/domain/topologyTypes";

export const useSituationStore = defineStore("situation", () => {
  const nodes = ref(new Map<string, SituationNode>());
  const links = ref(new Map<string, SituationLink>());
  const histories = ref(new Map<string, PositionPoint[]>());
  const selectedNodeId = ref<string | null>(null);
  const hiddenNodeTypes = ref(new Set<number>());
  const showHistories = ref(true);
  const showLinks = ref(true);
  const loading = ref(false);
  const lastUpdatedAt = ref<number | null>(null);
  const errorMessage = ref<string | null>(null);
  const warnings = ref<TopologyValidationWarning[]>([]);

  const nodeList = computed(() => Array.from(nodes.value.values()));
  const linkList = computed(() => Array.from(links.value.values()));
  const activeLinkList = computed(() =>
    linkList.value.filter((link) => link.status === LinkStatus.Active),
  );
  const hiddenNodeTypeList = computed(() => Array.from(hiddenNodeTypes.value));
  const selectedNode = computed(() => {
    if (selectedNodeId.value === null) {
      return null;
    }

    return nodes.value.get(selectedNodeId.value) ?? null;
  });

  // 标记拓扑请求开始，用于页面展示加载状态。
  function startLoading() {
    loading.value = true;
    errorMessage.value = null;
  }

  // 应用一次拓扑快照，保留归一化后的节点、链路和轨迹。
  function applyTopologyResponse(response: TopologyResponse, timestamp: number = Date.now()) {
    const normalizedTopology = normalizeTopologyResponse(response);

    nodes.value = new Map(normalizedTopology.nodes.map((node) => [node.id, node]));
    links.value = new Map(normalizedTopology.links.map((link) => [link.id, link]));
    histories.value = updateHistories(histories.value, normalizedTopology.nodes, timestamp);
    warnings.value = normalizedTopology.warnings;
    loading.value = false;
    errorMessage.value = null;
    lastUpdatedAt.value = timestamp;

    if (selectedNodeId.value !== null && !nodes.value.has(selectedNodeId.value)) {
      selectedNodeId.value = null;
    }
  }

  // 记录请求失败状态，同时保留上一轮有效态势数据。
  function applyError(error: unknown) {
    loading.value = false;
    errorMessage.value = error instanceof Error ? error.message : String(error);
  }

  // 选中指定节点，用于后续标牌和高亮逻辑。
  function selectNode(nodeId: string) {
    selectedNodeId.value = nodeId;
  }

  // 清空当前选中节点。
  function clearSelectedNode() {
    selectedNodeId.value = null;
  }

  // 切换指定节点类型的显示状态。
  function toggleNodeTypeVisibility(nodeType: number) {
    const nextHiddenNodeTypes = new Set(hiddenNodeTypes.value);
    if (nextHiddenNodeTypes.has(nodeType)) {
      nextHiddenNodeTypes.delete(nodeType);
    } else {
      nextHiddenNodeTypes.add(nodeType);
    }

    hiddenNodeTypes.value = nextHiddenNodeTypes;
  }

  // 设置历史航迹显示状态，只影响显示，不清空历史数据。
  function setShowHistories(value: boolean) {
    showHistories.value = value;
  }

  // 设置链路显示状态，只影响显示，不清空链路数据。
  function setShowLinks(value: boolean) {
    showLinks.value = value;
  }

  return {
    nodes,
    links,
    histories,
    selectedNodeId,
    hiddenNodeTypes,
    showHistories,
    showLinks,
    loading,
    lastUpdatedAt,
    errorMessage,
    warnings,
    nodeList,
    linkList,
    activeLinkList,
    hiddenNodeTypeList,
    selectedNode,
    startLoading,
    applyTopologyResponse,
    applyError,
    selectNode,
    clearSelectedNode,
    toggleNodeTypeVisibility,
    setShowHistories,
    setShowLinks,
  };
});

function updateHistories(
  currentHistories: ReadonlyMap<string, PositionPoint[]>,
  nodes: readonly SituationNode[],
  timestamp: number,
): Map<string, PositionPoint[]> {
  const nextHistories = new Map(currentHistories);

  for (const node of nodes) {
    const currentHistory = nextHistories.get(node.id) ?? [];
    nextHistories.set(
      node.id,
      appendHistoryPoint(currentHistory, node, appConfig.historyMaxPoints, timestamp),
    );
  }

  return nextHistories;
}
