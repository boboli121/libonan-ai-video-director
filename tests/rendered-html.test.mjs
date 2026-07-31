import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the finished portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>李博楠｜AI 视频编导<\/title>/);
  assert.match(html, /让奇思妙想/);
  assert.match(html, /端午粽子/);
  assert.match(html, /唐风浩荡/);
  assert.match(html, /MAKE IT REUSABLE/);
  assert.match(html, /\/docs\/libonan-resume\.pdf/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("removes the starter preview and preserves accessibility contracts", async () => {
  const [page, portfolio, layout, css, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/portfolio.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /<Portfolio \/>/);
  assert.match(portfolio, /className="skip-link"/);
  assert.match(portfolio, /aria-modal="true"/);
  assert.match(portfolio, /prefers-reduced-motion|modal-open|Escape/);
  assert.match(layout, /李博楠｜AI 视频编导/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /overflow-x:\s*clip/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
  await assert.rejects(access(new URL("../app/_sites-preview/preview.css", import.meta.url)));
  await access(new URL("../public/docs/libonan-resume.pdf", import.meta.url));
  await access(new URL("../public/og.png", import.meta.url));
});
