import { onScopeDispose, watch, type Ref } from "vue";
import {
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  type Cartesian2,
  type Viewer,
} from "cesium";

import { NODE_ENTITY_PREFIX } from "./cesiumEntityFactory";

type SelectNodeCallback = (nodeId: string) => void;

interface PickedEntityLike {
  id?: string;
  properties?: unknown;
}

interface PickedObjectLike {
  id?: PickedEntityLike | string;
}

// 监听 Cesium 场景点击事件，并把命中的节点 Entity 转换为业务节点选择。
export function useNodeSelection(
  viewerRef: Ref<Viewer | null>,
  onSelectNode: SelectNodeCallback,
) {
  let handler: ScreenSpaceEventHandler | null = null;

  const stopViewerWatch = watch(
    viewerRef,
    (viewer) => {
      destroyHandler();

      if (viewer === null) {
        return;
      }

      handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction((movement: { position: Cartesian2 }) => {
        const pickedObject = viewer.scene.pick(movement.position) as
          | PickedObjectLike
          | undefined;
        const nodeId = resolvePickedNodeId(pickedObject);

        if (nodeId !== null) {
          onSelectNode(nodeId);
        }
      }, ScreenSpaceEventType.LEFT_CLICK);
    },
    { immediate: true, flush: "post" },
  );

  onScopeDispose(() => {
    stopViewerWatch();
    destroyHandler();
  });

  // 销毁当前 ScreenSpaceEventHandler，避免组件卸载后继续拦截场景事件。
  function destroyHandler() {
    if (handler !== null) {
      handler.destroy();
      handler = null;
    }
  }
}

// 从 Cesium pick 结果中解析节点 ID，兼容 PropertyBag 和测试中的普通对象。
export function resolvePickedNodeId(
  pickedObject: PickedObjectLike | undefined,
): string | null {
  const pickedEntity = pickedObject?.id;

  if (typeof pickedEntity === "string") {
    return resolveNodeIdFromEntityId(pickedEntity);
  }

  if (pickedEntity === undefined) {
    return null;
  }

  const properties = readPropertyBag(pickedEntity.properties);
  const kind = readCesiumProperty(properties?.kind);
  const nodeId = readCesiumProperty(properties?.nodeId);

  if (kind === "node" && typeof nodeId === "string" && nodeId.length > 0) {
    return nodeId;
  }

  if (typeof pickedEntity.id === "string") {
    return resolveNodeIdFromEntityId(pickedEntity.id);
  }

  return null;
}

// 从 Entity ID 前缀中提取业务节点 ID。
function resolveNodeIdFromEntityId(entityId: string): string | null {
  if (!entityId.startsWith(NODE_ENTITY_PREFIX)) {
    return null;
  }

  return entityId.slice(NODE_ENTITY_PREFIX.length);
}

// 读取 Cesium PropertyBag 或普通对象，统一转换成可访问属性的对象。
function readPropertyBag(properties: unknown): Record<string, unknown> | null {
  if (properties === null || properties === undefined) {
    return null;
  }

  if (typeof properties !== "object") {
    return null;
  }

  const propertyRecord = properties as Record<string, unknown>;
  if ("kind" in propertyRecord || "nodeId" in propertyRecord) {
    return propertyRecord;
  }

  if ("getValue" in properties) {
    const propertyBagValue = (
      properties as { getValue: () => unknown }
    ).getValue();
    return typeof propertyBagValue === "object" && propertyBagValue !== null
      ? (propertyBagValue as Record<string, unknown>)
      : null;
  }

  return propertyRecord;
}

// 读取 Cesium Property 或普通值，兼容运行时 Entity 与单元测试对象。
function readCesiumProperty(property: unknown): unknown {
  if (
    property !== null &&
    typeof property === "object" &&
    "getValue" in property
  ) {
    return (property as { getValue: () => unknown }).getValue();
  }

  return property;
}
