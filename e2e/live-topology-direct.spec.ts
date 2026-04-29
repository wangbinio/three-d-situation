import { expect, test } from "@playwright/test";

test.skip(
  process.env.LIVE_TOPOLOGY_DIRECT !== "1",
  "需要设置 LIVE_TOPOLOGY_DIRECT=1 才运行浏览器直连拓扑服务测试。",
);

test("browser fetches live topology service directly", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("toolbar-status")).toHaveText("已更新");
  await expect(page.getByTestId("toolbar-node-count")).not.toHaveText("0");
  await expect(page.getByTestId("toolbar-link-count")).not.toHaveText("0");
});
