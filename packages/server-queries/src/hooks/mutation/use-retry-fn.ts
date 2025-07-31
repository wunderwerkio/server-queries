import { useMemo } from "react";
import { MutationError } from "../../lib/MutationError";

export type RetryValue<TError> = boolean | number | ShouldRetryFunction<TError>;

/**
 * Function that determines whether to retry a mutation.
 *
 * @param failureCount - Number of failed attempts.
 * @param firstError - First error that occurred.
 * @param errors - Array of all errors that occurred.
 */
export type ShouldRetryFunction<TError> = (
  failureCount: number,
  firstError: TError,
  errors: TError[],
) => boolean;

/**
 * Hook that creates a retry function for handling mutation errors.
 *
 * Creates a memoized retry function that supports both simple retry values and
 * complex retry functions with access to error details.
 *
 * ### Key features:
 * - Supports both boolean and number retry values.
 * - Provides access to first error and full error array.
 * - Memoizes the retry function for performance.
 *
 * @param retry - The retry value or function to memoize.
 */
export const useRetryFn = <TExtractErr>(retry?: RetryValue<TExtractErr>) => {
  return useMemo(() => {
    if (typeof retry === "function") {
      return (failureCount: number, error: MutationError<TExtractErr[]>) =>
        retry(failureCount, error.payload?.[0], error.payload);
    }

    return retry;
  }, [retry]);
};
