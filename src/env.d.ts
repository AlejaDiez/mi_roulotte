type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
    interface Locals extends Runtime {}
}

interface ImportMetaEnv {
    CLOUDFLARE_ACCOUNT_ID: string;
    D1_TOKEN: string;
    DB_ID: string;
    EMAIL_TOKEN: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
