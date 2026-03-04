import { parseInput } from "@/server/lib/validation";
import {
  searchUserInputSchema,
  setPinInputSchema,
  generatePinInputSchema,
  createGroupInputSchema,
} from "@/server/modules/admin/schema";
import {
  searchUser,
  adminSetPin,
  adminGeneratePin,
  getAuditLog,
  createGroup,
  getAllGroups,
} from "@/server/modules/admin/service";

export const adminRouter = {
  async searchUser(input: unknown) {
    const data = parseInput(searchUserInputSchema, input);
    return searchUser(data.username);
  },

  async setPin(input: unknown) {
    const data = parseInput(setPinInputSchema, input);
    const pin = await adminSetPin(data);

    return { pin };
  },

  async generatePin(input: unknown) {
    const data = parseInput(generatePinInputSchema, input);
    const pin = await adminGeneratePin(data.targetUsername);

    return { pin };
  },

  async getAuditLog() {
    return getAuditLog();
  },

  async createGroup(input: unknown) {
    const data = parseInput(createGroupInputSchema, input);
    const groupId = await createGroup(data);

    return { groupId };
  },

  async getAllGroups() {
    return getAllGroups();
  },
};
