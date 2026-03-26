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
});
