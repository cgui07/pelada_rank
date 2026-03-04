import type { ApiResponse } from "@/lib/api/types";

export interface HttpRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export async function httpRequest<T>(
  path: string,
  options: HttpRequestOptions = {},
): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers);

  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(path, {
      ...options,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: options.cache ?? "no-store",
    });

    const payload = (await response
      .json()
      .catch(() => null)) as ApiResponse<T> | null;

    if (!payload || typeof payload !== "object" || !("success" in payload)) {
      return { success: false, error: "Resposta invalida do servidor" };
    }

    if (!response.ok && payload.success) {
      return { success: false, error: "Erro inesperado do servidor" };
    }

    return payload;
  } catch {
    return { success: false, error: "Falha de conexao com o servidor" };
  }
}
