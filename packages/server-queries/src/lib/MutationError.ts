/**
 * Error thrown when a mutation fails.
 *
 * This is needed, because useMutation only supports errors that are
 * thrown in the mutationFn, but we need access to the original error
 * payload.
 *
 * ### Key features:
 * - Holds the original error payload from the server mutation.
 * - Provides a type-safe way to handle mutation errors.
 * - Extends the base Error class for proper error handling.
 */
export class MutationError<TInput> extends Error {
  /**
   * Construct new instance.
   */
  constructor(
    // The original error payload from the server mutation.
    public readonly payload: TInput,
  ) {
    super(MutationError.generateMessage(payload));
  }

  /**
   * Generate a meaningful error message from the payload.
   * Handles arrays of error objects, strings, and Error instances.
   */
  private static generateMessage(payload: unknown): string {
    // Default fallback message
    const defaultMessage = "mutation error";

    // Handle array of errors (most common case based on codebase usage)
    if (Array.isArray(payload) && payload.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const firstError = payload[0];

      // Try to extract meaningful information from error objects
      if (firstError && typeof firstError === "object") {
        const parts: string[] = [];

        // Check for common error properties (title, detail, code)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const title = "title" in firstError ? String(firstError.title) : "";
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const detail = "detail" in firstError ? String(firstError.detail) : "";
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const code = "code" in firstError ? String(firstError.code) : "";

        // Build message prioritizing detail > title > code
        if (detail) {
          parts.push(detail);
          if (code) parts.push(`[${code}]`);
        } else if (title) {
          parts.push(title);
          if (code) parts.push(`[${code}]`);
        } else if (code) {
          parts.push(`Error: ${code}`);
        }

        if (parts.length > 0) {
          let message = parts.join(" ");

          // Add count if multiple errors
          if (payload.length > 1) {
            message += ` (+${payload.length - 1} more error${payload.length > 2 ? "s" : ""})`;
          }

          return message;
        }
      }
    }
    // Handle string payloads
    else if (typeof payload === "string" && payload.trim()) {
      return payload;
    }
    // Handle Error objects
    else if (payload && typeof payload === "object" && "message" in payload) {
      const errorMessage = String(payload.message);
      if (errorMessage.trim()) {
        return errorMessage;
      }
    }

    // Fallback to default
    return defaultMessage;
  }
}
