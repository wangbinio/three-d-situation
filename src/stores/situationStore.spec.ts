import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";

import { topologyFixture } from "@/test/fixtures/topology";

import { useSituationStore } from "./situationStore";

describe("useSituationStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("applies topology responses and derives lists", () => {
    const store = useSituationStore();

    store.applyTopologyResponse(topologyFixture, 1000);

    expect(store.nodeList).toHaveLength(4);
    expect(store.linkList).toHaveLength(2);
    expect(store.activeLinkList).toHaveLength(1);
    expect(store.lastUpdatedAt).toBe(1000);
    expect(store.errorMessage).toBeNull();
    expect(store.histories.get("node-001")).toHaveLength(1);
    expect(store.histories.get("node-invalid-location")).toEqual([]);
  });

  it("keeps previous data when applying errors", () => {
    const store = useSituationStore();

    store.applyTopologyResponse(topologyFixture, 1000);
    store.applyError(new Error("network failed"));

    expect(store.nodeList).toHaveLength(4);
    expect(store.errorMessage).toBe("network failed");
    expect(store.loading).toBe(false);
  });

  it("handles selected node lifecycle", () => {
    const store = useSituationStore();

    store.applyTopologyResponse(topologyFixture, 1000);
    store.selectNode("node-001");

    expect(store.selectedNode?.id).toBe("node-001");

    store.clearSelectedNode();

    expect(store.selectedNode).toBeNull();
  });

  it("clears selected node when it disappears", () => {
    const store = useSituationStore();

    store.applyTopologyResponse(topologyFixture, 1000);
    store.selectNode("node-001");
    store.applyTopologyResponse({ code: 0, data: { topo: { node: [], link: [] } } }, 2000);

    expect(store.selectedNodeId).toBeNull();
  });

  it("tracks display controls without clearing topology data", () => {
    const store = useSituationStore();

    store.applyTopologyResponse(topologyFixture, 1000);
    store.toggleNodeTypeVisibility(8);
    store.setShowHistories(false);
    store.setShowLinks(false);

    expect(store.hiddenNodeTypeList).toEqual([8]);
    expect(store.showHistories).toBe(false);
    expect(store.showLinks).toBe(false);
    expect(store.histories.get("node-001")).toHaveLength(1);
    expect(store.linkList).toHaveLength(2);

    store.toggleNodeTypeVisibility(8);

    expect(store.hiddenNodeTypeList).toEqual([]);
  });

  it("records summary warnings", () => {
    const store = useSituationStore();

    store.applyTopologyResponse(
      {
        ...topologyFixture,
        summary: { node_count: 99, link_count: 88 },
      },
      1000,
    );

    expect(store.warnings).toHaveLength(2);
  });
});
