import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { describe, expect, it, vi } from "vitest";

import SituationView from "./SituationView.vue";

vi.mock("@/composables/useTopologyPolling", () => ({
  useTopologyPolling: () => ({
    refresh: vi.fn(),
  }),
}));

describe("SituationView", () => {
  it("renders the situation page skeleton and store-backed toolbar", () => {
    const wrapper = mount(SituationView, {
      global: {
        plugins: [createPinia()],
        stubs: {
          SituationMap: {
            template:
              '<section data-testid="situation-map" aria-label="三维地图容器"><div data-testid="cesium-container" class="cesium-container" /></section>',
          },
        },
      },
    });

    expect(wrapper.get('[data-testid="situation-page"]').text()).not.toContain("三维态势展示");
    expect(wrapper.get('[data-testid="situation-map"]').attributes("aria-label")).toBe(
      "三维地图容器",
    );
    expect(wrapper.get('[data-testid="cesium-container"]').classes()).toContain("cesium-container");
    expect(wrapper.get('[data-testid="legend-panel"]').attributes("aria-label")).toBe(
      "目标类型图例",
    );
    expect(wrapper.get('[data-testid="toolbar-node-count"]').text()).toBe("0");
    expect(wrapper.get('[data-testid="toolbar-status"]').text()).toBe("等待数据");
    expect(
      (wrapper.get('[data-testid="toolbar-show-histories"]').element as HTMLInputElement)
        .checked,
    ).toBe(true);
    expect(
      (wrapper.get('[data-testid="toolbar-show-links"]').element as HTMLInputElement)
        .checked,
    ).toBe(true);
  });
});
