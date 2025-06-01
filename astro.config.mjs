// @ts-check
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import path from "node:path";

const style = /css/i;
const images = /\.(png|jpe?g|webp|svg|gif|tiff?|bmp|ico)$/i;
const audios = /\.(mp3|wav|ogg|flac|aac|m4a|wma)$/i;
const videos = /\.(mp4|webm|mov|avi|mkv|flv|wmv)$/i;

// https://astro.build/config
export default defineConfig({
    site: "https://miroulotte.es",
    trailingSlash: "ignore",
    output: "server",
    adapter: cloudflare({
        platformProxy: {
            enabled: true,
        },
        imageService: "cloudflare",
    }),
    outDir: "build",
    compressHTML: true,
    scopedStyleStrategy: "where",
    vite: {
        build: {
            assetsDir: "../assets",
            cssMinify: true,
            minify: true,
            rollupOptions: {
                output: {
                    assetFileNames: ({ names }) => {
                        const ext = names[0] ? path.extname(names[0]) : "";

                        if (style.test(ext)) return "styles/style.[hash].css";
                        if (images.test(ext)) return "images/[name][extname]";
                        if (audios.test(ext)) return "audios/[name][extname]";
                        if (videos.test(ext)) return "videos/[name][extname]";
                        return "[name].[hash][extname]";
                    },
                    chunkFileNames: "scripts/script.[hash].js",
                    entryFileNames: "scripts/script.[hash].js",
                },
            },
        },
        css: { transformer: "lightningcss" },
        plugins: [tailwindcss()],
    },
    server: {
        host: true,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
    },
    devToolbar: { enabled: false },
    i18n: {
        locales: ["es"],
        defaultLocale: "es",
    },
});
