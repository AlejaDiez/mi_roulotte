import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
    site: "https://miroulotte.es",
    trailingSlash: "ignore",
    output: "server",
    adapter: cloudflare({
        platformProxy: {
            enabled: true,
            configPath: "./wrangler.jsonc"
        },
        imageService: "cloudflare"
    }),
    outDir: "build",
    compressHTML: true,
    scopedStyleStrategy: "where",
    vite: {
        build: {
            assetsDir: "../assets",
            cssMinify: true,
            minify: true
        },
        css: { transformer: "lightningcss" },
        plugins: [tailwindcss()]
    },
    server: {
        host: true,
        headers: {
            "Access-Control-Allow-Origin": "*"
        }
    },
    devToolbar: { enabled: false },
    i18n: {
        locales: ["es"],
        defaultLocale: "es"
    }
});
