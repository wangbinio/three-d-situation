import { expect, test, type Route } from "@playwright/test";

const liveTopologyUrl = process.env.LIVE_TOPOLOGY_URL;

test.skip(
  liveTopologyUrl === undefined,
  "需要设置 LIVE_TOPOLOGY_URL 才运行真实拓扑服务联调。",
);

test("renders data from live topology service", async ({ page, request }) => {
  const response = await request.get(liveTopologyUrl!);
  expect(response.ok()).toBeTruthy();

  const topology = await response.json();
  const nodes = topology?.data?.topo?.node ?? [];
  const links = topology?.data?.topo?.link ?? [];
  const activeLinks = links.filter(
    (link: { link_status?: number }) => link.link_status === 1,
  );

  async function fulfillWithLiveTopology(route: Route) {
    await route.fulfill({
      contentType: "application/json",
      json: topology,
    });
  }

  await page.route(liveTopologyUrl!, fulfillWithLiveTopology);
  await page.route("**/topology", fulfillWithLiveTopology);

  await page.goto("/");

  await expect(page.getByTestId("situation-page")).not.toContainText(
    "三维态势展示",
  );
  await expect(page.getByTestId("toolbar-node-count")).toHaveText(
    String(nodes.length),
  );
  await expect(page.getByTestId("toolbar-link-count")).toHaveText(
    String(activeLinks.length),
  );
  await expect(page.getByTestId("toolbar-status")).toHaveText("已更新");
});
