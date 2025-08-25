type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
    interface Locals extends Runtime {}
}

interface ImportMetaEnv {
    // cloudflare
    CLOUDFLARE_ACCOUNT_ID: string;
    D1_TOKEN: string;
    R2_TOKEN: string;

    // google
    YOUTUBE_TOKEN: string;

    // resend
    EMAIL_TOKEN: string;

    // mi roulotte
    UNSUBSCRIBE_SECRET: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
