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
    super("mutation error");
  }
}
