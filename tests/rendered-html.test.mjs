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
  assert.match(html, /<title>李博楠｜AI 视频编导 × AI Native Creator<\/title>/);
  assert.match(html, /让奇思妙想/);
  for (const course of ["幻象课", "咒语研习课", "魔法工艺课", "有求必应实践课"]) assert.match(html, new RegExp(course));
  assert.match(html, /魔法学徒/);
  assert.match(html, /id="hall"/);
  assert.match(html, /data-portrait="illusion"/);
  assert.match(html, /\/assets\/castle\/hall-wall\.png/);
  assert.equal((html.match(/id="hall"/g) ?? []).length, 1);
  assert.match(html, /layers\/door-left\.png/);
  assert.match(html, /layers\/door-right\.png/);
  assert.doesNotMatch(html, /MAKE IT REUSABLE|IMPACT &amp; EXPERIENCE|你的带路学长/);
  assert.match(html, /hero-wand-scroll\.mp4/);
  assert.match(html, /\/docs\/libonan-resume\.pdf/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
  assert.doesNotMatch(html, /BEYOND THE FRAME|life-[2-5]\.webp/);
});

test("removes the starter preview and preserves accessibility contracts", async () => {
  const [page, portfolio, layout, css, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/wizard-portfolio.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/wizard.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /<WizardPortfolio \/>/);
  assert.match(portfolio, /className="skip-link"/);
  assert.match(portfolio, /aria-label="主要导航"/);
  assert.match(portfolio, /hero-wand-scroll\.mp4/);
  assert.match(portfolio, /video\.currentTime = target/);
  assert.match(portfolio, /video\.duration - \.04/);
  assert.match(portfolio, /data-portrait/);
  assert.doesNotMatch(portfolio, /IMPACT & EXPERIENCE|className="impact"/);
  assert.match(portfolio, /onMouseEnter|onFocus/);
  assert.match(portfolio, /完整视频封面/);
  assert.match(portfolio, /width=\{405\}[\s\S]*height=\{720\}/);
  assert.match(portfolio, /boboli121\.github\.io\/weiwu-guandu/);
  assert.match(portfolio, /github\.com\/boboli121\/weiwu-guandu/);
  assert.match(portfolio, /weiwu-guandu-cover\.png/);
  assert.match(portfolio, /<dialog/);
  assert.match(portfolio, /showModal\(\)/);
  assert.match(portfolio, /popstate/);
  assert.match(portfolio, /hallPosition/);
  assert.match(portfolio, /prefers-reduced-motion|modal-open|Escape/);
  assert.match(layout, /李博楠｜AI 视频编导/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /wc-poster-wall[\s\S]*object-fit:\s*contain/);
  assert.match(css, /\[hidden\]/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.match(packageJson, /"gsap"/);

  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
  await assert.rejects(access(new URL("../app/_sites-preview/preview.css", import.meta.url)));
  await access(new URL("../public/docs/libonan-resume.pdf", import.meta.url));
  await access(new URL("../public/og.png", import.meta.url));
  await access(new URL("../public/media/hero-wand-scroll.mp4", import.meta.url));
  await access(new URL("../public/assets/video/hero-wand-poster.webp", import.meta.url));
  await access(new URL("../public/assets/guandu/weiwu-guandu-cover.png", import.meta.url));
  for (const scene of ["hall", "illusion", "spells", "craft", "curiosity"]) {
    await access(new URL(`../public/assets/castle/${scene}.png`, import.meta.url));
  }
  for (const film of ["tang", "duanwu", "newyear", "choose-hero"]) {
    await access(new URL(`../public/media/${film}.mp4`, import.meta.url));
    await access(new URL(`../public/assets/covers/${film}.webp`, import.meta.url));
  }
  await access(new URL("../app/CardSwap.tsx", import.meta.url));
  await access(new URL("../app/CardSwap.css", import.meta.url));
  await access(new URL("../components/ui/sterling-gate-kinetic-navigation.tsx", import.meta.url));
  await access(new URL("../components/ui/sterling-gate-kinetic-navigation.css", import.meta.url));
  await access(new URL("../components/ScrollStack.tsx", import.meta.url));
  await access(new URL("../components/MagicBento.tsx", import.meta.url));
  await access(new URL("../components/CountUp.tsx", import.meta.url));
  await access(new URL("../components/TiltedCard.tsx", import.meta.url));
});
