import { ref, shallowRef } from "vue";
import { describe, expect, it, vi } from "vitest";
import type { Entity, Viewer } from "cesium";

import { appendHistoryPoint } from "@/domain/topologyHistory";
import { normalizeTopologyResponse } from "@/domain/topologyParser";
import { topologyFixture } from "@/test/fixtures/topology";

import {
  LINK_ENTITY_PREFIX,
  NODE_ENTITY_PREFIX,
  TRACK_ENTITY_PREFIX,
  useSituationScene,
} from "./useSituationScene";

const normalizedTopology = normalizeTopologyResponse(topologyFixture);

describe("useSituationScene", () => {
  it("adds nodes, tracks and active links incrementally", () => {
    const viewer = createMockViewer();
    const scene = useSituationScene(shallowRef(viewer));
    const histories = createHistories();

    scene.updateSituationScene({
      nodes: normalizedTopology.nodes,
      links: normalizedTopology.links,
      histories,
    });

    expect(viewer.entities.add).toHaveBeenCalledTimes(7);
    expect(scene.nodeEntities.size).toBe(3);
    expect(scene.trackEntities.size).toBe(3);
    expect(scene.linkEntities.size).toBe(1);
    expect(viewer.scene.requestRender).toHaveBeenCalledTimes(1);

    scene.updateSituationScene({
      nodes: normalizedTopology.nodes,
      links: normalizedTopology.links,
      histories,
    });

    expect(viewer.entities.add).toHaveBeenCalledTimes(7);
    expect(viewer.scene.requestRender).toHaveBeenCalledTimes(2);
  });

  it("removes stale entities when nodes disappear", () => {
    const viewer = createMockViewer();
    const scene = useSituationScene(shallowRef(viewer));
    const histories = createHistories();

    scene.updateSituationScene({
      nodes: normalizedTopology.nodes,
      links: normalizedTopology.links,
      histories,
    });
    scene.updateSituationScene({
      nodes: normalizedTopology.nodes.slice(1),
      links: [],
      histories,
    });

    expect(viewer.entities.remove).toHaveBeenCalled();
    expect(scene.nodeEntities.has(`${NODE_ENTITY_PREFIX}node-001`)).toBe(false);
    expect(scene.linkEntities.size).toBe(0);
  });

  it("updates existing node entity when selected node changes", () => {
    const viewer = createMockViewer();
    const selectedNodeId = ref<string | null>(null);
    const scene = useSituationScene(shallowRef(viewer), selectedNodeId);
    const histories = createHistories();

    scene.updateSituationScene({
      nodes: normalizedTopology.nodes,
      links: normalizedTopology.links,
      histories,
    });
    selectedNodeId.value = "node-001";
    scene.updateSituationScene({
      nodes: normalizedTopology.nodes,
      links: normalizedTopology.links,
      histories,
    });

    expect(
      scene.nodeEntities.get(`${NODE_ENTITY_PREFIX}node-001`)?.billboard,
    ).toMatchObject({
      width: 48,
      height: 48,
      scale: 1.18,
    });
  });

  it("applies type and global display controls without removing entities", () => {
    const viewer = createMockViewer();
    const scene = useSituationScene(shallowRef(viewer));
    const histories = createHistories();

    scene.updateSituationScene({
      nodes: normalizedTopology.nodes,
      links: normalizedTopology.links,
      histories,
      hiddenNodeTypes: new Set([8]),
      showHistories: false,
      showLinks: false,
    });

    expect(scene.nodeEntities.get(`${NODE_ENTITY_PREFIX}node-001`)?.show).toBe(false);
    expect(scene.trackEntities.get(`${TRACK_ENTITY_PREFIX}node-001`)?.show).toBe(false);
    expect(scene.linkEntities.get(`${LINK_ENTITY_PREFIX}link-001`)?.show).toBe(false);
    expect(scene.nodeEntities.size).toBe(3);
    expect(scene.trackEntities.size).toBe(3);
    expect(scene.linkEntities.size).toBe(1);
  });

  it("does nothing until Viewer is ready", () => {
    const scene = useSituationScene(shallowRef<Viewer | null>(null));

    scene.updateSituationScene({
      nodes: normalizedTopology.nodes,
      links: normalizedTopology.links,
      histories: createHistories(),
    });

    expect(scene.nodeEntities.size).toBe(0);
  });
});

function createHistories() {
  const histories = new Map();

  for (const node of normalizedTopology.nodes) {
    const firstHistory = appendHistoryPoint([], node, 720, 1000);
    const secondHistory = appendHistoryPoint(
      firstHistory,
      { ...node, longitude: node.longitude + 0.0001 },
      720,
      2000,
    );
    histories.set(node.id, secondHistory);
  }

  return histories;
}

function createMockViewer() {
  return {
    entities: {
      add: vi.fn((options: Entity.ConstructorOptions) => ({ ...options })),
      remove: vi.fn(),
    },
    scene: {
      requestRender: vi.fn(),
    },
  } as unknown as Viewer;
}
