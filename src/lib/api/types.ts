export type ApiResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

export function isApiSuccess<T>(
  response: ApiResponse<T>,
): response is { success: true; data: T } {
  return response.success;
}
