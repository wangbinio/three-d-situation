<script setup lang="ts">
import type { OverlayConnectorLine } from "@/composables/useScreenOverlay";

defineProps<{
  line: OverlayConnectorLine | null;
}>();
</script>

<template>
  <svg
    class="overlay-connector"
    data-testid="overlay-connector"
    aria-hidden="true"
  >
    <line
      v-if="line !== null"
      :x1="line.x1"
      :y1="line.y1"
      :x2="line.x2"
      :y2="line.y2"
      :stroke="line.color"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
</template>

<style scoped>
.overlay-connector {
  position: absolute;
  inset: 0;
  z-index: 4;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}
</style>
