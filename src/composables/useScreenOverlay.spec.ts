import { computed, defineComponent, nextTick, shallowRef, type Ref } from "vue";
import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Viewer } from "cesium";

import { normalizeTopologyResponse } from "@/domain/topologyParser";
import { topologyFixture } from "@/test/fixtures/topology";

import { useScreenOverlay } from "./useScreenOverlay";

const cesiumMocks = vi.hoisted(() => ({
  Cartesian3: {
    fromDegrees: vi.fn(() => ({ kind: "cartesian" })),
  },
  SceneTransforms: {
    worldToWindowCoordinates: vi.fn(),
  },
}));

vi.mock("cesium", () => cesiumMocks);

const normalizedTopology = normalizeTopologyResponse(topologyFixture);
const firstNode = normalizedTopology.nodes[0]!;

describe("useScreenOverlay", () => {
  beforeEach(() => {
    cesiumMocks.Cartesian3.fromDegrees.mockClear();
    cesiumMocks.SceneTransforms.worldToWindowCoordinates.mockReset();
  });

  it("projects selected node to screen coordinates and builds a connector line", async () => {
    cesiumMocks.SceneTransforms.worldToWindowCoordinates.mockReturnValue({
      x: 120,
      y: 80,
    });
    const viewer = createMockViewer();
    const overlay = mountOverlayHarness(
      shallowRef(viewer),
      computed(() => firstNode),
    );

    runPostRender(viewer);
    await nextTick();

    expect(overlay.exposed.visible.value).toBe(true);
    expect(overlay.exposed.anchorPoint.value).toEqual({ x: 120, y: 80 });
    expect(overlay.exposed.cardPoint.value).toEqual({ x: 156, y: -80 });
    expect(overlay.exposed.connectorLine.value).toMatchObject({
      x1: 120,
      y1: 80,
      color: "#ef5350",
    });
  });

  it("hides overlay when projection is unavailable", async () => {
    cesiumMocks.SceneTransforms.worldToWindowCoordinates.mockReturnValue(
      undefined,
    );
    const viewer = createMockViewer();
    const overlay = mountOverlayHarness(
      shallowRef(viewer),
      computed(() => firstNode),
    );

    runPostRender(viewer);
    await nextTick();

    expect(overlay.exposed.visible.value).toBe(false);
    expect(overlay.exposed.connectorLine.value).toBeNull();
  });

  it("updates card offset while dragging and removes postRender listener on unmount", async () => {
    cesiumMocks.SceneTransforms.worldToWindowCoordinates.mockReturnValue({
      x: 120,
      y: 80,
    });
    const viewer = createMockViewer();
    const overlay = mountOverlayHarness(
      shallowRef(viewer),
      computed(() => firstNode),
    );

    runPostRender(viewer);
    overlay.exposed.startDrag(createPointerLikeEvent("pointerdown", 20, 20));
    window.dispatchEvent(
      new MouseEvent("pointermove", { clientX: 50, clientY: 40 }),
    );
    window.dispatchEvent(
      new MouseEvent("pointerup", { clientX: 50, clientY: 40 }),
    );
    await nextTick();

    expect(overlay.exposed.cardPoint.value).toEqual({ x: 186, y: -60 });

    overlay.wrapper.unmount();

    expect(viewer.scene.postRender.removeEventListener).toHaveBeenCalled();
  });
});

function mountOverlayHarness(
  viewerRef: Ref<Viewer | null>,
  nodeRef: Ref<typeof firstNode | null>,
) {
  const exposed: ReturnType<typeof useScreenOverlay> = {} as ReturnType<
    typeof useScreenOverlay
  >;
  const TestComponent = defineComponent({
    setup() {
      Object.assign(exposed, useScreenOverlay(viewerRef, nodeRef));
      return () => null;
    },
  });

  return {
    wrapper: mount(TestComponent),
    exposed,
  };
}

function runPostRender(viewer: Viewer) {
  const callback = vi.mocked(viewer.scene.postRender.addEventListener).mock
    .calls[0]?.[0];
  callback?.();
}

function createMockViewer() {
  return {
    scene: {
      postRender: {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
      requestRender: vi.fn(),
    },
  } as unknown as Viewer;
}

function createPointerLikeEvent(
  type: string,
  clientX: number,
  clientY: number,
) {
  const event = new MouseEvent(type, { clientX, clientY }) as MouseEvent & {
    pointerId?: number;
  };
  event.pointerId = 1;
  return event as unknown as PointerEvent;
}
