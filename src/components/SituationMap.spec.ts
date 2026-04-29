import { nextTick, ref, shallowRef } from "vue";
import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { describe, expect, it, vi } from "vitest";

import { appConfig } from "@/config/appConfig";

import SituationMap from "./SituationMap.vue";

const { mockLoadTileset, mockUpdateSituationScene, mockViewer } = vi.hoisted(
  () => ({
    mockLoadTileset: vi.fn().mockResolvedValue({}),
    mockUpdateSituationScene: vi.fn(),
    mockViewer: {
      scene: {
        primitives: {
          add: vi.fn(),
        },
        requestRender: vi.fn(),
      },
      flyTo: vi.fn(),
    },
  }),
);

vi.mock("@/composables/useCesiumViewer", () => ({
  useCesiumViewer: () => ({
    viewer: shallowRef(mockViewer),
    errorMessage: ref(null),
  }),
}));

vi.mock("@/composables/useTileset", () => ({
  useTileset: () => ({
    loading: ref(false),
    errorMessage: ref(null),
    loadTileset: mockLoadTileset,
  }),
}));

vi.mock("@/composables/useSituationScene", () => ({
  useSituationScene: () => ({
    updateSituationScene: mockUpdateSituationScene,
  }),
}));

vi.mock("@/composables/useNodeSelection", () => ({
  useNodeSelection: vi.fn(),
}));

vi.mock("@/composables/useScreenOverlay", () => ({
  useScreenOverlay: () => ({
    visible: ref(false),
    connectorLine: ref(null),
    cardStyle: ref({}),
    startDrag: vi.fn(),
  }),
}));

describe("SituationMap", () => {
  it("renders a Cesium container and starts tileset loading when Viewer is ready", async () => {
    const wrapper = mount(SituationMap, {
      global: {
        plugins: [createPinia()],
      },
    });

    await nextTick();
    await nextTick();

    expect(wrapper.get('[data-testid="cesium-container"]').classes()).toContain(
      "cesium-container",
    );
    expect(mockLoadTileset).toHaveBeenCalledWith(
      mockViewer,
      appConfig.tilesetUrl,
    );
    expect(mockUpdateSituationScene).toHaveBeenCalled();
  });
});
