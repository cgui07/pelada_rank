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

function parseAllowlist(value: string | undefined): Set<string> {
  if (!value) {
    return new Set();
  }

  const usernames = value
    .split(",")
    .map((username) => username.trim().toLowerCase())
    .filter(Boolean);

  return new Set(usernames);
}

export const serverConfig = {
  adminAllowlistUsernames: parseAllowlist(process.env.ADMIN_ALLOWLIST_USERNAMES),
  adminBootstrapToken: process.env.ADMIN_BOOTSTRAP_TOKEN?.trim() || null,
  allowFirstAdminBootstrap: parseBooleanEnv("ALLOW_FIRST_ADMIN_BOOTSTRAP", false),
  allowCloseWithIncompleteRatings: parseBooleanEnv(
    "ALLOW_CLOSE_WITH_INCOMPLETE_RATINGS",
    false,
  ),
} as const;

