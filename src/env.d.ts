/// <reference types="astro/client-image" />

interface ImportMetaEnv {
    readonly PUBLIC_GOOGLE_KEY: string;
    readonly PUBLIC_DATABASE_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
