import { expect, test } from "@playwright/test";

const topologyFixture = {
  code: 0,
  msg: "ok",
  summary: {
    node_count: 4,
    link_count: 2,
  },
  data: {
    topo: {
      node: [
        {
          node_id: "node-001",
          node_type: 8,
          node_status: 1,
          node_location: "113.057538,28.663600",
          node_manage_ip_addr: "192.168.2.1",
        },
        {
          node_id: "node-002",
          node_type: 5,
          node_status: 1,
          node_location: "113.057471,28.663652,12.5",
          node_manage_ip_addr: "192.168.2.24",
        },
        {
          node_id: "node-invalid-location",
          node_type: 4,
          node_status: 1,
          node_location: "0.0,0.0",
          node_manage_ip_addr: "192.168.2.12",
        },
        {
          node_id: "node-unknown-type",
          node_type: 99,
          node_status: 0,
          node_location: "113.057664,28.663771",
        },
      ],
      link: [
        {
          link_id: "link-001",
          link_status: 1,
          src: {
            src_node: "node-001",
          },
          dst: {
            dst_node: "node-002",
          },
        },
        {
          link_id: "link-002",
          link_status: 0,
          src: {
            src_node: "node-002",
          },
          dst: {
            dst_node: "node-unknown-type",
          },
        },
      ],
    },
  },
};

test("renders topology data from mocked API with display toggles", async ({
  page,
}) => {
  const renderErrors: string[] = [];
  page.on("console", (message) => {
    if (/shader compile|Fragment shader|Vertex shader|WebGL.*error/i.test(message.text())) {
      renderErrors.push(message.text());
    }
  });

  let requestCount = 0;

  await page.route(
    /.*(api\/v1\/network\/topology\/query|topology).*/,
    async (route) => {
      requestCount += 1;

      if (requestCount === 1) {
        await route.fulfill({
          contentType: "application/json",
          json: topologyFixture,
        });
        return;
      }

      await route.fulfill({
        contentType: "application/json",
        status: 500,
        body: JSON.stringify({ code: 500, msg: "mock failed" }),
      });
    },
  );

  await page.goto("/");

  await expect(page.getByTestId("situation-page")).not.toContainText(
    "三维态势展示",
  );
  await expect(page.getByTestId("legend-panel")).not.toContainText("目标类型图标");
  await expect(page.getByTestId("legend-panel")).not.toContainText("8 类");
  await expect(page.getByTestId("legend-panel")).toContainText("III类设备");

  const viewportSize = page.viewportSize();
  const legendBox = await page.getByTestId("legend-panel").boundingBox();
  expect(viewportSize).not.toBeNull();
  expect(legendBox).not.toBeNull();
  expect(legendBox!.x + legendBox!.width).toBeGreaterThan(viewportSize!.width - 40);
  expect(legendBox!.y).toBeLessThan(40);

  await expect(page.getByTestId("toolbar-node-count")).toHaveText("4");
  await expect(page.getByTestId("toolbar-link-count")).toHaveText("1");
  await expect(page.getByTestId("toolbar-status")).toHaveText("已更新");

  await expect(page.getByRole("button", { name: "手动刷新" })).toHaveCount(0);
  await expect(page.getByTestId("toolbar-show-histories")).toBeChecked();
  await expect(page.getByTestId("toolbar-show-links")).toBeChecked();
  expect(renderErrors).toEqual([]);
});
