import { describe, expect, it } from "vitest";

import { appendHistoryPoint } from "./topologyHistory";
import { NodeStatus, type SituationNode } from "./topologyTypes";

const baseNode: SituationNode = {
  id: "node-001",
  type: 8,
  status: NodeStatus.Online,
  longitude: 113.057538,
  latitude: 28.6636,
  height: 0,
  ipAddress: "192.168.2.1",
  raw: {},
  hasValidLocation: true,
};

describe("appendHistoryPoint", () => {
  it("appends a valid node location", () => {
    const history = appendHistoryPoint([], baseNode, 3, 1000);

    expect(history).toEqual([
      {
        longitude: 113.057538,
        latitude: 28.6636,
        height: 0,
        timestamp: 1000,
      },
    ]);
  });

  it("skips invalid node locations", () => {
    const history = appendHistoryPoint(
      [],
      {
        ...baseNode,
        hasValidLocation: false,
      },
      3,
      1000,
    );

    expect(history).toEqual([]);
  });

  it("skips duplicate positions", () => {
    const existingHistory = appendHistoryPoint([], baseNode, 3, 1000);
    const nextHistory = appendHistoryPoint(existingHistory, baseNode, 3, 2000);

    expect(nextHistory).toEqual(existingHistory);
  });

  it("skips positions whose longitude, latitude and height changes are all below threshold", () => {
    const existingHistory = appendHistoryPoint([], baseNode, 3, 1000);
    const nextHistory = appendHistoryPoint(
      existingHistory,
      {
        ...baseNode,
        longitude: baseNode.longitude + 0.5e-6,
        latitude: baseNode.latitude - 0.5e-6,
        height: baseNode.height + 0.05,
      },
      3,
      2000,
    );

    expect(nextHistory).toEqual(existingHistory);
  });

  it("appends positions when height change exceeds the threshold", () => {
    const existingHistory = appendHistoryPoint([], baseNode, 3, 1000);
    const nextHistory = appendHistoryPoint(
      existingHistory,
      {
        ...baseNode,
        height: baseNode.height + 0.1001,
      },
      3,
      2000,
    );

    expect(nextHistory).toHaveLength(2);
  });

  it("appends positions when longitude change exceeds 1e-6 threshold", () => {
    const existingHistory = appendHistoryPoint([], baseNode, 3, 1000);
    const nextHistory = appendHistoryPoint(
      existingHistory,
      {
        ...baseNode,
        longitude: baseNode.longitude + 1.1e-6,
      },
      3,
      2000,
    );

    expect(nextHistory).toHaveLength(2);
  });

  it("trims history to the configured max points", () => {
    const firstHistory = appendHistoryPoint([], baseNode, 2, 1000);
    const secondHistory = appendHistoryPoint(
      firstHistory,
      { ...baseNode, longitude: 113.0576 },
      2,
      2000,
    );
    const thirdHistory = appendHistoryPoint(
      secondHistory,
      { ...baseNode, longitude: 113.0577 },
      2,
      3000,
    );

    expect(thirdHistory).toHaveLength(2);
    expect(thirdHistory[0]?.longitude).toBe(113.0576);
    expect(thirdHistory[1]?.longitude).toBe(113.0577);
  });
});
