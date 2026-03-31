export default () => ({
  app: {
    name: process.env.APP_NAME ?? 'tracker-bitacora-api',
    port: Number(process.env.PORT ?? 3000),
    env: process.env.NODE_ENV ?? 'development',
    apiPrefix: process.env.API_PREFIX ?? 'api',
  },
  database: {
    url:
      process.env.DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/tracker_bitacora',
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'change-this-secret-in-production',
    accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN ?? '*',
  },
});
