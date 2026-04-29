import {
  computed,
  onScopeDispose,
  ref,
  watch,
  type CSSProperties,
  type Ref,
} from "vue";
import { Cartesian3, SceneTransforms, type Viewer } from "cesium";

import { getNodeTypeStyle } from "@/config/nodeTypeStyle";
import type { SituationNode } from "@/domain/topologyTypes";

export interface ScreenPoint {
  x: number;
  y: number;
}

export interface OverlayConnectorLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

const DEFAULT_CARD_OFFSET: ScreenPoint = {
  x: 36,
  y: -160,
};

const CARD_SIZE = {
  width: 320,
  height: 196,
};

// 管理节点屏幕投影、标牌拖动偏移和 SVG 连接线端点。
export function useScreenOverlay(
  viewerRef: Ref<Viewer | null>,
  selectedNodeRef: Ref<SituationNode | null>,
) {
  const anchorPoint = ref<ScreenPoint | null>(null);
  const cardPoint = ref<ScreenPoint | null>(null);
  const visible = ref(false);
  const offset = ref<ScreenPoint>({ ...DEFAULT_CARD_OFFSET });
  let activeViewer: Viewer | null = null;
  let dragCleanup: (() => void) | null = null;

  const connectorLine = computed<OverlayConnectorLine | null>(() => {
    const anchor = anchorPoint.value;
    const card = cardPoint.value;
    const node = selectedNodeRef.value;

    if (!visible.value || anchor === null || card === null || node === null) {
      return null;
    }

    const endPoint = resolveCardEdgePoint(anchor, card, CARD_SIZE);

    return {
      x1: anchor.x,
      y1: anchor.y,
      x2: endPoint.x,
      y2: endPoint.y,
      color: getNodeTypeStyle(node.type).color,
    };
  });

  const cardStyle = computed<CSSProperties>(() => {
    if (cardPoint.value === null) {
      return {
        transform: "translate3d(-9999px, -9999px, 0)",
      };
    }

    return {
      transform: `translate3d(${cardPoint.value.x}px, ${cardPoint.value.y}px, 0)`,
    };
  });

  const stopViewerWatch = watch(
    viewerRef,
    (viewer) => {
      detachPostRender();
      activeViewer = viewer;

      if (viewer !== null) {
        viewer.scene.postRender.addEventListener(syncOverlay);
        syncOverlay();
      }
    },
    { immediate: true, flush: "post" },
  );

  const stopNodeWatch = watch(
    selectedNodeRef,
    () => {
      resetOffset();
      syncOverlay();
    },
    { flush: "post" },
  );

  onScopeDispose(() => {
    stopViewerWatch();
    stopNodeWatch();
    detachPostRender();
    cleanupDrag();
  });

  // 处理标牌拖动起点，拖动过程只更新偏移量，不修改节点位置。
  function startDrag(event: PointerEvent) {
    event.preventDefault();
    event.stopPropagation();

    cleanupDrag();

    const startClientPoint = {
      x: event.clientX,
      y: event.clientY,
    };
    const startOffset = { ...offset.value };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      offset.value = {
        x: startOffset.x + moveEvent.clientX - startClientPoint.x,
        y: startOffset.y + moveEvent.clientY - startClientPoint.y,
      };
      syncOverlay();
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      upEvent.preventDefault();
      upEvent.stopPropagation();
      cleanupDrag();
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    dragCleanup = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }

  // 根据当前相机状态同步节点锚点、标牌位置和可见性。
  function syncOverlay() {
    const viewer = activeViewer;
    const node = selectedNodeRef.value;

    if (viewer === null || node === null || !node.hasValidLocation) {
      hideOverlay();
      return;
    }

    const nextAnchor = projectNodeToScreen(viewer, node);

    if (nextAnchor === null) {
      hideOverlay();
      return;
    }

    anchorPoint.value = nextAnchor;
    cardPoint.value = {
      x: nextAnchor.x + offset.value.x,
      y: nextAnchor.y + offset.value.y,
    };
    visible.value = true;
  }

  // 恢复默认标牌偏移，确保切换节点时不沿用上一次拖动状态。
  function resetOffset() {
    offset.value = { ...DEFAULT_CARD_OFFSET };
  }

  return {
    anchorPoint,
    cardPoint,
    visible,
    connectorLine,
    cardStyle,
    startDrag,
    syncOverlay,
    resetOffset,
  };

  // 解绑 Viewer postRender 监听，避免切换 Viewer 或卸载时残留回调。
  function detachPostRender() {
    if (activeViewer !== null) {
      activeViewer.scene.postRender.removeEventListener(syncOverlay);
      activeViewer = null;
    }
  }

  // 清理拖动期间挂到 window 上的指针事件。
  function cleanupDrag() {
    if (dragCleanup !== null) {
      dragCleanup();
      dragCleanup = null;
    }
  }

  // 隐藏标牌和连接线，并清空上一帧屏幕坐标。
  function hideOverlay() {
    anchorPoint.value = null;
    cardPoint.value = null;
    visible.value = false;
  }
}

// 把节点经纬高转换成 Viewer 画布坐标；投影失败时返回空值。
export function projectNodeToScreen(
  viewer: Viewer,
  node: SituationNode,
): ScreenPoint | null {
  const worldPosition = Cartesian3.fromDegrees(
    node.longitude,
    node.latitude,
    node.height,
  );
  const windowPosition = SceneTransforms.worldToWindowCoordinates(
    viewer.scene,
    worldPosition,
  );

  if (
    windowPosition === undefined ||
    !Number.isFinite(windowPosition.x) ||
    !Number.isFinite(windowPosition.y)
  ) {
    return null;
  }

  return {
    x: windowPosition.x,
    y: windowPosition.y,
  };
}

// 根据节点和标牌相对位置，计算连接线落到标牌边缘的终点。
function resolveCardEdgePoint(
  anchor: ScreenPoint,
  card: ScreenPoint,
  cardSize: typeof CARD_SIZE,
): ScreenPoint {
  const cardCenter = {
    x: card.x + cardSize.width / 2,
    y: card.y + cardSize.height / 2,
  };
  const endX = cardCenter.x >= anchor.x ? card.x : card.x + cardSize.width;

  return {
    x: endX,
    y: Math.min(Math.max(anchor.y, card.y), card.y + cardSize.height),
  };
}
