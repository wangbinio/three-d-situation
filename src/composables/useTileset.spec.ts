import { afterEach, describe, expect, it, vi } from "vitest";
import { Cesium3DTileset, type Viewer } from "cesium";

import { useTileset } from "./useTileset";

vi.mock("cesium", () => ({
  Cesium3DTileset: {
    fromUrl: vi.fn(),
  },
  HeadingPitchRange: vi.fn(function HeadingPitchRange(
    heading: number,
    pitch: number,
    range: number,
  ) {
    return { heading, pitch, range };
  }),
  Matrix4: {
    IDENTITY: "identity",
  },
}));

describe("useTileset", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("loads a tileset, adds it to primitives and focuses the camera on it", async () => {
    const mockTileset = createMockTileset();
    vi.mocked(Cesium3DTileset.fromUrl).mockResolvedValue(mockTileset as never);
    const viewer = createMockViewer();
    const { tileset, loading, errorMessage, loadTileset } = useTileset();

    const result = await loadTileset(
      viewer,
      "http://example.test/tileset.json",
    );

    expect(Cesium3DTileset.fromUrl).toHaveBeenCalledWith(
      "http://example.test/tileset.json",
    );
    expect(viewer.scene.primitives.add).toHaveBeenCalledWith(mockTileset);
    expect(viewer.camera.viewBoundingSphere).toHaveBeenCalledWith(
      mockTileset.boundingSphere,
      expect.objectContaining({
        heading: 0,
        pitch: -0.55,
        range: 1500,
      }),
    );
    expect(viewer.camera.lookAtTransform).toHaveBeenCalledWith("identity");
    expect(viewer.scene.requestRender).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockTileset);
    expect(tileset.value).toBe(mockTileset);
    expect(loading.value).toBe(false);
    expect(errorMessage.value).toBeNull();
  });

  it("does not keep loading while waiting for camera flight", async () => {
    const mockTileset = createMockTileset();
    vi.mocked(Cesium3DTileset.fromUrl).mockResolvedValue(mockTileset as never);
    const viewer = createMockViewer();
    const { tileset, loading, loadTileset } = useTileset();

    const result = await loadTileset(
      viewer,
      "http://example.test/tileset.json",
    );

    expect(result).toBe(mockTileset);
    expect(tileset.value).toBe(mockTileset);
    expect(loading.value).toBe(false);
  });

  it("keeps the page alive when loading fails", async () => {
    vi.mocked(Cesium3DTileset.fromUrl).mockRejectedValue(
      new Error("tileset failed"),
    );
    const viewer = createMockViewer();
    const { loading, errorMessage, loadTileset } = useTileset();

    const result = await loadTileset(
      viewer,
      "http://example.test/tileset.json",
    );

    expect(result).toBeNull();
    expect(viewer.scene.primitives.add).not.toHaveBeenCalled();
    expect(errorMessage.value).toBe("tileset failed");
    expect(loading.value).toBe(false);
  });
});

function createMockTileset() {
  return {
    id: "tileset",
    boundingSphere: {
      radius: 500,
    },
  };
}

function createMockViewer() {
  return {
    scene: {
      primitives: {
        add: vi.fn(),
      },
      requestRender: vi.fn(),
    },
    camera: {
      viewBoundingSphere: vi.fn(),
      lookAtTransform: vi.fn(),
    },
  } as unknown as Viewer;
}
