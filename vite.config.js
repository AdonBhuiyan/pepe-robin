import { extname, resolve } from "node:path";

import { defineConfig } from "vite";
import { readFile } from "node:fs/promises";

/**
 * Dev server only: unknown page URLs (e.g. /dfdf) get 404.html with a real
 * 404 status, instead of Vite's default fallback to index.html.
 * Assets, Vite internals, "/" and "/index.html" are left alone.
 */
function dev404Page() {
  return {
    name: "dev-404-page",
    configureServer(server) {
      // returned function = "post" middleware, runs before Vite's index.html fallback
      return () => {
        server.middlewares.use(async (req, res, next) => {
          try {
            if (req.method !== "GET" && req.method !== "HEAD") return next();
            if (!(req.headers.accept || "").includes("text/html")) return next();

            const { pathname } = new URL(req.url, "http://localhost");
            const isKnownPage = pathname === "/" || pathname.endsWith("/index.html");
            if (isKnownPage || extname(pathname)) return next(); // files like /404.html, /favicon.png

            let html = await readFile(resolve(server.config.root, "404.html"), "utf-8");
            html = await server.transformIndexHtml(req.url, html);
            res.statusCode = 404;
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.end(html);
          } catch (err) {
            next(err);
          }
        });
      };
    },
  };
}

export default defineConfig({
  appType: "mpa",
  plugins: [dev404Page()],
  build: {
    // Vite 8 (Rolldown): rolldownOptions replaces the deprecated rollupOptions
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        notFound: resolve(import.meta.dirname, "404.html"),
      },
    },
  },
});
