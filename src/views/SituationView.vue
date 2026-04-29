<script setup lang="ts">
import { computed } from "vue";

import { appConfig } from "@/config/appConfig";
import LegendPanel from "@/components/LegendPanel.vue";
import SituationMap from "@/components/SituationMap.vue";
import SituationToolbar from "@/components/SituationToolbar.vue";
import { useTopologyPolling } from "@/composables/useTopologyPolling";
import { useSituationStore } from "@/stores/situationStore";

const situationStore = useSituationStore();
useTopologyPolling({
  url: appConfig.topologyUrl,
  intervalMs: appConfig.pollIntervalMs,
  onBeforeRequest: situationStore.startLoading,
  onSnapshot: situationStore.applyTopologyResponse,
  onError: situationStore.applyError,
});

const toolbarStatusText = computed(() => {
  if (situationStore.loading) {
    return "请求中";
  }

  if (situationStore.errorMessage !== null) {
    return situationStore.errorMessage;
  }

  if (situationStore.lastUpdatedAt !== null) {
    return "已更新";
  }

  return "等待数据";
});

const toolbarLastUpdatedAt = computed(() => {
  if (situationStore.lastUpdatedAt === null) {
    return "--";
  }

  return new Date(situationStore.lastUpdatedAt).toLocaleString("zh-CN", {
    hour12: false,
  });
});
</script>

<template>
  <main class="situation-page" data-testid="situation-page">
    <SituationMap />

    <div class="situation-page__overlay" data-testid="situation-overlay">
      <div class="situation-page__topline">
        <LegendPanel
          :hidden-node-types="situationStore.hiddenNodeTypeList"
          @toggle-node-type="situationStore.toggleNodeTypeVisibility"
        />
      </div>

      <div class="situation-page__bottomline">
        <SituationToolbar
          :node-count="situationStore.nodeList.length"
          :active-link-count="situationStore.activeLinkList.length"
          :last-updated-at="toolbarLastUpdatedAt"
          :status-text="toolbarStatusText"
          :show-histories="situationStore.showHistories"
          :show-links="situationStore.showLinks"
          @update:show-histories="situationStore.setShowHistories"
          @update:show-links="situationStore.setShowLinks"
        />
      </div>
    </div>
  </main>
</template>

<style scoped>
.situation-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  color: #eaf4ff;
  background: #06101b;
}

.situation-page__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;
  pointer-events: none;
}

.situation-page__topline,
.situation-page__bottomline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.situation-page__topline {
  justify-content: flex-end;
}

.situation-page__bottomline {
  align-items: flex-end;
}

.situation-page__topline > *,
.situation-page__bottomline > * {
  pointer-events: auto;
}

@media (max-width: 860px) {
  .situation-page__overlay {
    padding: 16px;
  }
}
</style>
