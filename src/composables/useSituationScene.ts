import { type Ref } from "vue";
import { Entity, type Viewer } from "cesium";

import type {
  PositionPoint,
  SituationLink,
  SituationNode,
} from "@/domain/topologyTypes";

import {
  createLinkEntityOptions,
  createNodeEntityOptions,
  createTrackEntityOptions,
  LINK_ENTITY_PREFIX,
  NODE_ENTITY_PREFIX,
  TRACK_ENTITY_PREFIX,
} from "./cesiumEntityFactory";

interface SituationSceneSnapshot {
  nodes: readonly SituationNode[];
  links: readonly SituationLink[];
  histories: ReadonlyMap<string, PositionPoint[]>;
  hiddenNodeTypes?: ReadonlySet<number>;
  showHistories?: boolean;
  showLinks?: boolean;
}

// 维护态势实体的 Cesium 缓存，避免每轮数据刷新时全量重建实体。
export function useSituationScene(
  viewerRef: Ref<Viewer | null>,
  selectedNodeIdRef?: Ref<string | null>,
) {
  const nodeEntities = new Map<string, Entity>();
  const trackEntities = new Map<string, Entity>();
  const linkEntities = new Map<string, Entity>();

  // 按当前拓扑快照增量更新节点、轨迹和链路实体。
  function updateSituationScene(snapshot: SituationSceneSnapshot) {
    const viewer = viewerRef.value;
    if (viewer === null) {
      return;
    }

    const nodeById = new Map(snapshot.nodes.map((node) => [node.id, node]));
    const hiddenNodeTypes = snapshot.hiddenNodeTypes ?? new Set<number>();
    const showHistories = snapshot.showHistories ?? true;
    const showLinks = snapshot.showLinks ?? true;
    const nextNodeEntityIds = new Set<string>();
    const nextTrackEntityIds = new Set<string>();
    const nextLinkEntityIds = new Set<string>();

    for (const node of snapshot.nodes) {
      const nodeOptions = createNodeEntityOptions(
        node,
        node.id === selectedNodeIdRef?.value,
      );
      if (nodeOptions !== null) {
        nodeOptions.show = isNodeTypeVisible(node, hiddenNodeTypes);
        nextNodeEntityIds.add(nodeOptions.id!);
        upsertEntity(viewer, nodeEntities, nodeOptions);
      }

      const trackOptions = createTrackEntityOptions(
        node,
        snapshot.histories.get(node.id) ?? [],
      );
      if (trackOptions !== null) {
        trackOptions.show = Boolean(
          trackOptions.show && showHistories && isNodeTypeVisible(node, hiddenNodeTypes),
        );
        nextTrackEntityIds.add(trackOptions.id!);
        upsertEntity(viewer, trackEntities, trackOptions);
      }
    }

    for (const link of snapshot.links) {
      const linkOptions = createLinkEntityOptions(link, nodeById);
      if (linkOptions !== null) {
        linkOptions.show = Boolean(
          linkOptions.show &&
            showLinks &&
            isLinkVisible(link, nodeById, hiddenNodeTypes),
        );
        nextLinkEntityIds.add(linkOptions.id!);
        upsertEntity(viewer, linkEntities, linkOptions);
      }
    }

    removeStaleEntities(viewer, nodeEntities, nextNodeEntityIds);
    removeStaleEntities(viewer, trackEntities, nextTrackEntityIds);
    removeStaleEntities(viewer, linkEntities, nextLinkEntityIds);
    viewer.scene.requestRender();
  }

  return {
    nodeEntities,
    trackEntities,
    linkEntities,
    updateSituationScene,
  };
}

// 判断节点类型是否处于可见状态。
function isNodeTypeVisible(
  node: SituationNode,
  hiddenNodeTypes: ReadonlySet<number>,
): boolean {
  return !hiddenNodeTypes.has(node.type);
}

// 判断链路两端节点是否都处于可见状态。
function isLinkVisible(
  link: SituationLink,
  nodeById: ReadonlyMap<string, SituationNode>,
  hiddenNodeTypes: ReadonlySet<number>,
): boolean {
  const sourceNode = nodeById.get(link.sourceNodeId);
  const targetNode = nodeById.get(link.targetNodeId);

  return (
    sourceNode !== undefined &&
    targetNode !== undefined &&
    isNodeTypeVisible(sourceNode, hiddenNodeTypes) &&
    isNodeTypeVisible(targetNode, hiddenNodeTypes)
  );
}

function upsertEntity(
  viewer: Viewer,
  cache: Map<string, Entity>,
  options: Entity.ConstructorOptions,
) {
  const entityId = options.id;
  if (entityId === undefined) {
    return;
  }

  const existingEntity = cache.get(entityId);
  if (existingEntity === undefined) {
    cache.set(entityId, viewer.entities.add(options));
    return;
  }

  // Cesium 构造参数会被 EntityCollection.add 转为 Graphics/Property；
  // 这里保留增量更新语义，运行时交给 Cesium setter 做同等转换。
  const mutableEntity = existingEntity as unknown as Record<string, unknown>;
  mutableEntity.name = options.name;
  mutableEntity.show = options.show ?? true;
  mutableEntity.position = options.position;
  mutableEntity.model = options.model;
  mutableEntity.billboard = options.billboard;
  mutableEntity.point = options.point;
  mutableEntity.polyline = options.polyline;
  mutableEntity.properties = options.properties;
}

function removeStaleEntities(
  viewer: Viewer,
  cache: Map<string, Entity>,
  nextEntityIds: ReadonlySet<string>,
) {
  for (const [entityId, entity] of cache.entries()) {
    if (!nextEntityIds.has(entityId)) {
      viewer.entities.remove(entity);
      cache.delete(entityId);
    }
  }
}

export { LINK_ENTITY_PREFIX, NODE_ENTITY_PREFIX, TRACK_ENTITY_PREFIX };
