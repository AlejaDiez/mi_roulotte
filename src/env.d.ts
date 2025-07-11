type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

interface ImportMetaEnv {
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare namespace App {
    interface Locals extends Runtime {}
}
