"use client";

import { useCallback, useMemo, useTransition } from "react";

import { useServerQueryConfig } from "../context/ServerQueryConfigProvider.hooks";
import { createCaller } from "../lib/caller";
import { ServerQueryResult } from "../results";
import {
  ExtractErr,
  ExtractOk,
  RetryDelayValue,
  RetryValue,
  ServerQueryFunction,
  ValidationError,
} from "../types";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { MutationError } from "../lib/MutationError";

/**
 * Hook for executing server mutations with React Query.
 *
 * Provides a type-safe way to execute server mutations with automatic error handling,
 * retries, and React transitions support.
 *
 * ### Key features:
 * - Type-safe mutation execution and error handling.
 * - Configurable retry behavior and delays.
 * - React transitions integration for smooth UI updates.
 * - Supports both synchronous and asynchronous mutations.
 */
export function useServerMutation<
  TInput,
  TResult extends ServerQueryResult,
  TContext,
  TExtractErr extends ExtractErr<TResult | ValidationError>,
>(
  mutation: ServerQueryFunction<TInput, TResult>,
  {
    onError,
    onSettled,
    throwOnError,
    retry,
    retryDelay,
    ...options
  }: Omit<
    UseMutationOptions<
      ExtractOk<TResult>,
      unknown,
      TInput extends object ? TInput : void,
      TContext | undefined
    >,
    | "mutationFn"
    | "onError"
    | "onSettled"
    | "retry"
    | "retryDelay"
    | "throwOnError"
  > & {
    onError?: (
      firstErr: TExtractErr,
      errors: TExtractErr[],
      variables: TInput extends object ? TInput : void,
      context: TContext | undefined
      // Use the same type as in the original MutationOptions.
      // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    ) => Promise<unknown> | unknown;
    onSettled?: (
      data: ExtractOk<TResult> | undefined,
      firstErr: TExtractErr | null,
      errors: TExtractErr[],
      variables: TInput extends object ? TInput : void,
      context: TContext | undefined
      // Use the same type as in the original MutationOptions.
      // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    ) => Promise<unknown> | unknown;
    retry?: RetryValue<TExtractErr>;
    retryDelay?: RetryDelayValue<TExtractErr>;
    throwOnError?:
      | boolean
      | ((firstErr: TExtractErr, errors: TExtractErr[]) => boolean);
  }
) {
  const config = useServerQueryConfig();
  const [isPending, startTransition] = useTransition();

  // Custom retry function to support firstError and error array.
  const retryFn = useMemo(() => {
    if (typeof retry === "function") {
      return (failureCount: number, error: MutationError<TExtractErr[]>) =>
        retry(failureCount, error.payload[0], error.payload);
    }

    return retry;
  }, [retry]);

  // Custom retryDelay function to support firstError and error array.
  const retryDelayFn = useMemo(() => {
    if (typeof retryDelay === "function") {
      return (failureCount: number, error: MutationError<TExtractErr[]>) =>
        retryDelay(failureCount, error.payload[0], error.payload);
    }

    return retryDelay;
  }, [retryDelay]);

  // Custom throwOnError function to support firstError and error array.
  const throwOnErrorFn = useMemo(() => {
    if (typeof throwOnError === "function") {
      return (error: MutationError<TExtractErr[]>) =>
        throwOnError(error.payload[0], error.payload);
    }

    return throwOnError;
  }, [throwOnError]);

  const result = useMutation<
    ExtractOk<TResult>,
    MutationError<TExtractErr[]>,
    TInput extends object ? TInput : void,
    TContext
  >({
    // Custom mutationFn to call the server mutation.
    // Returns the error as a MutationError holding the payload.
    mutationFn: async (input: TInput extends object ? TInput : void) => {
      const caller = createCaller(mutation, {}, config);

      const result = await caller(input as TInput);
      if (result.err) {
        throw new MutationError(result.val);
      }

      return result.val as ExtractOk<TResult>;
    },
    // Custom onError function to support firstError and error array.
    onError(error, variables, context) {
      return onError?.(error.payload[0], error.payload, variables, context);
    },
    // Custom onSettled function to support firstError and error array.
    onSettled(data, error, variables, context) {
      const firstError = error ? error.payload[0] : null;
      const errors = error ? error.payload : [];

      return onSettled?.(data, firstError, errors, variables, context);
    },
    retry: retryFn,
    retryDelay: retryDelayFn,
    throwOnError: throwOnErrorFn,
    ...options,
  });

  // Wrap the mutate function with startTransition
  const transitionMutate = useCallback(
    (variables: TInput extends object ? TInput : void) => {
      startTransition(() => {
        result.mutate(variables, options);
      });
    },
    [result, options, startTransition]
  );

  // Also provide an async version
  const transitionMutateAsync = useCallback(
    (variables: TInput extends object ? TInput : void) => {
      return new Promise<ExtractOk<TResult>>((resolve, reject) => {
        startTransition(() => {
          result.mutateAsync(variables, options).then(resolve).catch(reject);
        });
      });
    },
    [result, options, startTransition]
  );

  return {
    ...result,
    isTransitionPending: isPending,
    mutateNoTransition: result.mutate,
    mutateAsyncNoTransition: result.mutateAsync,
    mutate: transitionMutate,
    mutateAsync: transitionMutateAsync,
  };
}
