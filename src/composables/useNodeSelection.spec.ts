import { defineComponent, shallowRef } from "vue";
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Viewer } from "cesium";

import { NODE_ENTITY_PREFIX } from "./cesiumEntityFactory";
import { useNodeSelection } from "./useNodeSelection";

const cesiumMocks = vi.hoisted(() => {
  const instances: Array<{
    canvas: unknown;
    setInputAction: ReturnType<typeof vi.fn>;
    destroy: ReturnType<typeof vi.fn>;
  }> = [];

  return {
    instances,
    ScreenSpaceEventHandler: vi.fn(function ScreenSpaceEventHandler(
      canvas: unknown,
    ) {
      const instance = {
        canvas,
        setInputAction: vi.fn(),
        destroy: vi.fn(),
      };
      instances.push(instance);
      return instance;
    }),
    ScreenSpaceEventType: {
      LEFT_CLICK: "LEFT_CLICK",
    },
  };
});

vi.mock("cesium", () => cesiumMocks);

describe("useNodeSelection", () => {
  beforeEach(() => {
    cesiumMocks.instances.length = 0;
    cesiumMocks.ScreenSpaceEventHandler.mockClear();
  });

  it("selects picked node entities", () => {
    const onSelectNode = vi.fn();
    const viewer = createMockViewer({
      id: `${NODE_ENTITY_PREFIX}node-001`,
      properties: {
        kind: "node",
        nodeId: "node-001",
      },
    });

    mountSelectionHarness(viewer, onSelectNode);
    runLeftClickAction({ x: 10, y: 20 });

    expect(viewer.scene.pick).toHaveBeenCalledWith({ x: 10, y: 20 });
    expect(onSelectNode).toHaveBeenCalledWith("node-001");
  });

  it("falls back to node entity id prefix when properties are unavailable", () => {
    const onSelectNode = vi.fn();
    const viewer = createMockViewer({
      id: `${NODE_ENTITY_PREFIX}node-from-id`,
    });

    mountSelectionHarness(viewer, onSelectNode);
    runLeftClickAction({ x: 12, y: 24 });

    expect(onSelectNode).toHaveBeenCalledWith("node-from-id");
  });

  it("ignores non-node picks and destroys the Cesium handler on unmount", () => {
    const onSelectNode = vi.fn();
    const viewer = createMockViewer({
      id: "track:node-001",
      properties: {
        kind: "track",
        nodeId: "node-001",
      },
    });

    const wrapper = mountSelectionHarness(viewer, onSelectNode);
    runLeftClickAction({ x: 10, y: 20 });
    wrapper.unmount();

    expect(onSelectNode).not.toHaveBeenCalled();
    expect(cesiumMocks.instances[0]?.destroy).toHaveBeenCalledTimes(1);
  });
});

function mountSelectionHarness(
  viewer: Viewer,
  onSelectNode: (nodeId: string) => void,
) {
  const TestComponent = defineComponent({
    setup() {
      useNodeSelection(shallowRef(viewer), onSelectNode);
      return () => null;
    },
  });

  return mount(TestComponent);
}

function runLeftClickAction(position: { x: number; y: number }) {
  const handler = cesiumMocks.instances[0];
  const callback = handler?.setInputAction.mock.calls[0]?.[0];
  expect(handler?.setInputAction.mock.calls[0]?.[1]).toBe("LEFT_CLICK");
  callback?.({ position });
}

function createMockViewer(pickedId: unknown) {
  return {
    scene: {
      canvas: document.createElement("canvas"),
      pick: vi.fn(() => ({ id: pickedId })),
    },
  } as unknown as Viewer;
}
