<script setup lang="ts">
import { computed, ref, watch } from "vue";

import NodeInfoCard from "@/components/NodeInfoCard.vue";
import OverlayConnector from "@/components/OverlayConnector.vue";
import { appConfig } from "@/config/appConfig";
import { useCesiumViewer } from "@/composables/useCesiumViewer";
import { useNodeSelection } from "@/composables/useNodeSelection";
import { useScreenOverlay } from "@/composables/useScreenOverlay";
import { useSituationScene } from "@/composables/useSituationScene";
import { useTileset } from "@/composables/useTileset";
import { useSituationStore } from "@/stores/situationStore";

const cesiumContainerRef = ref<HTMLElement | null>(null);
const situationStore = useSituationStore();
const { viewer, errorMessage: viewerErrorMessage } =
  useCesiumViewer(cesiumContainerRef);
const selectedNodeId = computed(() => situationStore.selectedNodeId);
const selectedNode = computed(() => situationStore.selectedNode);
const situationScene = useSituationScene(viewer, selectedNodeId);
const { visible, connectorLine, cardStyle, startDrag } = useScreenOverlay(
  viewer,
  selectedNode,
);
const {
  loading: tilesetLoading,
  errorMessage: tilesetErrorMessage,
  loadTileset,
} = useTileset();
let hasRequestedTileset = false;

useNodeSelection(viewer, situationStore.selectNode);

const mapStatusText = computed(() => {
  if (viewerErrorMessage.value !== null) {
    return `Cesium 初始化失败：${viewerErrorMessage.value}`;
  }

  if (tilesetErrorMessage.value !== null) {
    return `三维地图加载失败：${tilesetErrorMessage.value}`;
  }

  if (tilesetLoading.value) {
    return "三维地图加载中";
  }

  if (viewer.value === null) {
    return "三维地图初始化中";
  }

  return null;
});

watch(
  viewer,
  async (currentViewer) => {
    if (currentViewer === null || hasRequestedTileset) {
      return;
    }

    hasRequestedTileset = true;
    await loadTileset(currentViewer, appConfig.tilesetUrl);
  },
  { flush: "post", immediate: true },
);

watch(
  () =>
    [
      viewer.value,
      situationStore.nodeList,
      situationStore.linkList,
      situationStore.histories,
      situationStore.selectedNodeId,
      situationStore.hiddenNodeTypeList,
      situationStore.showHistories,
      situationStore.showLinks,
    ] as const,
  ([currentViewer]) => {
    if (currentViewer === null) {
      return;
    }

    situationScene.updateSituationScene({
      nodes: situationStore.nodeList,
      links: situationStore.linkList,
      histories: situationStore.histories,
      hiddenNodeTypes: new Set(situationStore.hiddenNodeTypeList),
      showHistories: situationStore.showHistories,
      showLinks: situationStore.showLinks,
    });
  },
  { flush: "post", immediate: true },
);
</script>

<template>
  <section
    class="situation-map"
    data-testid="situation-map"
    aria-label="三维地图容器"
  >
    <div
      ref="cesiumContainerRef"
      class="cesium-container"
      data-testid="cesium-container"
    />

    <div
      v-if="mapStatusText !== null"
      class="map-status"
      data-testid="map-status"
    >
      <div class="map-status__panel">
        <span class="map-status__eyebrow">Cesium Container</span>
        <strong>{{ mapStatusText }}</strong>
      </div>
    </div>

    <OverlayConnector :line="connectorLine" />

    <NodeInfoCard
      v-if="selectedNode !== null && visible"
      :node="selectedNode"
      :style="cardStyle"
      @close="situationStore.clearSelectedNode"
      @drag-start="startDrag"
    />
  </section>
</template>

<style scoped>
.situation-map {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background:
    linear-gradient(rgba(58, 146, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(58, 146, 255, 0.08) 1px, transparent 1px),
    radial-gradient(circle at 48% 42%, rgba(47, 102, 164, 0.78), #06101b 58%);
  background-size:
    48px 48px,
    48px 48px,
    auto;
}

.cesium-container {
  position: absolute;
  inset: 0;
  min-height: 100vh;
}

.cesium-container :global(.cesium-widget-credits) {
  display: none !important;
}

.map-status {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.map-status__panel {
  position: absolute;
  display: grid;
  min-width: min(560px, calc(100vw - 48px));
  padding: 32px;
  gap: 10px;
  border: 1px solid rgba(145, 190, 255, 0.28);
  border-radius: 28px;
  color: #d9eaff;
  background: rgba(6, 16, 27, 0.72);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.42);
  text-align: center;
  backdrop-filter: blur(18px);
}

.map-status__eyebrow {
  color: #7fddff;
  font-size: 12px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.map-status__panel strong {
  font-size: clamp(28px, 5vw, 56px);
  line-height: 1;
}

.map-status__panel span:last-child {
  color: #9eb6d7;
}
</style>
