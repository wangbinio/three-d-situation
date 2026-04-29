import { defineComponent, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useTopologyPolling } from "./useTopologyPolling";

type TestFetcher = (url: string, signal?: AbortSignal) => Promise<{ code: number }>;

function flushPromises() {
  return Promise.resolve().then(() => undefined);
}

describe("useTopologyPolling", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("requests immediately on mount and schedules the next request after completion", async () => {
    const fetcher = vi.fn().mockResolvedValue({ code: 0 });
    const onSnapshot = vi.fn();
    mountPollingComponent(fetcher, onSnapshot);

    await nextTick();
    await flushPromises();

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(onSnapshot).toHaveBeenCalledWith({ code: 0 });

    await vi.advanceTimersByTimeAsync(5000);
    await flushPromises();

    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("does not overlap slow requests", async () => {
    let resolveRequest: ((value: { code: number }) => void) | undefined;
    const fetcher = vi.fn(
      () =>
        new Promise<{ code: number }>((resolve) => {
          resolveRequest = resolve;
        }),
    );
    mountPollingComponent(fetcher);

    await nextTick();

    expect(fetcher).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(15000);

    expect(fetcher).toHaveBeenCalledTimes(1);

    resolveRequest?.({ code: 0 });
    await flushPromises();
    await vi.advanceTimersByTimeAsync(5000);

    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("aborts active request when unmounted", async () => {
    let capturedSignal: AbortSignal | undefined;
    const fetcher = vi.fn((_url: string, signal?: AbortSignal) => {
      capturedSignal = signal;
      return new Promise<{ code: number }>(() => undefined);
    });
    const wrapper = mountPollingComponent(fetcher);

    await nextTick();
    wrapper.unmount();

    expect(capturedSignal?.aborted).toBe(true);
  });

  it("pauses while the document is hidden and resumes immediately when visible", async () => {
    const fetcher = vi.fn().mockResolvedValue({ code: 0 });
    mountPollingComponent(fetcher);

    await nextTick();
    await flushPromises();

    vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    document.dispatchEvent(new Event("visibilitychange"));
    await vi.advanceTimersByTimeAsync(5000);

    expect(fetcher).toHaveBeenCalledTimes(1);

    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    document.dispatchEvent(new Event("visibilitychange"));
    await flushPromises();

    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});

function mountPollingComponent(fetcher: TestFetcher, onSnapshot = vi.fn()) {
  return mount(
    defineComponent({
      setup() {
        useTopologyPolling({
          url: "/api/topology",
          intervalMs: 5000,
          fetcher,
          onSnapshot,
          onError: vi.fn(),
        });

        return () => null;
      },
    }),
  );
}
