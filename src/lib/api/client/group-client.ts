import { httpRequest } from "@/lib/api/http-client";

export async function joinGroupByInviteCode(inviteCode: string): Promise<{
  success: boolean;
  groupId?: string;
  error?: string;
}> {
  const response = await httpRequest<{ groupId: string }>("/api/group/join", {
    method: "POST",
    body: { inviteCode },
  });

  if (!response.success) {
    return { success: false, error: response.error };
  }

  return {
    success: true,
    groupId: response.data.groupId,
  };
}

export async function createPelada(formData: {
  groupId: string;
  name: string;
  playedAt?: string;
  participantIds: string[];
}): Promise<{ success: boolean; peladaId?: string; error?: string }> {
  const response = await httpRequest<{ peladaId: string }>("/api/group/pelada", {
    method: "POST",
    body: formData,
  });

  if (!response.success) {
    return { success: false, error: response.error };
  }

  return {
    success: true,
    peladaId: response.data.peladaId,
  };
}

export async function updatePeladaStatus(
  peladaId: string,
  status: "open" | "voting" | "closed",
): Promise<{ success: boolean; error?: string }> {
  const response = await httpRequest<null>(`/api/group/pelada/${peladaId}/status`, {
    method: "PATCH",
    body: { status },
  });

  if (!response.success) {
    return { success: false, error: response.error };
  }

  return { success: true };
}
