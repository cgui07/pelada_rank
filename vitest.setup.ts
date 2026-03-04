process.env.JWT_SECRET =
  process.env.JWT_SECRET || "test-jwt-secret-at-least-32-characters";
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/test_db";
process.env.ADMIN_ALLOWLIST_USERNAMES =
  process.env.ADMIN_ALLOWLIST_USERNAMES || "staff_admin";
process.env.ALLOW_FIRST_ADMIN_BOOTSTRAP =
  process.env.ALLOW_FIRST_ADMIN_BOOTSTRAP || "false";
process.env.ALLOW_CLOSE_WITH_INCOMPLETE_RATINGS =
  process.env.ALLOW_CLOSE_WITH_INCOMPLETE_RATINGS || "false";

