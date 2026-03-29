import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { eq } from 'drizzle-orm';
import { db, users, invitations } from './db.js';

const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID     || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_CALLBACK_URL  = process.env.GOOGLE_CALLBACK_URL  || 'http://localhost:3000/api/auth/google/callback';

// ── Validação das variáveis de ambiente ──────────────────────────────────────
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error('❌ GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET são obrigatórias para OAuth.');
  console.error('   Configure estas variáveis no Railway → Variables.');
} else {
  console.log('✅ Google OAuth configurado');
  console.log('   CALLBACK_URL:', GOOGLE_CALLBACK_URL);

  passport.use(
    new GoogleStrategy(
      {
        clientID:          GOOGLE_CLIENT_ID,
        clientSecret:      GOOGLE_CLIENT_SECRET,
        callbackURL:       GOOGLE_CALLBACK_URL,
        passReqToCallback: true,
      },
      async (req, _accessToken, _refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email    = (profile.emails?.[0]?.value || '').toLowerCase().trim();
          const name     = profile.displayName || email.split('@')[0];

          console.log(`[OAuth] Tentativa de login: ${email} (googleId: ${googleId})`);

          // 1. Usuário já existe com esse google_id
          const [byGoogleId] = await db.select().from(users).where(eq(users.googleId, googleId));
          if (byGoogleId) {
            console.log(`[OAuth] Usuário encontrado por google_id: ${email}`);
            return done(null, byGoogleId);
          }

          // 2. Usuário já existe com o mesmo email (associa google_id)
          const [byEmail] = await db.select().from(users).where(eq(users.email, email));
          if (byEmail) {
            console.log(`[OAuth] Usuário encontrado por email, vinculando google_id: ${email}`);
            await db.update(users)
              .set({ googleId })
              .where(eq(users.id, byEmail.id));
            return done(null, { ...byEmail, googleId });
          }

          // 3. Novo usuário — precisa de convite válido
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const inviteId = (req as any).session?.oauthInviteId as string | undefined;
          console.log(`[OAuth] Novo usuário sem conta. inviteId da session: ${inviteId || 'NENHUM'}`);

          if (!inviteId) {
            return done(null, false, { message: 'invite_required' });
          }

          const [invite] = await db.select().from(invitations).where(eq(invitations.id, inviteId));
          if (!invite || invite.used) {
            return done(null, false, { message: 'invite_invalid' });
          }

          // Cria o usuário com a role do convite
          const id   = crypto.randomUUID();
          const role = invite.role;
          console.log(`[OAuth] Criando novo usuário ${email} com role: ${role}`);

          await db.insert(users).values({
            id,
            email,
            name,
            googleId,
            passwordHash: null,
            role,
          });

          // Marca convite como usado
          await db.update(invitations)
            .set({ used: true, usedBy: email, usedAt: new Date().toISOString() })
            .where(eq(invitations.id, inviteId));

          const [newUser] = await db.select().from(users).where(eq(users.id, id));
          return done(null, newUser);
        } catch (err) {
          console.error('[OAuth] Erro inesperado na strategy:', err);
          return done(err as Error);
        }
      }
    )
  );
}

// Passport session serialization (mínima — usamos JWT como auth principal)
passport.serializeUser((user: Express.User, done) => {
  done(null, (user as { id: string }).id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    done(null, user || null);
  } catch (err) {
    done(err);
  }
});

export default passport;
