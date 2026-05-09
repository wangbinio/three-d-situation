import { defineComponent, nextTick, ref } from "vue";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Viewer } from "cesium";

import { normalizeViewerError, useCesiumViewer } from "./useCesiumViewer";

const {
  buildModuleUrlMock,
  offlineBaseLayer,
  providerPromise,
  viewerInstances,
  ViewerMock,
} = vi.hoisted(() => {
  const instances: Array<{
    destroy: ReturnType<typeof vi.fn>;
    isDestroyed: ReturnType<typeof vi.fn>;
    scene: {
      light: unknown;
      postProcessStages: {
        ambientOcclusion: {
          enabled: boolean;
        };
      };
      requestRender: ReturnType<typeof vi.fn>;
    };
  }> = [];

  const Mock = vi.fn(function () {
    const instance = {
      destroy: vi.fn(),
      isDestroyed: vi.fn().mockReturnValue(false),
      scene: {
        light: undefined as unknown,
        postProcessStages: {
          ambientOcclusion: {
            enabled: true,
          },
        },
        requestRender: vi.fn(),
      },
    };
    instances.push(instance);
    return instance;
  });

  return {
    buildModuleUrlMock: vi.fn((path: string) => `/cesium/${path}`),
    offlineBaseLayer: { id: "offline-base-layer" },
    providerPromise: Promise.resolve({ id: "natural-earth-provider" }),
    viewerInstances: instances,
    ViewerMock: Mock,
  };
});

vi.mock("cesium", () => ({
  buildModuleUrl: buildModuleUrlMock,
  ImageryLayer: {
    fromProviderAsync: vi.fn(() => offlineBaseLayer),
  },
  TileMapServiceImageryProvider: {
    fromUrl: vi.fn(() => providerPromise),
  },
  Viewer: ViewerMock,
}));

describe("useCesiumViewer", () => {
  afterEach(() => {
    vi.clearAllMocks();
    viewerInstances.length = 0;
  });

  it("initializes Viewer with disabled widgets and request render mode", async () => {
    mountViewerComponent();

    await nextTick();

    expect(buildModuleUrlMock).toHaveBeenCalledWith(
      "Assets/Textures/NaturalEarthII",
    );
    expect(Viewer).toHaveBeenCalledTimes(1);
    expect(Viewer).toHaveBeenCalledWith(expect.any(HTMLElement), {
      animation: false,
      timeline: false,
      baseLayer: offlineBaseLayer,
      creditContainer: expect.any(HTMLElement),
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      selectionIndicator: false,
      infoBox: false,
      fullscreenButton: false,
      showRenderLoopErrors: false,
      requestRenderMode: true,
      maximumRenderTimeChange: Infinity,
      shadows: false,
      shouldAnimate: false,
      contextOptions: {
        webgl: {
          antialias: false,
          failIfMajorPerformanceCaveat: false,
          powerPreference: "default",
        },
      },
      msaaSamples: 1,
    });
    const viewerOptions = vi.mocked(Viewer).mock.calls[0]?.[1] as {
      creditContainer?: HTMLElement;
    };
    expect(viewerOptions.creditContainer?.style.display).toBe("none");
    expect(viewerOptions.creditContainer?.dataset.testid).toBe(
      "cesium-credit-container",
    );
    expect(
      viewerInstances[0]?.scene.postProcessStages.ambientOcclusion.enabled,
    ).toBe(false);
    expect(viewerInstances[0]?.scene.requestRender).toHaveBeenCalledTimes(1);
  });

  it("destroys Viewer when component is unmounted", async () => {
    const wrapper = mountViewerComponent();

    await nextTick();
    wrapper.unmount();

    expect(viewerInstances[0]?.destroy).toHaveBeenCalledTimes(1);
  });

  it("sets an error when initialized without a container", () => {
    const containerRef = ref<HTMLElement | null>(null);
    const { errorMessage, initializeViewer } = useCesiumViewer(containerRef);

    expect(initializeViewer()).toBeNull();
    expect(errorMessage.value).toBe("Cesium 容器不存在");
  });

  it("normalizes WebGL construction errors for the page status", () => {
    expect(
      normalizeViewerError(new Error("The browser supports WebGL, but initialization failed.")),
    ).toContain("WebGL 初始化失败");
  });
});

function mountViewerComponent() {
  return mount(
    defineComponent({
      setup() {
        const containerRef = ref<HTMLElement | null>(null);
        useCesiumViewer(containerRef);

        return {
          containerRef,
        };
      },
      template: '<div ref="containerRef" />',
    }),
  );
}
