import { defineConfig } from "astro/config";

export default defineConfig({
    outDir: "./build",
    site: "https://miroulotte.es",
    trailingSlash: "always",
    output: "static",
    scopedStyleStrategy: "where",
    build: {
        assets: "images",
    },
    server: {
        host: true,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
    },
    vite: {
        build: {
            assetsDir: "../assets",
            rollupOptions: {
                output: {
                    assetFileNames: (e) => {
                        const split = e.name.split(".");
                        const type = split[split.length - 1];

                        if (/css/i.test(type)) {
                            return "styles/style.[hash].css";
                        } else if (
                            /png|jpe?g|webp|svg|gif|tiff|bmp|ico/i.test(type)
                        ) {
                            return "images/[name][extname]";
                        }
                        return "/[name].[hash][extname]";
                    },
                    chunkFileNames: "scripts/script.[hash].js",
                    entryFileNames: "scripts/script.[hash].js",
                },
            },
        },
    },
});
