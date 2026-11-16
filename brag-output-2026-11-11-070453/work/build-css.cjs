// Compiles the Tailwind v4 classes used by the composition into composition/assets/css/app.css,
// with the pinned browser runtime, so renders need no runtime compile. Run after changing classes:
//   node work/build-css.cjs
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const comp = path.join(__dirname, "../composition");
const files = ["index.html", ...fs.readdirSync(path.join(comp, "compositions")).map(f => `compositions/${f}`)];
const markup = files.map(f => fs.readFileSync(path.join(comp, f), "utf8").replace(/<script[\s\S]*?<\/script>/g, "")).join("\n");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(`<!doctype html><html><head>
<style type="text/tailwindcss">@theme { --font-sans: "Fredoka", ui-sans-serif, sans-serif; --font-mono: "IBM Plex Mono", monospace; }</style>
<script>${fs.readFileSync(path.join(__dirname, "tailwind-4.2.4.js"), "utf8")}</script>
</head><body><template id="t"></template></body></html>`);
  // Class names only need to be in the DOM; templates' contents are inert, so mount them in a hidden div.
  await page.evaluate(html => {
    const d = document.createElement("div");
    d.hidden = true;
    d.innerHTML = html.replace(/<\/?template>/g, "");
    document.body.appendChild(d);
  }, markup);
  const css = await page.waitForFunction(
    () => [...document.querySelectorAll("style")].map(s => s.textContent).find(t => t.includes("tailwindcss v") && t.includes(".rounded-full")),
    null,
    { timeout: 20000 },
  );
  // Preflight's mono fallback names fonts the renderer can't supply; --font-mono above is what applies.
  const out = (await css.jsonValue()).replace(/var\(--default-mono-font-family,[^)]*\)/g, "var(--default-mono-font-family, monospace)");
  fs.writeFileSync(path.join(comp, "assets/css/app.css"), out);
  await browser.close();
  console.log("wrote assets/css/app.css");
})();
