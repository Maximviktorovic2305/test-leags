type Environment = Record<string, string | undefined>;

const requiredVariables = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
] as const;

export function validateEnvironment(config: Environment): Environment {
  for (const variable of requiredVariables) {
    if (!config[variable]) {
      throw new Error(`${variable} environment variable is required`);
    }
  }

  for (const secret of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const) {
    if ((config[secret]?.length ?? 0) < 32) {
      throw new Error(`${secret} must contain at least 32 characters`);
    }
  }
  if (config.JWT_ACCESS_SECRET === config.JWT_REFRESH_SECRET) {
    throw new Error('JWT access and refresh secrets must be different');
  }

  if (
    config.COOKIE_SECURE &&
    !['true', 'false'].includes(config.COOKIE_SECURE.toLowerCase())
  ) {
    throw new Error('COOKIE_SECURE must be true or false');
  }

  const port = Number(config.PORT ?? 3078);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT must be a positive integer');
  }

  const positiveIntegerDefaults = {
    RATE_LIMIT_TTL_MS: 60_000,
    RATE_LIMIT_MAX: 100,
    RATE_LIMIT_BLOCK_MS: 60_000,
  } as const;
  const normalizedRateLimitConfig: Record<string, string> = {};
  for (const [variable, defaultValue] of Object.entries(
    positiveIntegerDefaults,
  )) {
    const value = Number(config[variable] ?? defaultValue);
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error(`${variable} must be a positive integer`);
    }
    normalizedRateLimitConfig[variable] = String(value);
  }

  return {
    ...config,
    ...normalizedRateLimitConfig,
    PORT: String(port),
  };
}
