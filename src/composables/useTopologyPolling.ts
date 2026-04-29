import { onMounted, onUnmounted, ref } from "vue";

import { fetchTopologySnapshot } from "@/services/topologyApi";
import type { TopologyResponse } from "@/domain/topologyTypes";

type TopologyFetcher = (url: string, signal?: AbortSignal) => Promise<TopologyResponse>;

interface UseTopologyPollingOptions {
  url: string;
  intervalMs: number;
  fetcher?: TopologyFetcher;
  onBeforeRequest?: () => void;
  onSnapshot: (snapshot: TopologyResponse) => void;
  onError: (error: unknown) => void;
}

// 管理拓扑接口轮询，确保慢请求不会与下一轮请求重叠。
export function useTopologyPolling(options: UseTopologyPollingOptions) {
  const isRunning = ref(false);
  const isRequesting = ref(false);
  const fetcher = options.fetcher ?? fetchTopologySnapshot;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let currentController: AbortController | null = null;
  let stopped = true;

  // 启动轮询；如果页面不可见，则等待页面恢复可见后再请求。
  function start() {
    if (!stopped) {
      return;
    }

    stopped = false;
    isRunning.value = true;

    if (!document.hidden) {
      void runOnce();
    }
  }

  // 停止轮询并取消正在进行的请求。
  function stop() {
    stopped = true;
    isRunning.value = false;
    clearPendingTimer();

    if (currentController !== null) {
      currentController.abort();
      currentController = null;
    }
  }

  // 手动刷新一次，并重置下一轮轮询时间。
  async function refresh() {
    clearPendingTimer();
    await runOnce();
  }

  async function runOnce() {
    if (stopped || isRequesting.value) {
      return;
    }

    isRequesting.value = true;
    currentController = new AbortController();
    options.onBeforeRequest?.();

    try {
      const snapshot = await fetcher(options.url, currentController.signal);
      options.onSnapshot(snapshot);
    } catch (error) {
      if (!isAbortError(error)) {
        options.onError(error);
      }
    } finally {
      isRequesting.value = false;
      currentController = null;

      if (!stopped && !document.hidden) {
        scheduleNextRun();
      }
    }
  }

  function scheduleNextRun() {
    clearPendingTimer();
    timeoutId = setTimeout(() => {
      void runOnce();
    }, options.intervalMs);
  }

  function clearPendingTimer() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      clearPendingTimer();
      return;
    }

    if (!stopped) {
      void runOnce();
    }
  }

  onMounted(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    start();
  });

  onUnmounted(() => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    stop();
  });

  return {
    isRunning,
    isRequesting,
    start,
    stop,
    refresh,
  };
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
