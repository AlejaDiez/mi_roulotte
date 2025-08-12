import type { Config } from "drizzle-kit";

export default {
    dialect: "sqlite",
    out: "src/db/migrations",
    schema: "src/db/schemas",
    ...(process.env.LOCAL_DB_PATH
        ? {
              dbCredentials: { url: process.env.LOCAL_DB_PATH }
          }
        : {
              driver: "d1-http",
              dbCredentials: {
                  databaseId: process.env.DB_ID!,
                  token: process.env.D1_TOKEN!,
                  accountId: process.env.CLOUDFLARE_ACCOUNT_ID!
              }
          })
} satisfies Config;
