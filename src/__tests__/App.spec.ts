import { describe, it, expect } from "vitest";

import { mount } from "@vue/test-utils";
import App from "../App.vue";

describe("App", () => {
  it("mounts with the router outlet", () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: {
            template: '<main data-testid="router-view-stub">三维态势展示</main>',
          },
        },
      },
    });

    expect(wrapper.get('[data-testid="router-view-stub"]').text()).toContain("三维态势展示");
  });
});
