import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { prisma } from './database';
import { env } from './env';

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: env.jwt.secret,
    },
    async (payload: { userId: string }, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { id: true, role: true },
        });

        if (!user) return done(null, false);

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    },
  ),
);

export { passport };
