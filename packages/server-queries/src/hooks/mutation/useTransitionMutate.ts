import { MutateOptions } from "@tanstack/react-query";
import { useCallback } from "react";

/**
 * Hook that wraps a mutation function with React's startTransition.
 *
 * Creates a mutation function that executes within a transition,
 * allowing React to keep the UI responsive during the mutation.
 *
 * ### Key features:
 * - Wraps mutations in React transitions for better UX.
 * - Preserves mutation function signature.
 * - Type-safe mutation execution.
 *
 * @param mutateFn - The mutation function to wrap.
 * @param startTransition - React's startTransition function.
 */
export function useTransitionMutate<TOk, TErr, TInput, TContext>(
  mutateFn: (
    variables: TInput,
    options?: MutateOptions<TOk, TErr, TInput, TContext>,
  ) => void,
  startTransition: (fn: () => void) => void,
) {
  // Wrap the mutate function with startTransition
  return useCallback(
    (
      variables: TInput,
      options?: MutateOptions<TOk, TErr, TInput, TContext>,
    ) => {
      startTransition(() => {
        mutateFn(variables, options);
      });
    },
    [mutateFn, startTransition],
  );
}
