"use client";

import { DependencyList, useCallback, useTransition } from "react";

import { useServerQueryConfig } from "../context/ServerQueryConfigProvider.hooks";
import { createCaller } from "../lib/caller";
import { ServerQueryResult } from "../results";
import { ExtractErr, ExtractOk, ServerQueryFunction } from "../types";

/** Options for configuring server mutation behavior. */
type Options<TResult extends ServerQueryResult> = {
  /** Callback function invoked when the mutation succeeds. */
  onSuccess?: (value: ExtractOk<TResult>) => void | Promise<void>;
  /** Callback function invoked when the mutation fails. */
  onError?: (
    firstError: ExtractErr<TResult>[number],
    errors: ExtractErr<TResult>
  ) => void | Promise<void>;
};

/**
 * Hook to execute server mutations with loading state and result handling.
 *
 * ### Key features:
 * - Returns a tuple with mutation callback and loading state.
 * - Handles success and error states through callbacks.
 * - Provides type-safe access to mutation results.
 * - Automatically logs errors through configured logger.
 *
 * @param mutation - The server mutation to execute.
 * @param options - Configuration options for handling mutation results.
 * @param deps - Additional dependencies for the mutation callback.
 * @throws {Error} If used with a query instead of a mutation.
 */
export function useServerMutation<TInput, TResult extends ServerQueryResult>(
  mutation: ServerQueryFunction<TInput, TResult>,
  options: Options<TResult> = {},
  deps: DependencyList = []
) {
  const [isPending, startTransition] = useTransition();
  const config = useServerQueryConfig();

  // Safety check.
  if (mutation.type !== "mutation") {
    throw new Error(
      "useServerMutation can only be used with server mutations!"
    );
  }

  const callback = useCallback(
    (input: TInput) => {
      const caller = createCaller(mutation, {}, config);

      return new Promise<ExtractOk<TResult>>((resolve, reject) => {
        startTransition(async () => {
          // Do nothing if already pending.
          if (isPending) return;

          const result = await caller(input);

          if (result.ok) {
            await options.onSuccess?.(result.val as ExtractOk<TResult>);
            resolve(result.val as ExtractOk<TResult>);
          } else {
            config.logger.error(
              `Error fetching data for server mutation (${mutation.id}):`,
              result.val[0].title,
              result.val[0].detail
            );

            await options.onError?.(
              result.val[0],
              result.val as ExtractErr<TResult>
            );
            // eslint-disable-next-line
            reject(result.val as ExtractErr<TResult>);
          }
        });
      });
    },
    // eslint-disable-next-line
    [startTransition, mutation, isPending, options, ...deps]
  );

  return [callback, isPending] as const;
}
