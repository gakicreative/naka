// Tipagem do contexto Hono para Node.js standalone
// Env vars lidas via process.env — sem bindings de plataforma

export type Env = {
  Bindings: Record<string, never>;
  Variables: {
    userId: string;
    userRole: string;
    orgId: string;
  };
};
