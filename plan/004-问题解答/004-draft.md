# 问题

1. 在 @plan/plan/001-总体设计/001-final.md 总体设计中，有些东西要做成可以配置的。
    我看到根目录下有一个 @.env.example，这个文件在打包部署的过程中用到了吗？
    我运行测试的是使用下面的命令，手动传入的。打包成dist的时候呢？使用ngix部署之后呢？
    部署环境的VITE_TILESET_PROXY_TARGET和VITE_TOPOLOGY_PROXY_TARGET和我开发环境并不一致
    
    ```
    VITE_TILESET_URL=/3dtiles/tileset.json \
    VITE_TILESET_PROXY_TARGET=http://192.168.233.1:8080 \
    VITE_TOPOLOGY_URL=/topology \
    VITE_TOPOLOGY_PROXY_TARGET=http://127.0.0.1:8000 \
    npm run dev -- --host 0.0.0.0
    ```

2. 默认的端口是5173，那么打包出来的dist，使用ngix部署的时候，端口是多少？