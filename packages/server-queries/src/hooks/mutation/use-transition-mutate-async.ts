import { useCallback } from "react";
import { MutateOptions } from "@tanstack/react-query";

/**
 * Hook that wraps a mutation function with React's startTransition.
 *
 * Creates an async mutation function that executes within a transition,
 * allowing React to keep the UI responsive during the mutation.
 *
 * ### Key features:
 * - Wraps mutations in React transitions for better UX.
 * - Preserves async/Promise behavior.
 * - Type-safe mutation execution.
 *
 * @param mutateAsync - The async mutation function to wrap.
 * @param startTransition - React's startTransition function.
 */
export const useTransitionMutateAsync = <TOk, TErr, TInput, TContext>(
  mutateAsync: (
    variables: TInput,
    options?: MutateOptions<TOk, TErr, TInput, TContext>,
  ) => Promise<TOk>,
  startTransition: (fn: () => void) => void,
) => {
  return useCallback(
    (
      variables: TInput,
      options?: MutateOptions<TOk, TErr, TInput, TContext>,
    ) => {
      return new Promise<TOk>((resolve, reject) => {
        startTransition(() => {
          mutateAsync(variables, options).then(resolve).catch(reject);
        });
      });
    },
    [mutateAsync, startTransition],
  );
};
