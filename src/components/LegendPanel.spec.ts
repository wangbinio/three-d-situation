import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import LegendPanel from "./LegendPanel.vue";

describe("LegendPanel", () => {
  it("renders all configured node type legends as clickable rows", () => {
    const wrapper = mount(LegendPanel);

    expect(wrapper.get('[data-testid="legend-panel"]').text()).not.toContain("目标类型图标");
    expect(wrapper.get('[data-testid="legend-panel"]').text()).not.toContain("8 类");
    expect(wrapper.findAll('[data-testid="legend-item"]')).toHaveLength(9);
    expect(wrapper.text()).not.toContain("球体");
    expect(wrapper.text()).toContain("III类设备");
    expect(wrapper.text()).toContain("无人机");
    expect(wrapper.findAll(".legend-panel__icon")).toHaveLength(9);
    expect(wrapper.find('img[alt="终端点"]').exists()).toBe(true);
    expect(wrapper.find('img[alt="菱形警示"]').attributes("src")).toBe(
      "/models/node-icons/svg/III类设备.svg",
    );
    expect(wrapper.find('img[alt="旋翼无人机"]').attributes("src")).toBe(
      "/models/node-icons/svg/无人机.svg",
    );
  });

  it("emits the target node type and marks hidden rows", async () => {
    const wrapper = mount(LegendPanel, {
      props: {
        hiddenNodeTypes: [1],
      },
    });

    const firstItem = wrapper.get('[data-testid="legend-item"]');
    expect(firstItem.classes()).toContain("legend-panel__item--hidden");

    await firstItem.trigger("click");

    expect(wrapper.emitted("toggleNodeType")?.[0]).toEqual([1]);
  });
});
