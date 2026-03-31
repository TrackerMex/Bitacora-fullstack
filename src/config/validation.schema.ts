import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  APP_NAME: Joi.string().default('tracker-bitacora-api'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api'),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .optional(),
  REDIS_URL: Joi.string()
    .uri({ scheme: ['redis'] })
    .optional(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  CORS_ORIGIN: Joi.string().default('*'),
});
