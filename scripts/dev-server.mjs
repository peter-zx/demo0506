import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = normalize(join(fileURLToPath(import.meta.url), "..", ".."));
const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "127.0.0.1";

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

async function sendSiteContent(response) {
  const sitePath = join(rootDir, "content", "site.json");
  const rawContent = (await readFile(sitePath, "utf8")).replace(/^\uFEFF/, "");
  const site = JSON.parse(rawContent);
  const publicSite = {
    ...site,
    posts: (site.posts || []).filter((item) => item.status !== "draft"),
    videos: (site.videos || []).filter((item) => item.status !== "draft")
  };

  response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(publicSite));
}

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || "/", `http://${request.headers.host}`);

    if (request.method === "GET" && requestUrl.pathname === "/health") {
      response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ status: "ok", app: "personal-portal", time: new Date().toISOString() }));
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/site") {
      await sendSiteContent(response);
      return;
    }

    const safePath = normalize(decodeURIComponent(requestUrl.pathname)).replace(/^(\.\.[/\\])+/, "");
    const filePath = join(rootDir, safePath === "/" ? "index.html" : safePath);

    if (!filePath.startsWith(rootDir)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    const fileStat = await stat(filePath);
    const finalPath = fileStat.isDirectory() ? join(filePath, "index.html") : filePath;
    const contentType = mimeTypes[extname(finalPath)] || "application/octet-stream";

    response.writeHead(200, { "Content-Type": contentType });
    createReadStream(finalPath)
      .on("error", (error) => {
        console.error("[jarvis] failed to read file", error);
        if (!response.headersSent) {
          response.writeHead(500);
        }
        response.end("Internal Server Error");
      })
      .pipe(response);
  } catch (error) {
    console.warn("[jarvis] request failed", error);
    response.writeHead(404);
    response.end("Not Found");
  }
});

server.listen(port, host, () => {
  console.log(`[jarvis] listening on http://${host}:${port}`);
});
