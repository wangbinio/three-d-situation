import { ref, shallowRef } from "vue";
import {
  Cesium3DTileset,
  HeadingPitchRange,
  Matrix4,
  type Viewer,
} from "cesium";

// 管理 3D Tileset 加载流程，调用方负责提供已初始化的 Viewer。
export function useTileset() {
  const tileset = shallowRef<Cesium3DTileset | null>(null);
  const loading = ref(false);
  const errorMessage = ref<string | null>(null);

  // 按 URL 加载三维瓦片，加入场景后即视为底座加载完成。
  async function loadTileset(viewer: Viewer, tilesetUrl: string) {
    loading.value = true;
    errorMessage.value = null;

    try {
      const nextTileset = await Cesium3DTileset.fromUrl(tilesetUrl);
      viewer.scene.primitives.add(nextTileset);
      tileset.value = nextTileset;
      focusTileset(viewer, nextTileset);
      viewer.scene.requestRender();
      return nextTileset;
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : String(error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  return {
    tileset,
    loading,
    errorMessage,
    loadTileset,
  };
}

// 根据 tileset 包围球立即定位相机，避免 flyTo 异步状态导致黑屏或无反馈。
export function focusTileset(viewer: Viewer, nextTileset: Cesium3DTileset) {
  const boundingSphere = nextTileset.boundingSphere;
  const range = Math.max(boundingSphere.radius * 3, 500);

  viewer.camera.viewBoundingSphere(
    boundingSphere,
    new HeadingPitchRange(0, -0.55, range),
  );
  viewer.camera.lookAtTransform(Matrix4.IDENTITY);
}
