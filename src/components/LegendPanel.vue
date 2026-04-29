<script setup lang="ts">
import { computed } from "vue";

import { NODE_TYPE_STYLES } from "@/config/nodeTypeStyle";

const props = withDefaults(
  defineProps<{
    hiddenNodeTypes?: readonly number[];
  }>(),
  {
    hiddenNodeTypes: () => [],
  },
);

const emit = defineEmits<{
  toggleNodeType: [nodeType: number];
}>();

const hiddenNodeTypeSet = computed(() => new Set(props.hiddenNodeTypes));

// 判断图例项是否处于隐藏状态，用于同步按钮状态和样式。
function isHiddenNodeType(nodeType: number): boolean {
  return hiddenNodeTypeSet.value.has(nodeType);
}
</script>

<template>
  <aside class="legend-panel" data-testid="legend-panel" aria-label="目标类型图例">
    <ul class="legend-panel__list">
      <li v-for="style in NODE_TYPE_STYLES" :key="style.type">
        <button
          class="legend-panel__item"
          type="button"
          data-testid="legend-item"
          :class="{ 'legend-panel__item--hidden': isHiddenNodeType(style.type) }"
          :aria-pressed="!isHiddenNodeType(style.type)"
          @click="emit('toggleNodeType', style.type)"
        >
          <img
            class="legend-panel__icon"
            :src="style.iconUri"
            :alt="style.shape"
            loading="lazy"
          />
          <span class="legend-panel__separator" aria-hidden="true">-</span>
          <span class="legend-panel__name">{{ style.name }}</span>
        </button>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.legend-panel {
  width: min(220px, calc(100vw - 32px));
  padding: 12px;
  border: 1px solid rgba(162, 205, 255, 0.22);
  border-radius: 22px;
  color: #e8f3ff;
  background: rgba(7, 17, 31, 0.76);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(16px);
}

.legend-panel__list {
  display: grid;
  gap: 8px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.legend-panel__item {
  display: grid;
  width: 100%;
  border: 0;
  grid-template-columns: 30px 12px 1fr;
  gap: 8px;
  align-items: center;
  padding: 4px 0;
  color: #d7e8ff;
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.legend-panel__item--hidden {
  opacity: 0.38;
}

.legend-panel__icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
  filter: drop-shadow(0 0 10px rgba(126, 225, 255, 0.35));
}

.legend-panel__separator {
  color: #6f8eb4;
}

.legend-panel__name {
  overflow: hidden;
  color: #c2d7f0;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
