/**
 * Safely get a string message from an unknown catch clause value.
 */
export function getErrorMessage(error: unknown, fallback = "Unknown error"): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return fallback;
}

/**
 * Safely get optional code (e.g. ECONNREFUSED) from an unknown error.
 */
export function getErrorCode(error: unknown): string | undefined {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: string }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}
