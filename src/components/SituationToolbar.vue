<script setup lang="ts">
interface Props {
  nodeCount?: number;
  activeLinkCount?: number;
  lastUpdatedAt?: string;
  statusText?: string;
  showHistories?: boolean;
  showLinks?: boolean;
}

withDefaults(defineProps<Props>(), {
  nodeCount: 0,
  activeLinkCount: 0,
  lastUpdatedAt: "--",
  statusText: "待接入",
  showHistories: true,
  showLinks: true,
});

const emit = defineEmits<{
  "update:showHistories": [value: boolean];
  "update:showLinks": [value: boolean];
}>();

// 向父组件同步历史航迹复选框状态，后续阶段会接入 Cesium 实体显隐控制。
function emitHistoryCheckedState(event: Event) {
  emit("update:showHistories", (event.target as HTMLInputElement).checked);
}

// 向父组件同步链路复选框状态，后续阶段会接入 Cesium 实体显隐控制。
function emitLinkCheckedState(event: Event) {
  emit("update:showLinks", (event.target as HTMLInputElement).checked);
}
</script>

<template>
  <section class="situation-toolbar" data-testid="situation-toolbar" aria-label="态势状态栏">
    <dl class="situation-toolbar__metrics">
      <div>
        <dt>节点</dt>
        <dd data-testid="toolbar-node-count">{{ nodeCount }}</dd>
      </div>
      <div>
        <dt>活跃链路</dt>
        <dd data-testid="toolbar-link-count">{{ activeLinkCount }}</dd>
      </div>
      <div>
        <dt>更新时间</dt>
        <dd data-testid="toolbar-updated-at">{{ lastUpdatedAt }}</dd>
      </div>
      <div>
        <dt>接口状态</dt>
        <dd data-testid="toolbar-status">{{ statusText }}</dd>
      </div>
    </dl>

    <div class="situation-toolbar__toggles" aria-label="显示控制">
      <label class="situation-toolbar__toggle">
        <input
          type="checkbox"
          data-testid="toolbar-show-histories"
          :checked="showHistories"
          @change="emitHistoryCheckedState"
        />
        <span>历史航迹显示</span>
      </label>
      <label class="situation-toolbar__toggle">
        <input
          type="checkbox"
          data-testid="toolbar-show-links"
          :checked="showLinks"
          @change="emitLinkCheckedState"
        />
        <span>链路显示</span>
      </label>
    </div>
  </section>
</template>

<style scoped>
.situation-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  width: min(1120px, calc(100vw - 32px));
  padding: 12px 14px;
  border: 1px solid rgba(151, 199, 255, 0.2);
  border-radius: 20px;
  color: #e7f2ff;
  background: rgba(7, 17, 31, 0.74);
  box-shadow: 0 18px 54px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(16px);
}

.situation-toolbar__metrics {
  display: grid;
  flex: 1;
  grid-template-columns: repeat(4, minmax(86px, 1fr));
  gap: 12px;
  margin: 0;
}

.situation-toolbar__metrics div {
  min-width: 0;
}

.situation-toolbar dt {
  color: #88a9cf;
  font-size: 12px;
}

.situation-toolbar dd {
  margin: 4px 0 0;
  overflow: hidden;
  color: #f4f9ff;
  font-size: 18px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.situation-toolbar__toggles {
  display: flex;
  flex: 0 0 auto;
  gap: 14px;
  white-space: nowrap;
}

.situation-toolbar__toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #d7e8ff;
  font-size: 13px;
  cursor: pointer;
}

.situation-toolbar__toggle input {
  width: 14px;
  height: 14px;
  accent-color: #78e3ff;
}

@media (max-width: 860px) {
  .situation-toolbar {
    overflow-x: auto;
  }

  .situation-toolbar__metrics {
    min-width: 560px;
  }
}
</style>
