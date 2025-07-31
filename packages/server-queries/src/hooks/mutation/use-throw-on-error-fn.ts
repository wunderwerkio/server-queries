import { useMemo } from "react";
import { MutationError } from "../../lib/MutationError";

/**
 * Hook that creates a throw-on-error function for handling mutation errors.
 *
 * Creates a memoized function that determines whether to throw errors based on
 * either a boolean value or a custom function with access to error details.
 *
 * ### Key features:
 * - Supports both boolean and function throw values.
 * - Provides access to first error and full error array.
 * - Memoizes the throw function for performance.
 *
 * @param throwOnError - The throw value or function to memoize.
 */
export function useThrowOnErrorFn<TExtractErr>(
  throwOnError?:
    | boolean
    | ((firstErr: TExtractErr, errors: TExtractErr[]) => boolean),
) {
  return useMemo(() => {
    if (typeof throwOnError === "function") {
      return (error: MutationError<TExtractErr[]>) =>
        throwOnError(error.payload?.[0], error.payload);
    }

    return throwOnError;
  }, [throwOnError]);
}
