import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchTopologySnapshot } from "./topologyApi";

describe("fetchTopologySnapshot", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns raw topology response for successful requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ code: 0 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchTopologySnapshot("/api/topology")).resolves.toEqual({ code: 0 });
    expect(fetchMock).toHaveBeenCalledWith("/api/topology", { signal: undefined });
  });

  it("throws for non-2xx responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      }),
    );

    await expect(fetchTopologySnapshot("/api/topology")).rejects.toThrow("HTTP 503");
  });

  it("throws for invalid json responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockRejectedValue(new SyntaxError("bad json")),
      }),
    );

    await expect(fetchTopologySnapshot("/api/topology")).rejects.toThrow("不是有效 JSON");
  });

  it("passes AbortSignal to fetch", async () => {
    const controller = new AbortController();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ code: 0 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchTopologySnapshot("/api/topology", controller.signal);

    expect(fetchMock).toHaveBeenCalledWith("/api/topology", { signal: controller.signal });
  });
});
