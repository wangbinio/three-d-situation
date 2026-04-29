# 问题解答

## 1. 先说结论

### 1.1 `.env.example` 会不会自动参与打包和部署

不会自动参与。

`/.env.example` 在当前项目中的作用是“示例模板”，告诉部署人员有哪些可用变量，不会在 `npm run build` 或 Nginx 部署时被自动读取。

当前项目真正使用环境变量的地方有两个：

- 前端业务配置读取 `import.meta.env.VITE_*`，见 `src/config/appConfig.ts`
- Vite 本地代理读取 `process.env.VITE_*_PROXY_TARGET`，见 `vite.config.ts`

因此，是否生效取决于以下几种方式之一：

- 你在命令行里临时传入变量
- 你在项目根目录放置 `.env`、`.env.local`、`.env.production` 等真实环境文件
- 你的 CI/CD 在构建命令执行前注入环境变量

`/.env.example` 本身不会被自动加载，也不会进入 `dist/`。

### 1.2 `VITE_TILESET_PROXY_TARGET` 和 `VITE_TOPOLOGY_PROXY_TARGET` 在什么阶段有用

这两个变量只对 Vite 提供的本地代理有用：

- `npm run dev`
- `npm run preview`

它们的作用是让 Vite 把浏览器请求的同源路径转发到真实后端：

- `/3dtiles/*` 转发到 `VITE_TILESET_PROXY_TARGET`
- `/topology` 转发到 `VITE_TOPOLOGY_PROXY_TARGET`

项目里的实现见 `vite.config.ts`：

- `server.proxy`
- `preview.proxy`

一旦你已经把前端打包成 `dist/` 并交给 Nginx 提供静态服务，浏览器访问时已经不经过 Vite，这两个变量就不再起作用。

### 1.3 `dist` 部署后端口是多少

`dist` 本身没有端口。

端口取决于“谁在提供这个静态目录”：

- `npm run dev` 默认端口通常是 `5173`
- `npm run preview` 默认端口通常是 `4173`
- `dist + Nginx` 时，端口由 Nginx 的 `listen` 决定，常见是 `80` 或 `443`

因此：

- `5173` 是开发服务器端口
- 不是生产部署端口
- Nginx 部署端口必须看 Nginx 配置

## 2. 两种可选部署方式

本项目可以用两种思路部署：

- 方案 A：前端使用同源路径，Nginx 反向代理真实后端
- 方案 B：前端直接写真实完整地址，浏览器直接访问后端

下面分别展开。

---

## 3. 方案 A：同源路径 + Nginx 反向代理

这是当前项目更推荐的方式。

### 3.1 适用场景

适用于以下情况：

- 开发环境和生产环境的后端地址不同
- 不希望前端代码里写死真实后端内网地址
- 不希望浏览器直接面对跨域问题
- 希望开发、联调、生产三阶段都使用统一的 URL 形式

这个方案的核心思想是：

- 前端永远请求同源路径，例如 `/3dtiles/tileset.json`、`/topology`
- 开发时由 Vite 代理
- 生产时由 Nginx 代理

前端代码不关心真实后端 IP 是什么。

### 3.2 配置方式

#### 开发环境

本地开发推荐这样启动：

```sh
VITE_TILESET_URL=/3dtiles/tileset.json \
VITE_TILESET_PROXY_TARGET=http://192.168.233.1:8080 \
VITE_TOPOLOGY_URL=/topology \
VITE_TOPOLOGY_PROXY_TARGET=http://127.0.0.1:8000 \
npm run dev -- --host 0.0.0.0
```

含义：

- 前端请求 `/3dtiles/tileset.json`
- Vite 把 `/3dtiles/*` 代理到 `http://192.168.233.1:8080/3DTILES/*`
- 前端请求 `/topology`
- Vite 把 `/topology` 代理到 `http://127.0.0.1:8000/topology`

这里：

- `VITE_TILESET_URL`、`VITE_TOPOLOGY_URL` 会进入前端构建配置
- `VITE_TILESET_PROXY_TARGET`、`VITE_TOPOLOGY_PROXY_TARGET` 只给 Vite 代理使用

#### 生产构建环境

生产构建时，应该继续保持同源路径，而不是写真实后端地址：

```sh
VITE_TILESET_URL=/3dtiles/tileset.json \
VITE_TOPOLOGY_URL=/topology \
VITE_TOPOLOGY_POLL_INTERVAL_MS=5000 \
VITE_HISTORY_MAX_POINTS=720 \
VITE_NODE_ICON_SCALE_FACTOR=2 \
VITE_HIDE_INVALID_COORDINATE=true \
npm run build
```

注意：

- 此时通常不需要传 `VITE_TILESET_PROXY_TARGET`
- 也不需要传 `VITE_TOPOLOGY_PROXY_TARGET`
- 因为 `dist` 上线后不会再经过 Vite 代理

构建完成后，`dist/` 中前端代码仍会请求：

- `/3dtiles/tileset.json`
- `/topology`

所以生产网关必须接住这两个路径。

#### 可选：使用 `.env.production`

如果不想在命令行里每次输入，可以创建真实的 `.env.production` 文件，例如：

```env
VITE_TILESET_URL=/3dtiles/tileset.json
VITE_TOPOLOGY_URL=/topology
VITE_TOPOLOGY_POLL_INTERVAL_MS=5000
VITE_HISTORY_MAX_POINTS=720
VITE_NODE_ICON_SCALE_FACTOR=2
VITE_HIDE_INVALID_COORDINATE=true
```

然后直接执行：

```sh
npm run build
```

这里强调一次：

- `.env.production` 会生效
- `.env.example` 不会自动生效

### 3.3 打包流程

推荐打包流程：

```sh
npm install
npm run type-check
npm run test:unit -- --run
VITE_TILESET_URL=/3dtiles/tileset.json \
VITE_TOPOLOGY_URL=/topology \
npm run build
```

产物说明：

- 前端静态文件输出到 `dist/`
- Cesium 静态资源会被复制到 `dist/cesium/`
- 浏览器运行时会从 `/cesium`、`/3dtiles`、`/topology` 这些路径取资源

### 3.4 Nginx 部署流程

#### 第一步：部署静态文件

把 `dist/` 整个目录复制到 Nginx 站点目录，例如：

```sh
rsync -av dist/ /srv/three-d-situation/
```

#### 第二步：配置 Nginx

下面是一个典型配置：

```nginx
server {
  listen 80;
  server_name _;

  root /srv/three-d-situation;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /cesium/ {
    try_files $uri $uri/ =404;
  }

  location /3dtiles/ {
    proxy_pass http://192.168.233.1:8080/3DTILES/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /topology {
    proxy_pass http://127.0.0.1:8000/topology;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

如果你的真实后端不是 `/topology`，而是完整查询接口，例如：

```text
http://192.168.2.1:8000/api/v1/network/topology/query?online_nodes_only=true&active_links_only=false&exclude_class_I=false&exclude_class_III=false&with_summary=true
```

那么建议把前端变量改成更稳定的同源路径，例如：

```env
VITE_TOPOLOGY_URL=/api/topology/query?online_nodes_only=true&active_links_only=false&exclude_class_I=false&exclude_class_III=false&with_summary=true
```

然后 Nginx 配成：

```nginx
location /api/topology/ {
  proxy_pass http://192.168.2.1:8000/api/v1/network/topology/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

这样更适合长期维护。

#### 第三步：重载 Nginx

```sh
nginx -t
systemctl reload nginx
```

### 3.5 方案 A 的端口说明

这个方案里端口有三层：

- 本地开发端口：Vite `5173`
- 本地预览端口：Vite preview `4173`
- 生产部署端口：Nginx `listen` 指定的端口，例如 `80` 或 `443`

前端打包后没有自己的端口。

### 3.6 方案 A 的优点

- 前端地址形式稳定，开发和生产一致
- 不需要浏览器跨域
- 不暴露真实后端地址给前端代码
- 开发环境和生产环境后端不一致时最好维护
- 最符合当前项目已有 README 和 `deploy-notes.md` 的思路

### 3.7 方案 A 的缺点

- 需要配置 Nginx 反向代理
- 部署人员必须同时理解前端和网关路径映射

---

## 4. 方案 B：前端直接写真实完整地址

这是更直接的方式，但一般不如方案 A 稳定。

### 4.1 适用场景

适用于以下情况：

- 后端已经稳定开启 CORS
- 前端允许暴露真实后端地址
- 部署环境不方便配置反向代理
- 只是临时联调或简单内网直连

这个方案的核心思想是：

- 前端直接请求真实地址
- 不依赖 Vite 代理
- 生产环境也不依赖 Nginx 代理 API

### 4.2 配置方式

#### 开发环境

如果后端已经允许跨域，可以直接这样启动：

```sh
VITE_TILESET_URL=http://192.168.233.1:8080/3DTILES/tileset.json \
VITE_TOPOLOGY_URL=http://127.0.0.1:8000/topology \
npm run dev -- --host 0.0.0.0
```

这时：

- 浏览器会直接请求 `http://192.168.233.1:8080/3DTILES/tileset.json`
- 浏览器会直接请求 `http://127.0.0.1:8000/topology`
- 不再需要 `VITE_TILESET_PROXY_TARGET`
- 不再需要 `VITE_TOPOLOGY_PROXY_TARGET`

前提是：

- 瓦片服务允许来自前端页面源的跨域访问
- 拓扑服务允许来自前端页面源的跨域访问

#### 生产构建环境

生产打包时，把真实地址直接写进去：

```sh
VITE_TILESET_URL=http://192.168.233.1:8080/3DTILES/tileset.json \
VITE_TOPOLOGY_URL=http://192.168.2.1:8000/api/v1/network/topology/query?online_nodes_only=true&active_links_only=false&exclude_class_I=false&exclude_class_III=false&with_summary=true \
VITE_TOPOLOGY_POLL_INTERVAL_MS=5000 \
VITE_HISTORY_MAX_POINTS=720 \
VITE_NODE_ICON_SCALE_FACTOR=2 \
VITE_HIDE_INVALID_COORDINATE=true \
npm run build
```

构建后，`dist/` 中的前端代码会直接请求这些完整地址。

#### 可选：使用 `.env.production`

可以创建真实 `.env.production`：

```env
VITE_TILESET_URL=http://192.168.233.1:8080/3DTILES/tileset.json
VITE_TOPOLOGY_URL=http://192.168.2.1:8000/api/v1/network/topology/query?online_nodes_only=true&active_links_only=false&exclude_class_I=false&exclude_class_III=false&with_summary=true
VITE_TOPOLOGY_POLL_INTERVAL_MS=5000
VITE_HISTORY_MAX_POINTS=720
VITE_NODE_ICON_SCALE_FACTOR=2
VITE_HIDE_INVALID_COORDINATE=true
```

然后执行：

```sh
npm run build
```

### 4.3 打包流程

推荐打包流程：

```sh
npm install
npm run type-check
npm run test:unit -- --run
VITE_TILESET_URL=http://192.168.233.1:8080/3DTILES/tileset.json \
VITE_TOPOLOGY_URL=http://192.168.2.1:8000/api/v1/network/topology/query?online_nodes_only=true&active_links_only=false&exclude_class_I=false&exclude_class_III=false&with_summary=true \
npm run build
```

### 4.4 Nginx 部署流程

#### 第一步：部署静态文件

把 `dist/` 复制到站点目录，例如：

```sh
rsync -av dist/ /srv/three-d-situation/
```

#### 第二步：配置 Nginx

这个方案下，Nginx 只负责前端静态文件，不需要代理后端接口：

```nginx
server {
  listen 80;
  server_name _;

  root /srv/three-d-situation;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /cesium/ {
    try_files $uri $uri/ =404;
  }
}
```

浏览器会直接向真实后端地址发请求。

### 4.5 方案 B 的额外要求

这个方案能否成功，关键不在前端，而在后端。

后端必须至少满足：

- 开启 CORS
- 允许前端页面所在源访问
- 正确返回 `Access-Control-Allow-Origin`
- 如果有鉴权或 Cookie，还要处理凭据策略

否则会出现：

- 开发能通，生产不能通
- 后端地址可 curl，但浏览器被 CORS 拦截
- 瓦片能加载，接口不能加载，或相反

### 4.6 方案 B 的端口说明

和方案 A 一样：

- `dist` 本身没有端口
- 最终端口仍由 Nginx 的 `listen` 决定
- 不同的是浏览器还会额外连接真实后端地址对应的端口，例如：
  - `8080`
  - `8000`

也就是说：

- 页面入口端口可能是 `80`
- 但浏览器还会直接访问后端 `8080` 和 `8000`

### 4.7 方案 B 的优点

- Nginx 配置更简单
- 不需要网关代理后端
- 适合临时联调和简单静态托管

### 4.8 方案 B 的缺点

- 强依赖后端 CORS
- 前端直接暴露真实后端地址
- 开发环境和生产环境地址差异更难管理
- 环境切换通常需要重新构建

---

## 5. 两种方案对比

| 维度 | 方案 A：同源路径 + Nginx 代理 | 方案 B：前端直连真实地址 |
| --- | --- | --- |
| 前端请求地址 | 固定同源路径 | 真实完整地址 |
| 是否依赖 Vite 代理 | 开发/preview 依赖 | 不依赖 |
| 生产是否依赖 Nginx 代理 | 依赖 | 不依赖 |
| 是否依赖后端 CORS | 基本不依赖 | 强依赖 |
| 是否暴露真实后端地址 | 不暴露 | 暴露 |
| 环境切换维护成本 | 较低 | 较高 |
| 适合本项目长期部署 | 更适合 | 次优 |

## 6. 推荐结论

对于当前项目，推荐使用方案 A。

原因：

- 项目本身已经在 `README.md` 和 `docs/deploy-notes.md` 中倾向同源路径思路
- `vite.config.ts` 已经内建了 `/3dtiles` 和 `/topology` 的代理逻辑
- 开发环境与生产环境后端地址不一致时，方案 A 最稳定
- 可以避免浏览器跨域问题
- 更方便把部署差异收敛到 Nginx，而不是收敛到前端代码

推荐落地口径：

- 开发环境：

```sh
VITE_TILESET_URL=/3dtiles/tileset.json \
VITE_TILESET_PROXY_TARGET=http://192.168.233.1:8080 \
VITE_TOPOLOGY_URL=/topology \
VITE_TOPOLOGY_PROXY_TARGET=http://127.0.0.1:8000 \
npm run dev -- --host 0.0.0.0
```

- 生产构建：

```sh
VITE_TILESET_URL=/3dtiles/tileset.json \
VITE_TOPOLOGY_URL=/topology \
npm run build
```

- 生产部署：
  - Nginx 提供 `dist/`
  - Nginx 代理 `/3dtiles`
  - Nginx 代理 `/topology`

## 7. 对问题 2 的直接回答

“默认端口是 5173，那么打包出来的 dist，使用 nginx 部署的时候，端口是多少？”

直接回答：

- 不是 `5173`
- `dist` 没有自己的端口
- Nginx 配置 `listen 80;` 就是 `80`
- Nginx 配置 `listen 443 ssl;` 就是 `443`
- Nginx 配置 `listen 8088;` 就是 `8088`

所以生产端口完全由 Nginx 决定，不由 Vite 决定。
