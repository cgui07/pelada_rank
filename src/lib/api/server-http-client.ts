import { headers } from "next/headers";
import type { ApiResponse } from "@/lib/api/types";

export interface ServerHttpRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

function getProtocol(headersList: Headers): string {
  return (
    headersList.get("x-forwarded-proto") ||
    (process.env.NODE_ENV === "production" ? "https" : "http")
  );
}

function getHost(headersList: Headers): string | null {
  return headersList.get("x-forwarded-host") || headersList.get("host");
}

export async function serverHttpRequest<T>(
  path: string,
  options: ServerHttpRequestOptions = {},
): Promise<ApiResponse<T>> {
  const headersList = await headers();
  const host = getHost(headersList);

  if (!host) {
    return { success: false, error: "Host nao encontrado para chamada interna" };
  }

  const url = `${getProtocol(headersList)}://${host}${path}`;
  const requestHeaders = new Headers(options.headers);

  const cookieHeader = headersList.get("cookie");
  if (cookieHeader) {
    requestHeaders.set("cookie", cookieHeader);
  }

  if (options.body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: requestHeaders,
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
    return { success: false, error: "Falha ao consultar API interna" };
  }
}
