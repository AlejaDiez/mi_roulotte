type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
    interface Locals extends Runtime {}
}

interface ImportMetaEnv {}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
