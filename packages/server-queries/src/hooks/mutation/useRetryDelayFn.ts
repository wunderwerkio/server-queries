import { useMemo } from "react";
import { MutationError } from "../../lib/MutationError";

/** Function that determines whether to retry a mutation based on error details. */
/** Value that determines delay between retry attempts. */
export type RetryDelayValue<TError> = number | RetryDelayFunction<TError>;

/**
 * Function that determines delay between retry attempts.
 *
 * @param failureCount - Number of failed attempts.
 * @param firstError - First error that occurred.
 * @param errors - Array of all errors that occurred.
 */
export type RetryDelayFunction<TError> = (
  failureCount: number,
  firstError: TError,
  errors: TError[],
) => number;

/**
 * Hook that creates a retry delay function for handling mutation errors.
 *
 * Creates a memoized retry delay function that supports both simple delay values and
 * complex delay functions with access to error details.
 *
 * ### Key features:
 * - Supports both number and function delay values.
 * - Provides access to first error and full error array.
 * - Memoizes the delay function for performance.
 *
 * @param retryDelay - The retry delay value or function to memoize.
 */
export const useRetryDelayFn = <TExtractErr>(
  retryDelay?: RetryDelayValue<TExtractErr>,
) => {
  return useMemo(() => {
    if (typeof retryDelay === "function") {
      return (failureCount: number, error: MutationError<TExtractErr[]>) =>
        retryDelay(failureCount, error.payload[0], error.payload);
    }

    return retryDelay;
  }, [retryDelay]);
};
