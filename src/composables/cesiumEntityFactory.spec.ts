import { describe, expect, it } from "vitest";
import { Color, ColorMaterialProperty, HorizontalOrigin, PolylineDashMaterialProperty, VerticalOrigin } from "cesium";

import { normalizeTopologyResponse } from "@/domain/topologyParser";
import { appendHistoryPoint } from "@/domain/topologyHistory";
import { topologyFixture } from "@/test/fixtures/topology";

import {
  createLinkEntityOptions,
  createNodeEntityOptions,
  createTrackEntityOptions,
  LINK_ENTITY_PREFIX,
  NODE_ENTITY_PREFIX,
  TRACK_ENTITY_PREFIX,
} from "./cesiumEntityFactory";

const normalizedTopology = normalizeTopologyResponse(topologyFixture);
const nodeById = new Map(
  normalizedTopology.nodes.map((node) => [node.id, node]),
);

describe("cesiumEntityFactory", () => {
  it("creates node billboard options for valid locations", () => {
    const node = normalizedTopology.nodes[0]!;
    const options = createNodeEntityOptions(node);

    expect(options).toMatchObject({
      id: `${NODE_ENTITY_PREFIX}${node.id}`,
      name: "III类设备",
      show: true,
      properties: {
        kind: "node",
        nodeId: node.id,
      },
    });
    expect(options?.position).toBeDefined();
    expect(options?.point).toBeUndefined();
    expect(options?.model).toBeUndefined();
    expect(options?.billboard).toMatchObject({
      image: "/models/node-icons/svg/III类设备.svg",
      width: 48,
      height: 48,
      scale: 1,
      color: Color.WHITE,
      horizontalOrigin: HorizontalOrigin.CENTER,
      verticalOrigin: VerticalOrigin.BOTTOM,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    });
  });

  it("does not create node options for invalid locations", () => {
    const invalidNode = nodeById.get("node-invalid-location")!;

    expect(createNodeEntityOptions(invalidNode)).toBeNull();
  });

  it("emphasizes selected node without changing type color", () => {
    const node = normalizedTopology.nodes[0]!;
    const options = createNodeEntityOptions(node, true);

    expect(options?.billboard).toMatchObject({
      scale: 1.18,
      color: Color.WHITE,
    });
  });

  it("dims offline nodes while keeping the unknown icon", () => {
    const node = nodeById.get("node-unknown-type")!;
    const options = createNodeEntityOptions(node);

    expect(options?.billboard).toMatchObject({
      image: "/models/node-icons/svg/未知类型.svg",
      color: Color.fromCssColorString("#596579"),
    });
  });

  it("creates track options and hides short tracks", () => {
    const node = normalizedTopology.nodes[0]!;
    const onePointHistory = appendHistoryPoint([], node, 720, 1000);
    const twoPointHistory = appendHistoryPoint(
      onePointHistory,
      { ...node, longitude: node.longitude + 0.0001 },
      720,
      2000,
    );

    const hiddenTrack = createTrackEntityOptions(node, onePointHistory);
    const visibleTrack = createTrackEntityOptions(node, twoPointHistory);

    expect(hiddenTrack).toMatchObject({
      id: `${TRACK_ENTITY_PREFIX}${node.id}`,
      show: false,
    });
    expect(hiddenTrack?.polyline?.material).toBeInstanceOf(
      ColorMaterialProperty,
    );
    expect(visibleTrack).toMatchObject({
      id: `${TRACK_ENTITY_PREFIX}${node.id}`,
      show: true,
      polyline: {
        width: 1,
      },
    });
    expect(visibleTrack?.polyline?.positions).toHaveLength(2);
  });

  it("creates dashed active link options only when endpoints are renderable", () => {
    const activeLink = normalizedTopology.links[0]!;
    const inactiveLink = normalizedTopology.links[1]!;

    const activeOptions = createLinkEntityOptions(activeLink, nodeById);
    const inactiveOptions = createLinkEntityOptions(inactiveLink, nodeById);

    expect(activeOptions).toMatchObject({
      id: `${LINK_ENTITY_PREFIX}${activeLink.id}`,
      show: true,
      properties: {
        kind: "link",
        linkId: activeLink.id,
      },
    });
    expect(activeOptions?.polyline?.positions).toHaveLength(2);
    expect(activeOptions?.polyline?.width).toBe(1);
    expect(activeOptions?.polyline?.material).toBeInstanceOf(
      PolylineDashMaterialProperty,
    );
    expect(inactiveOptions).toBeNull();
  });
});
