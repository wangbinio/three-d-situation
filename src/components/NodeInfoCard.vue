<script setup lang="ts">
import { computed } from "vue";

import { getNodeTypeStyle } from "@/config/nodeTypeStyle";
import { NodeStatus, type SituationNode } from "@/domain/topologyTypes";

const props = defineProps<{
  node: SituationNode;
}>();

const emit = defineEmits<{
  close: [];
  "drag-start": [event: PointerEvent];
}>();

const nodeTypeStyle = computed(() => getNodeTypeStyle(props.node.type));
const statusText = computed(() =>
  props.node.status === NodeStatus.Online ? "在线" : "离线",
);
const statusClass = computed(() =>
  props.node.status === NodeStatus.Online
    ? "node-info-card__status--online"
    : "node-info-card__status--offline",
);
const shortNodeId = computed(() => {
  if (props.node.id.length <= 20) {
    return props.node.id;
  }

  return `${props.node.id.slice(0, 8)}...${props.node.id.slice(-8)}`;
});
const positionText = computed(
  () =>
    `${props.node.longitude.toFixed(6)}, ${props.node.latitude.toFixed(6)}, ${props.node.height.toFixed(1)}m`,
);
const ipAddressText = computed(() => props.node.ipAddress || "--");
const accentStyle = computed(() => ({
  "--node-accent": nodeTypeStyle.value.color,
}));

// 转发拖动起点给父级 overlay 逻辑，避免标牌拖动影响 Cesium 相机。
function handlePointerDown(event: PointerEvent) {
  emit("drag-start", event);
}

// 关闭当前标牌。
function handleClose() {
  emit("close");
}
</script>

<template>
  <article
    class="node-info-card"
    data-testid="node-info-card"
    :style="accentStyle"
    @pointerdown.prevent.stop="handlePointerDown"
    @contextmenu.prevent.stop="handleClose"
  >
    <header class="node-info-card__header">
      <div>
        <h2 data-testid="node-card-id" :title="node.id">{{ shortNodeId }}</h2>
      </div>

      <button
        type="button"
        class="node-info-card__close"
        data-testid="node-card-close"
        aria-label="关闭节点信息标牌"
        @pointerdown.stop
        @click.stop="handleClose"
      >
        ×
      </button>
    </header>

    <dl class="node-info-card__grid">
      <div>
        <dt>类型</dt>
        <dd data-testid="node-card-type">
          {{ nodeTypeStyle.name }}
        </dd>
      </div>

      <div>
        <dt>状态</dt>
        <dd data-testid="node-card-status">
          <span class="node-info-card__status" :class="statusClass" />
          {{ statusText }}
        </dd>
      </div>

      <div>
        <dt>位置</dt>
        <dd data-testid="node-card-position">{{ positionText }}</dd>
      </div>

      <div>
        <dt>IP</dt>
        <dd data-testid="node-card-ip">{{ ipAddressText }}</dd>
      </div>
    </dl>
  </article>
</template>

<style scoped>
.node-info-card {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 5;
  width: min(320px, calc(100vw - 32px));
  padding: 18px;
  border: 1px solid
    color-mix(in srgb, var(--node-accent) 58%, rgba(255, 255, 255, 0.12));
  border-radius: 22px;
  color: #eaf4ff;
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--node-accent) 18%, transparent),
      transparent 45%
    ),
    rgba(6, 16, 27, 0.86);
  box-shadow:
    0 18px 48px rgba(0, 0, 0, 0.42),
    0 0 28px color-mix(in srgb, var(--node-accent) 20%, transparent);
  cursor: grab;
  backdrop-filter: blur(18px);
  user-select: none;
}

.node-info-card:active {
  cursor: grabbing;
}

.node-info-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.node-info-card__eyebrow {
  color: var(--node-accent);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.node-info-card h2 {
  margin: 6px 0 0;
  font-size: 20px;
  line-height: 1.1;
}

.node-info-card__close {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  color: #eaf4ff;
  background: rgba(255, 255, 255, 0.08);
  cursor: pointer;
}

.node-info-card__close:hover {
  border-color: var(--node-accent);
  color: var(--node-accent);
}

.node-info-card__grid {
  display: grid;
  margin: 18px 0 0;
  gap: 10px;
}

.node-info-card__grid div {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 14px;
  align-items: center;
}

.node-info-card__grid dt {
  color: #88a5c7;
  font-size: 12px;
}

.node-info-card__grid dd {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
  font-size: 13px;
}

.node-info-card__status {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 8px;
  border-radius: 999px;
}

.node-info-card__status--online {
  background: #00e676;
  box-shadow: 0 0 12px rgba(0, 230, 118, 0.72);
}

.node-info-card__status--offline {
  background: #ff5252;
  box-shadow: 0 0 12px rgba(255, 82, 82, 0.72);
}
</style>
