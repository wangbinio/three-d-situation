import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import { normalizeTopologyResponse } from "@/domain/topologyParser";
import { topologyFixture } from "@/test/fixtures/topology";

import NodeInfoCard from "./NodeInfoCard.vue";

const normalizedTopology = normalizeTopologyResponse(topologyFixture);
const node = normalizedTopology.nodes[0]!;

describe("NodeInfoCard", () => {
  it("renders node status, position and IP address", () => {
    const wrapper = mount(NodeInfoCard, {
      props: {
        node,
      },
    });

    expect(
      wrapper.get('[data-testid="node-card-id"]').attributes("title"),
    ).toBe("node-001");
    expect(wrapper.get('[data-testid="node-card-type"]').text()).toContain(
      "III类设备",
    );
    expect(wrapper.get('[data-testid="node-card-status"]').text()).toContain(
      "在线",
    );
    expect(wrapper.get('[data-testid="node-card-position"]').text()).toContain(
      "113.057538",
    );
    expect(wrapper.get('[data-testid="node-card-position"]').text()).toContain(
      "28.663600",
    );
    expect(wrapper.get('[data-testid="node-card-ip"]').text()).toContain(
      "192.168.2.1",
    );
  });

  it("emits close from close button and context menu", async () => {
    const wrapper = mount(NodeInfoCard, {
      props: {
        node,
      },
    });

    await wrapper.get('[data-testid="node-card-close"]').trigger("click");
    await wrapper.trigger("contextmenu");

    expect(wrapper.emitted("close")).toHaveLength(2);
  });

  it("emits drag-start and blocks event propagation from the card surface", async () => {
    const wrapper = mount(NodeInfoCard, {
      props: {
        node,
      },
    });

    await wrapper.trigger("pointerdown");

    expect(wrapper.emitted("drag-start")).toHaveLength(1);
  });
});
