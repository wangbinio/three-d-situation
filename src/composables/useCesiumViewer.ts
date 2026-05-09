import { onMounted, onUnmounted, ref, shallowRef, type Ref } from "vue";
import {
  buildModuleUrl,
  ImageryLayer,
  TileMapServiceImageryProvider,
  Viewer,
} from "cesium";

const VIEWER_OPTIONS: ConstructorParameters<typeof Viewer>[1] = {
  animation: false,
  timeline: false,
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
};

// 管理 Cesium Viewer 生命周期，组件卸载时确保释放 WebGL 资源。
export function useCesiumViewer(containerRef: Ref<HTMLElement | null>) {
  const viewer = shallowRef<Viewer | null>(null);
  const errorMessage = ref<string | null>(null);

  // 初始化 Viewer；重复调用时复用已有实例。
  function initializeViewer() {
    if (viewer.value !== null) {
      return viewer.value;
    }

    if (containerRef.value === null) {
      errorMessage.value = "Cesium 容器不存在";
      return null;
    }

    try {
      viewer.value = new Viewer(containerRef.value, {
        ...VIEWER_OPTIONS,
        baseLayer: createOfflineBaseLayer(),
        creditContainer: createHiddenCreditContainer(containerRef.value),
      });

      const scene = viewer.value.scene;

      // 避免环境光遮蔽把低模或贴图节点进一步压暗。
      scene.postProcessStages.ambientOcclusion.enabled = false;

      scene.requestRender();
      errorMessage.value = null;
      return viewer.value;
    } catch (error) {
      errorMessage.value = normalizeViewerError(error);
      return null;
    }
  }

  // 销毁 Viewer；Cesium 自身已销毁时不重复调用 destroy。
  function destroyViewer() {
    if (viewer.value !== null && !viewer.value.isDestroyed()) {
      viewer.value.destroy();
    }

    viewer.value = null;
  }

  onMounted(() => {
    initializeViewer();
  });

  onUnmounted(() => {
    destroyViewer();
  });

  return {
    viewer,
    errorMessage,
    initializeViewer,
    destroyViewer,
  };
}

// 创建 Cesium 自带 NaturalEarthII 离线底图，避免默认 Bing/Cesium ion 影像访问公网。
function createOfflineBaseLayer() {
  return ImageryLayer.fromProviderAsync(
    TileMapServiceImageryProvider.fromUrl(
      buildModuleUrl("Assets/Textures/NaturalEarthII"),
    ),
  );
}

// 创建隐藏 credit 容器，避免页面左下角展示 Cesium 图标和文字。
function createHiddenCreditContainer(container: HTMLElement): HTMLElement {
  const creditContainer = container.ownerDocument.createElement("div");
  creditContainer.dataset.testid = "cesium-credit-container";
  creditContainer.style.display = "none";
  container.append(creditContainer);

  return creditContainer;
}

// 归一化 Cesium 初始化错误，避免把英文长错误直接暴露给页面。
export function normalizeViewerError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (
    message.includes("WebGL") ||
    message.includes("webgl") ||
    message.includes("CesiumWidget")
  ) {
    return "WebGL 初始化失败。请检查浏览器硬件加速、显卡驱动或改用支持 WebGL 的浏览器；拓扑数据测试不受影响。";
  }

  return message;
}
