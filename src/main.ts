import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import "cesium/Build/Cesium/Widgets/widgets.css";

// 配置 Cesium 静态资源基路径，后续 Viewer 初始化会依赖该路径加载 Workers 和 Assets。
function configureCesiumBaseUrl() {
  window.CESIUM_BASE_URL = "/cesium";
}

configureCesiumBaseUrl();

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");
