import { describe, expect, it } from "vitest";

import {
  DRONE_NODE_TYPE_STYLE,
  HANDHELD_BACKPACK_NODE_TYPE_STYLE,
  getNodeTypeStyle,
  NODE_TYPE_STYLES,
  UNKNOWN_NODE_TYPE_STYLE,
} from "./nodeTypeStyle";

describe("nodeTypeStyle", () => {
  it("defines all ten known node types", () => {
    expect(NODE_TYPE_STYLES).toHaveLength(10);
    expect(NODE_TYPE_STYLES.map((style) => style.type)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 30, 31]);
  });

  it("provides complete visual fields for each node type", () => {
    for (const style of NODE_TYPE_STYLES) {
      expect(style.name).not.toBe("");
      expect(style.shape).not.toBe("");
      expect(style.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(style.modelUri).toMatch(/^\/models\/node-icons\/.+\.glb$/);
      expect(style.iconUri).toMatch(/^\/models\/node-icons\/svg\/.+\.svg$/);
      expect(style.legendText).toContain(style.name);
      expect(style.scale).toBeGreaterThan(0);
      expect(style.brightnessBoost).toBeGreaterThan(0);
      expect(style.minimumPixelSize).toBeGreaterThan(0);
      expect(style.maximumScale).toBeGreaterThan(0);
      expect(style.heightOffset).toBeGreaterThanOrEqual(0);
      expect(typeof style.applyModelTint).toBe("boolean");
    }
  });

  it("resolves known node type styles", () => {
    expect(getNodeTypeStyle(1).name).toBe("一类设备终端");
    expect(getNodeTypeStyle(8).shape).toBe("菱形警示");
    expect(getNodeTypeStyle(1).applyModelTint).toBe(false);
    expect(getNodeTypeStyle(1).brightnessBoost).toBeGreaterThan(1);
    expect(getNodeTypeStyle(3).applyModelTint).toBe(false);
    expect(getNodeTypeStyle(30)).toBe(DRONE_NODE_TYPE_STYLE);
    expect(getNodeTypeStyle(30).brightnessBoost).toBeGreaterThan(1);
    expect(getNodeTypeStyle(30).applyModelTint).toBe(false);
    expect(getNodeTypeStyle(31)).toBe(HANDHELD_BACKPACK_NODE_TYPE_STYLE);
  });

  it("falls back for unknown node types", () => {
    expect(getNodeTypeStyle(999)).toBe(UNKNOWN_NODE_TYPE_STYLE);
  });
});
