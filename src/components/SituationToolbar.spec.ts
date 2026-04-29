import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import SituationToolbar from "./SituationToolbar.vue";

describe("SituationToolbar", () => {
  it("renders status metrics and default enabled display toggles", () => {
    const wrapper = mount(SituationToolbar, {
      props: {
        nodeCount: 6,
        activeLinkCount: 5,
        lastUpdatedAt: "2026-04-27 21:40:00",
        statusText: "已连接",
      },
    });

    expect(wrapper.get('[data-testid="toolbar-node-count"]').text()).toBe("6");
    expect(wrapper.get('[data-testid="toolbar-link-count"]').text()).toBe("5");
    expect(wrapper.get('[data-testid="toolbar-updated-at"]').text()).toBe(
      "2026-04-27 21:40:00",
    );
    expect(wrapper.get('[data-testid="toolbar-status"]').text()).toBe("已连接");
    expect(wrapper.find("button").exists()).toBe(false);
    expect(
      (wrapper.get('[data-testid="toolbar-show-histories"]').element as HTMLInputElement)
        .checked,
    ).toBe(true);
    expect(
      (wrapper.get('[data-testid="toolbar-show-links"]').element as HTMLInputElement)
        .checked,
    ).toBe(true);
  });

  it("emits display toggle updates when checkboxes change", async () => {
    const wrapper = mount(SituationToolbar);

    await wrapper.get('[data-testid="toolbar-show-histories"]').setValue(false);
    await wrapper.get('[data-testid="toolbar-show-links"]').setValue(false);

    expect(wrapper.emitted("update:showHistories")?.[0]).toEqual([false]);
    expect(wrapper.emitted("update:showLinks")?.[0]).toEqual([false]);
  });
});
