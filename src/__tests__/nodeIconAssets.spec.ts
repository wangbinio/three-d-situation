import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { NODE_TYPE_STYLES, UNKNOWN_NODE_TYPE_STYLE } from "@/config/nodeTypeStyle";

const GLB_MAGIC = 0x46546c67;
const GLB_VERSION = 2;
const JSON_CHUNK_TYPE = 0x4e4f534a;
const NODE_ICON_DIR = join(process.cwd(), "public/models/node-icons");

describe("node icon assets", () => {
  it("contains every configured model asset", () => {
    const assetNames = new Set(readdirSync(NODE_ICON_DIR));

    for (const style of [...NODE_TYPE_STYLES, UNKNOWN_NODE_TYPE_STYLE]) {
      const modelUriParts = style.modelUri.split("/");
      const modelName = modelUriParts[modelUriParts.length - 1];
      expect(assetNames.has(modelName!)).toBe(true);
    }
  });

  it("contains every configured SVG billboard asset", () => {
    for (const style of [...NODE_TYPE_STYLES, UNKNOWN_NODE_TYPE_STYLE]) {
      const iconPath = style.iconUri.replace("/models/node-icons/", "");
      const icon = readFileSync(join(NODE_ICON_DIR, iconPath), "utf8");

      expect(icon).toContain("<svg");
      expect(icon).toContain(style.name);
    }
  });

  it("uses GLB 2.0 JSON chunks that parse without null-byte trimming", () => {
    for (const assetName of readdirSync(NODE_ICON_DIR).filter((file) => file.endsWith(".glb"))) {
      const asset = readFileSync(join(NODE_ICON_DIR, assetName));
      const jsonChunkLength = asset.readUInt32LE(12);
      const jsonChunkType = asset.readUInt32LE(16);
      const jsonChunk = asset.subarray(20, 20 + jsonChunkLength);
      const jsonTail = [...jsonChunk.subarray(-4)];

      expect(asset.readUInt32LE(0)).toBe(GLB_MAGIC);
      expect(asset.readUInt32LE(4)).toBe(GLB_VERSION);
      expect(asset.readUInt32LE(8)).toBe(asset.length);
      expect(jsonChunkType).toBe(JSON_CHUNK_TYPE);
      expect(jsonTail).not.toContain(0);
      expect(JSON.parse(jsonChunk.toString("utf8"))).toMatchObject({
        asset: { version: "2.0" },
        materials: [{ doubleSided: true }],
      });
    }
  });
});
