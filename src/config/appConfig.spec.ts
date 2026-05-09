import { describe, expect, it } from "vitest";

import { parseAppConfig } from "./appConfig";

describe("parseAppConfig", () => {
  it("uses stable defaults when env is empty", () => {
    const config = parseAppConfig({});

    expect(config.tilesetUrl).toBe("http://192.168.233.1:8080/3DTILES/tileset.json");
    expect(config.topologyUrl).toContain("/api/v1/network/topology/query");
    expect(config.pollIntervalMs).toBe(5000);
    expect(config.historyMaxPoints).toBe(720);
    expect(config.nodeIconScaleFactor).toBe(2);
    expect(config.nodeModelSwitchDistance).toBe(3000);
    expect(config.groundDefaultHeight).toBe(62);
    expect(config.droneDefaultHeight).toBe(100);
    expect(config.hideInvalidCoordinate).toBe(true);
  });

  it("accepts explicit valid env values", () => {
    const config = parseAppConfig({
      VITE_TILESET_URL: "http://example.test/tileset.json",
      VITE_TOPOLOGY_URL: "http://example.test/topology",
      VITE_TOPOLOGY_POLL_INTERVAL_MS: "3000",
      VITE_HISTORY_MAX_POINTS: "120",
      VITE_NODE_ICON_SCALE_FACTOR: "1.5",
      VITE_NODE_MODEL_SWITCH_DISTANCE: "4500",
      VITE_GROUND_DEFAULT_HEIGHT: "81.5",
      VITE_DRONE_DEFAULT_HEIGHT: "150",
      VITE_HIDE_INVALID_COORDINATE: "false",
    });

    expect(config).toEqual({
      tilesetUrl: "http://example.test/tileset.json",
      topologyUrl: "http://example.test/topology",
      pollIntervalMs: 3000,
      historyMaxPoints: 120,
      nodeIconScaleFactor: 1.5,
      nodeModelSwitchDistance: 4500,
      groundDefaultHeight: 81.5,
      droneDefaultHeight: 150,
      hideInvalidCoordinate: false,
    });
  });

  it("falls back when numeric values are invalid or too small", () => {
    const config = parseAppConfig({
      VITE_TOPOLOGY_POLL_INTERVAL_MS: "999",
      VITE_HISTORY_MAX_POINTS: "0",
      VITE_NODE_ICON_SCALE_FACTOR: "0",
      VITE_NODE_MODEL_SWITCH_DISTANCE: "0",
      VITE_GROUND_DEFAULT_HEIGHT: "-1",
      VITE_DRONE_DEFAULT_HEIGHT: "-1",
    });

    expect(config.pollIntervalMs).toBe(5000);
    expect(config.historyMaxPoints).toBe(720);
    expect(config.nodeIconScaleFactor).toBe(2);
    expect(config.nodeModelSwitchDistance).toBe(3000);
    expect(config.groundDefaultHeight).toBe(62);
    expect(config.droneDefaultHeight).toBe(100);
  });

  it("normalizes blank strings and boolean text safely", () => {
    const config = parseAppConfig({
      VITE_TILESET_URL: "   ",
      VITE_TOPOLOGY_URL: "   ",
      VITE_HIDE_INVALID_COORDINATE: "TRUE",
    });

    expect(config.tilesetUrl).toBe("http://192.168.233.1:8080/3DTILES/tileset.json");
    expect(config.topologyUrl).toContain("/api/v1/network/topology/query");
    expect(config.hideInvalidCoordinate).toBe(true);
  });
});
