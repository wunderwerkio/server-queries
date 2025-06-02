"use client";

import { useTransition } from "react";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

import { useServerQueryConfig } from "../context/ServerQueryConfigProvider.hooks";
import { createCaller } from "../lib/caller";
import { ServerQueryResult } from "../results";
import {
  ExtractErr,
  ExtractOk,
  ServerQueryFunction,
  ValidationError,
} from "../types";
import { MutationError } from "../lib/MutationError";
import { RetryValue, useRetryFn } from "./mutation/use-retry-fn";
import {
  RetryDelayValue,
  useRetryDelayFn,
} from "./mutation/use-retry-delay-fn";
import { useThrowOnErrorFn } from "./mutation/use-throw-on-error-fn";
import { useTransitionMutate } from "./mutation/use-transition-mutate";
import { useTransitionMutateAsync } from "./mutation/use-transition-mutate-async";

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
      context: TContext | undefined,
      // Use the same type as in the original MutationOptions.
      // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    ) => Promise<unknown> | unknown;
    onSettled?: (
      data: ExtractOk<TResult> | undefined,
      firstErr: TExtractErr | null,
      errors: TExtractErr[],
      variables: TInput extends object ? TInput : void,
      context: TContext | undefined,
      // Use the same type as in the original MutationOptions.
      // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    ) => Promise<unknown> | unknown;
    retry?: RetryValue<TExtractErr>;
    retryDelay?: RetryDelayValue<TExtractErr>;
    throwOnError?:
      | boolean
      | ((firstErr: TExtractErr, errors: TExtractErr[]) => boolean);
  } = {},
) {
  const config = useServerQueryConfig();
  const [isPending, startTransition] = useTransition();

  // Custom retry function to support firstError and error array.
  const retryFn = useRetryFn(retry);

  // Custom retryDelay function to support firstError and error array.
  const retryDelayFn = useRetryDelayFn(retryDelay);

  // Custom throwOnError function to support firstError and error array.
  const throwOnErrorFn = useThrowOnErrorFn(throwOnError);

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

  // Wrap the mutate function with startTransition.
  const transitionMutate = useTransitionMutate(result.mutate, startTransition);

  // Also provide an async version.
  const transitionMutateAsync = useTransitionMutateAsync(
    result.mutateAsync,
    startTransition,
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
