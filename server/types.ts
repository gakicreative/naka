// Tipagem dos bindings do Cloudflare Worker
// DB = D1Database, BUCKET = R2Bucket (definidos pelo wrangler.toml)

export type Env = {
  Bindings: {
    DB: D1Database;
    BUCKET: R2Bucket;
    ASSETS: Fetcher;           // binding dos arquivos estáticos (dist/)
    JWT_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_CALLBACK_URL: string;
    ADMIN_EMAIL: string;
  };
  Variables: {
    userId: string;
    userRole: string;
  };
};
