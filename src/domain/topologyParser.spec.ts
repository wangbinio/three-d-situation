import { describe, expect, it } from "vitest";

import { topologyFixture } from "@/test/fixtures/topology";

import {
  DRONE_NODE_TYPE,
  HANDHELD_BACKPACK_NODE_TYPE,
  LinkStatus,
  NodeStatus,
  type TopologyResponse,
} from "./topologyTypes";
import { normalizeTopologyResponse, parseNodeLocation } from "./topologyParser";

describe("parseNodeLocation", () => {
  it("parses two-dimensional locations with zero height", () => {
    expect(parseNodeLocation("113.057538,28.663600")).toEqual({
      longitude: 113.057538,
      latitude: 28.6636,
      height: 0,
      hasValidLocation: true,
    });
  });

  it("parses three-dimensional locations", () => {
    expect(parseNodeLocation("113.057471,28.663652,12.5")).toEqual({
      longitude: 113.057471,
      latitude: 28.663652,
      height: 12.5,
      hasValidLocation: true,
    });
  });

  it("marks blank, invalid and out-of-range locations as invalid", () => {
    expect(parseNodeLocation("").hasValidLocation).toBe(false);
    expect(parseNodeLocation("abc,28.663600").hasValidLocation).toBe(false);
    expect(parseNodeLocation("181,28.663600").hasValidLocation).toBe(false);
    expect(parseNodeLocation("113.057538,91").hasValidLocation).toBe(false);
  });

  it("treats zero-zero as invalid by default and configurable when needed", () => {
    expect(parseNodeLocation("0.0,0.0").hasValidLocation).toBe(false);
    expect(parseNodeLocation("0.0,0.0", { hideZeroZero: false }).hasValidLocation).toBe(true);
  });
});

describe("normalizeTopologyResponse", () => {
  it("normalizes nodes, links and root summary without warnings", () => {
    const result = normalizeTopologyResponse(topologyFixture);

    expect(result.nodes).toHaveLength(4);
    expect(result.links).toHaveLength(2);
    expect(result.warnings).toEqual([]);
    expect(result.nodes[0]).toMatchObject({
      id: "node-001",
      type: 8,
      status: NodeStatus.Online,
      longitude: 113.057538,
      latitude: 28.6636,
      height: 62,
      ipAddress: "192.168.2.1",
      hasValidLocation: true,
    });
    expect(result.nodes[2]?.hasValidLocation).toBe(false);
    expect(result.nodes[3]).toMatchObject({
      type: 99,
      status: NodeStatus.Offline,
      ipAddress: "--",
    });
    expect(result.links[0]).toMatchObject({
      id: "link-001",
      status: LinkStatus.Active,
      sourceNodeId: "node-001",
      targetNodeId: "node-002",
    });
  });

  it("returns empty data for non-zero response code", () => {
    expect(normalizeTopologyResponse({ code: 500, msg: "error" })).toEqual({
      nodes: [],
      links: [],
      warnings: [],
    });
  });

  it("handles missing node and link lists", () => {
    const result = normalizeTopologyResponse({ code: 0, data: { topo: {} } });

    expect(result.nodes).toEqual([]);
    expect(result.links).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it("drops nodes without ids and creates temporary link ids when needed", () => {
    const response: TopologyResponse = {
      code: 0,
      data: {
        topo: {
          node: [{ node_type: 8, node_location: "113,28" }],
          link: [
            {
              link_status: 1,
              src: { src_node: "source" },
              dst: { dst_node: "target" },
            },
          ],
        },
      },
    };

    const result = normalizeTopologyResponse(response);

    expect(result.nodes).toEqual([]);
    expect(result.links[0]?.id).toBe("source_target");
  });

  it("emits warnings when root summary counts mismatch", () => {
    const result = normalizeTopologyResponse({
      ...topologyFixture,
      summary: {
        node_count: 10,
        link_count: 20,
      },
    });

    expect(result.warnings).toEqual([
      { type: "node_count_mismatch", expected: 10, actual: 4 },
      { type: "link_count_mismatch", expected: 20, actual: 2 },
    ]);
  });

  it("overrides node type to drone and patches missing drone height in normalization", () => {
    const result = normalizeTopologyResponse(
      {
        code: 0,
        data: {
          topo: {
            node: [
              {
                node_id: "drone-node",
                node_type: 2,
                node_status: 1,
                node_location: "113.057538,28.663600,0",
                node_manage_ip_addr: "172.16.6.11",
              },
            ],
            link: [],
          },
        },
      },
      { droneDefaultHeight: 180 },
    );

    expect(result.nodes[0]).toMatchObject({
      id: "drone-node",
      type: DRONE_NODE_TYPE,
      height: 180,
      ipAddress: "172.16.6.11",
      hasValidLocation: true,
    });
  });

  it("keeps original height for drone nodes when parsed height is at least one meter", () => {
    const result = normalizeTopologyResponse({
      code: 0,
      data: {
        topo: {
          node: [
            {
              node_id: "drone-node-high",
              node_type: 4,
              node_status: 1,
              node_location: "113.057538,28.663600,12.5",
              node_manage_ip_addr: "172.16.7.20",
            },
          ],
          link: [],
        },
      },
    });

    expect(result.nodes[0]).toMatchObject({
      id: "drone-node-high",
      type: DRONE_NODE_TYPE,
      height: 12.5,
    });
  });

  it("keeps original node type for non-drone IP addresses", () => {
    const result = normalizeTopologyResponse(
      {
        code: 0,
        data: {
          topo: {
            node: [
              {
                node_id: "normal-node",
                node_type: 5,
                node_status: 1,
                node_location: "113.057538,28.663600,0",
                node_manage_ip_addr: "172.16.6.99",
              },
            ],
            link: [],
          },
        },
      },
      { groundDefaultHeight: 81 },
    );

    expect(result.nodes[0]).toMatchObject({
      id: "normal-node",
      type: 5,
      height: 81,
      ipAddress: "172.16.6.99",
    });
  });

  it("overrides node type to handheld backpack and applies ground default height", () => {
    const result = normalizeTopologyResponse({
      code: 0,
      data: {
        topo: {
          node: [
            {
              node_id: "handheld-node",
              node_type: 2,
              node_status: 1,
              node_location: "113.057538,28.663600,0",
              node_manage_ip_addr: "172.16.6.2",
            },
          ],
          link: [],
        },
      },
    });

    expect(result.nodes[0]).toMatchObject({
      id: "handheld-node",
      type: HANDHELD_BACKPACK_NODE_TYPE,
      height: 62,
      ipAddress: "172.16.6.2",
      hasValidLocation: true,
    });
  });

  it("checks drone rule before handheld backpack rule", () => {
    const result = normalizeTopologyResponse({
      code: 0,
      data: {
        topo: {
          node: [
            {
              node_id: "priority-node",
              node_type: 4,
              node_status: 1,
              node_location: "113.057538,28.663600,0",
              node_manage_ip_addr: "172.16.6.11",
            },
          ],
          link: [],
        },
      },
    });

    expect(result.nodes[0]).toMatchObject({
      id: "priority-node",
      type: DRONE_NODE_TYPE,
      height: 100,
    });
  });
});
