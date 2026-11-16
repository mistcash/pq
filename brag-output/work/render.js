// node render.js stills 0.5 2.2 ...   → stills/t<time>.png
// node render.js video out.mp4        → silent 1920×1080 30fps H.264
const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { chromium } = require("playwright");

const ROOT = __dirname;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".ttf": "font/ttf" };
const FPS = 30, FRAMES = 660;

const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]));
  if (!file.startsWith(ROOT) || !fs.existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(0, "127.0.0.1", r));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on("pageerror", e => console.error("pageerror:", e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
  await page.waitForFunction(() => window.ready === true, null, { timeout: 30000 });
  const [mode, ...args] = process.argv.slice(2);

  if (mode === "stills") {
    fs.mkdirSync(path.join(ROOT, "stills"), { recursive: true });
    for (const t of args) {
      await page.evaluate(t => seek(t), +t);
      await page.screenshot({ path: path.join(ROOT, "stills", `t${t}.png`) });
    }
  } else {
    const out = args[0] || path.join(ROOT, "silent.mp4");
    const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
      "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-r", String(FPS), out], { stdio: ["pipe", "inherit", "inherit"] });
    for (let i = 0; i < FRAMES; i++) {
      await page.evaluate(t => seek(t), i / FPS);
      const buf = await page.screenshot({ type: "png" });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
      if (i % 60 === 0) console.log(`frame ${i}/${FRAMES}`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on("close", r));
  }
  await browser.close();
  server.close();
})();
