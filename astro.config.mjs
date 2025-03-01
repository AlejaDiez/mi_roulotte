import { defineConfig } from "astro/config";
import path from "path";

export default defineConfig({
    site: "https://miroulotte.es",
    trailingSlash: "always",
    output: "static",
    outDir: "./build",
    scopedStyleStrategy: "where",
    vite: {
        build: {
            assetsDir: "../assets",
            compressHTML: true,
            cssMinify: true,
            minify: true,
            rollupOptions: {
                output: {
                    assetFileNames: ({ names }) => {
                        const { ext } = path.parse(names[0]);

                        // Styles
                        if (/css/i.test(ext)) {
                            return "styles/style.[hash].css";
                        }
                        // Images
                        if (/png|jpe?g|webp|svg|gif|tiff|bmp|ico/i.test(ext)) {
                            return "images/[name][extname]";
                        }
                        // Default
                        return "/[name].[hash][extname]";
                    },
                    chunkFileNames: "scripts/script.[hash].js",
                    entryFileNames: "scripts/script.[hash].js",
                },
            },
        },
    },
    build: {
        assets: "images",
        inlineStylesheets: "never",
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
