import { useCallback } from "react";
import { ExtractOk } from "../types";

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
 * @param options - Options to pass to the mutation function.
 * @param startTransition - React's startTransition function.
 */
export const useTransitionMutateAsync = <TInput, TResult, TOptions>(
  mutateAsync: (
    variables: TInput,
    options: TOptions
  ) => Promise<ExtractOk<TResult>>,
  startTransition: (fn: () => void) => void,
  options: TOptions
) => {
  return useCallback(
    (variables: TInput) => {
      return new Promise<ExtractOk<TResult>>((resolve, reject) => {
        startTransition(() => {
          mutateAsync(variables, options).then(resolve).catch(reject);
        });
      });
    },
    [mutateAsync, options, startTransition]
  );
};
