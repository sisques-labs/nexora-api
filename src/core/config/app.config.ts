import { registerAs } from '@nestjs/config';

import { resolveCorsOrigins } from './cors-origins';

export const appConfig = registerAs('app', () => ({
  name: process.env.SERVICE_NAME?.trim() || 'nexora-api',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  corsOrigins: resolveCorsOrigins({
    CORS_ORIGINS: process.env.CORS_ORIGINS,
    FRONTEND_URL: process.env.FRONTEND_URL,
    NODE_ENV: process.env.NODE_ENV,
  }),
}));
