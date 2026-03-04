const MIN_JWT_SECRET_LENGTH = 32;

let cachedJwtSecret: Uint8Array | null = null;

function readRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim().length === 0) {
    throw new Error(`[config] Missing required environment variable: ${name}`);
  }

  return value;
}

export function getJwtSecretOrThrow(): Uint8Array {
  if (cachedJwtSecret) {
    return cachedJwtSecret;
  }

  const jwtSecret = readRequiredEnv("JWT_SECRET");

  if (jwtSecret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `[config] JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters`,
    );
  }

  cachedJwtSecret = new TextEncoder().encode(jwtSecret);
  return cachedJwtSecret;
}

