# Lessons

- 后端响应字段层级必须以用户确认和真实接口约定为准；涉及 `summary` 这类校验字段时，先确认其与 `code`、`data` 的同级关系，避免误写为 `data.summary`。
- 使用playwright进行完整测试
- 视觉类验收不能只看 DOM 或接口状态；必须保留 Playwright 截图并人工观察地图、目标、轨迹、链路是否真实出现在画面中。
- Network 面板显示 200 不代表资源内容正确；遇到 Cesium 黑屏要检查 JSON/wasm/图片的 Content-Type 和响应前缀，警惕 Vite fallback 把静态资源返回成 `index.html`。
- 当前环境禁止通过 `exec_command` 包裹 `apply_patch` 执行编辑；后续文件修改必须使用可用的专用编辑工具，避免触发工具约束警告。
- 自生成 GLB 资产必须遵守 GLB 2.0 padding 规则：JSON chunk 用空格填充，不能用空字节；基础几何模型建议设置 `doubleSided=true`，并用资产测试覆盖模型存在性、头部长度、JSON 直解析和材质字段，避免不同电脑解析兼容性问题。
- Cesium 渲染路径变更后必须用真实浏览器检查控制台 WebGL/shader 错误；使用 Billboard 时不要强制 `requestWebgl1=true`，否则部分 Cesium 着色器会在 WebGL1 下因 `flat` 关键字编译失败导致黑屏。
- 为修复局部 GLB 模型亮度问题时，不要直接改 `scene.light` 这类全局场景光照；它会同时影响 3D Tiles/底图，可能把整幅场景压成黑屏。优先使用模型级别的 `lightColor`、`imageBasedLightingFactor` 和谨慎的颜色混合参数。
- 当用户已经把问题精确定位到某一行参数时，先围绕该参数做最小验证和官方文档核对，不要先把排查面扩散到整套场景配置。
- 当用户把复杂业务规则收敛成“归一化阶段一次覆盖”的简化口径时，后续方案和审查都应优先围绕单一落点展开，不要继续围绕历史轨迹阶段、距离阈值阶段做过度设计。
- 当新增第二个及以上“按 IP 识别的特殊类型”时，必须先确认特殊类型之间的判定优先级，并检查是否误把上一个特殊类型的附加规则复制到新类型上。
