import { parseInput } from "@/server/lib/validation";
import {
  checkUsernameInputSchema,
  loginInputSchema,
  registerInputSchema,
} from "@/server/modules/auth/schema";
import {
  checkUsernameAvailability,
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
} from "@/server/modules/auth/service";

function getClientIp(headersList: Headers): string {
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown"
  );
}

export const authRouter = {
  async checkUsername(input: unknown) {
    const data = parseInput(checkUsernameInputSchema, input);
    const available = await checkUsernameAvailability(data.username);

    return { available };
  },

  async login(input: unknown, headersList: Headers) {
    const data = parseInput(loginInputSchema, input);
    await loginUser(data, getClientIp(headersList));

    return null;
  },

  async register(input: unknown) {
    const data = parseInput(registerInputSchema, input);
    await registerUser(data);

    return null;
  },

  async logout() {
    await logoutUser();
    return null;
  },

  async me() {
    return getCurrentUser();
  },
};
