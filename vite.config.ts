import {
  createReadStream,
  cpSync,
  existsSync,
  rmSync,
  statSync,
} from "node:fs";
import { extname, normalize, sep } from "node:path";
import { fileURLToPath, URL } from "node:url";

import { defineConfig, type Plugin, type ProxyOptions } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import vueDevTools from "vite-plugin-vue-devtools";

const topologyProxyTarget = process.env.VITE_TOPOLOGY_PROXY_TARGET;
const tilesetProxyTarget = process.env.VITE_TILESET_PROXY_TARGET;

// 在 dev/build 下提供 Cesium 静态资源，保证 /cesium 与 window.CESIUM_BASE_URL 一致。
function copyCesiumStaticAssets(): Plugin {
  const sourcePath = fileURLToPath(
    new URL("./node_modules/cesium/Build/Cesium", import.meta.url),
  );

  return {
    name: "serve-and-copy-cesium-static-assets",
    configureServer(server) {
      server.middlewares.use("/cesium", (request, response, next) => {
        const requestUrl = request.url ?? "/";
        const rawPath = decodeURIComponent(requestUrl.split("?")[0] ?? "/");
        const requestPath = rawPath.startsWith("/cesium/")
          ? rawPath.replace(/^\/cesium/, "")
          : rawPath;
        const normalizedPath = normalize(requestPath).replace(
          /^(\.\.[/\\])+/,
          "",
        );
        const filePath = normalize(`${sourcePath}${sep}${normalizedPath}`);

        if (
          !filePath.startsWith(`${sourcePath}${sep}`) ||
          !existsSync(filePath)
        ) {
          next();
          return;
        }

        const fileStat = statSync(filePath);
        if (!fileStat.isFile()) {
          next();
          return;
        }

        response.setHeader("Content-Type", getCesiumStaticMimeType(filePath));
        createReadStream(filePath).pipe(response);
      });
    },
    closeBundle() {
      const targetPath = fileURLToPath(
        new URL("./dist/cesium", import.meta.url),
      );

      if (!existsSync(sourcePath)) {
        return;
      }

      rmSync(targetPath, { recursive: true, force: true });
      cpSync(sourcePath, targetPath, { recursive: true });
    },
  };
}

// 为 Cesium dev 静态资源补齐常见 MIME，避免 Vite fallback 把 JSON 当 HTML 返回。
function getCesiumStaticMimeType(filePath: string): string {
  switch (extname(filePath).toLowerCase()) {
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".wasm":
      return "application/wasm";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

// 生成本地接口代理配置，用于后端资源未开启 CORS 时的同源联调。
function createDevProxy() {
  const proxy: Record<string, string | ProxyOptions> = {};

  if (
    topologyProxyTarget !== undefined &&
    topologyProxyTarget.trim().length > 0
  ) {
    proxy["/topology"] = {
      target: topologyProxyTarget,
      changeOrigin: true,
    };
  }

  if (
    tilesetProxyTarget !== undefined &&
    tilesetProxyTarget.trim().length > 0
  ) {
    proxy["/3dtiles"] = {
      target: tilesetProxyTarget,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/3dtiles/, "/3DTILES"),
    };
  }

  return Object.keys(proxy).length > 0 ? proxy : undefined;
}

const devProxy = createDevProxy();

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), vueDevTools(), copyCesiumStaticAssets()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: devProxy,
  },
  preview: {
    proxy: devProxy,
  },
});
