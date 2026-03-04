function parseBooleanEnv(name: string, fallback = false): boolean {
  const value = process.env[name];

  if (value === undefined) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  throw new Error(`[config] Invalid boolean value for ${name}: ${value}`);
}

export const serverConfig = {
  allowCloseWithIncompleteRatings: parseBooleanEnv(
    "ALLOW_CLOSE_WITH_INCOMPLETE_RATINGS",
    false,
  ),
} as const;

