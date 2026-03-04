import { NextResponse } from "next/server";
import type { ApiResponse } from "@/lib/api/types";

export class ApiRouteError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = "ApiRouteError";
  }
}

export function apiSuccess<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json<ApiResponse<T>>({ success: true, data }, { status });
}

export function apiError(
  message: string,
  status = 400,
): NextResponse<ApiResponse<never>> {
  return NextResponse.json<ApiResponse<never>>(
    { success: false, error: message },
    { status },
  );
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiRouteError("JSON invalido", 400);
  }
}

export async function handleApiRoute<T>(
  handler: () => Promise<T>,
): Promise<NextResponse<ApiResponse<T | never>>> {
  try {
    const data = await handler();
    return apiSuccess(data);
  } catch (error) {
    if (error instanceof ApiRouteError) {
      return apiError(error.message, error.status);
    }

    console.error("API route failure:", error);
    return apiError("Erro interno do servidor", 500);
  }
}
