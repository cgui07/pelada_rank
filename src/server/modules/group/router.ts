import { parseInput } from "@/server/lib/validation";
import {
  joinGroupInputSchema,
  groupIdInputSchema,
  createPeladaInputSchema,
  updatePeladaStatusInputSchema,
  peladaIdInputSchema,
} from "@/server/modules/group/schema";
import {
  joinGroupByInviteCode,
  getGroupDetails,
  createPelada,
  updatePeladaStatus,
  getPeladaDetails,
} from "@/server/modules/group/service";

export const groupRouter = {
  async joinByInviteCode(input: unknown) {
    const data = parseInput(joinGroupInputSchema, input);
    const groupId = await joinGroupByInviteCode(data.inviteCode);

    return { groupId };
  },

  async getDetails(input: unknown) {
    const data = parseInput(groupIdInputSchema, input);
    return getGroupDetails(data.groupId);
  },

  async createPelada(input: unknown) {
    const data = parseInput(createPeladaInputSchema, input);
    const peladaId = await createPelada(data);

    return { peladaId };
  },

  async updatePeladaStatus(input: unknown) {
    const data = parseInput(updatePeladaStatusInputSchema, input);
    await updatePeladaStatus(data.peladaId, data.status);

    return null;
  },

  async getPeladaDetails(input: unknown) {
    const data = parseInput(peladaIdInputSchema, input);
    return getPeladaDetails(data.peladaId);
  },
};
