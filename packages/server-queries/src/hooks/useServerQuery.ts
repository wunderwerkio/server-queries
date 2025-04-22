"use client";

import {
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  UndefinedInitialDataOptions,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";

import { useServerQueryConfig } from "../context/ServerQueryConfigProvider.hooks";
import { createCaller } from "../lib/caller";
import { ServerQueryResult } from "../results";
import { ExtractOk, ServerQueryFunction } from "../types";

/**
 * Hook to query data via `useQuery` from a server query.
 *
 * This hook wraps `useQuery` and supplies a custom `queryFn` that invokes
 * the server query to fetch the data. The query result is automatically
 * type-safe based on the server query's return type.
 *
 * ### Key features:
 * - Provides type-safe access to server query results.
 * - Automatically logs errors through configured logger.
 * - Handles both queries with and without input parameters.
 *
 * @param query - The server query to call.
 * @param options - Options for `useQuery` and optional input parameters.
 * @throws {Error} If the server query returns an error result.
 */
export function useServerQuery<TInput, TResult extends ServerQueryResult>(
  query: ServerQueryFunction<TInput, TResult>,
  options: Omit<UndefinedInitialDataOptions<ExtractOk<TResult>>, "queryFn"> &
    (keyof Parameters<(typeof query)["func"]>[0] extends undefined
      ? Record<string, unknown>
      : { input: Parameters<(typeof query)["func"]>[0] }),
): UseQueryResult<ExtractOk<TResult>>;
export function useServerQuery<TInput, TResult extends ServerQueryResult>(
  query: ServerQueryFunction<TInput, TResult>,
  options: Omit<DefinedInitialDataOptions<ExtractOk<TResult>>, "queryFn"> &
    (keyof Parameters<(typeof query)["func"]>[0] extends undefined
      ? Record<string, unknown>
      : { input: Parameters<(typeof query)["func"]>[0] }),
): DefinedUseQueryResult<ExtractOk<TResult>>;
// eslint-disable-next-line
export function useServerQuery<TInput, TResult extends ServerQueryResult>(
  query: ServerQueryFunction<TInput, TResult>,
  options:
    | (Omit<DefinedInitialDataOptions<ExtractOk<TResult>>, "queryFn"> &
        (keyof Parameters<(typeof query)["func"]>[0] extends undefined
          ? Record<string, unknown>
          : { input: Parameters<(typeof query)["func"]>[0] }))
    | (Omit<UndefinedInitialDataOptions<ExtractOk<TResult>>, "queryFn"> &
        (keyof Parameters<(typeof query)["func"]>[0] extends undefined
          ? Record<string, unknown>
          : { input: Parameters<(typeof query)["func"]>[0] })),
):
  | DefinedUseQueryResult<ExtractOk<TResult>>
  | UseQueryResult<ExtractOk<TResult>> {
  const config = useServerQueryConfig();

  return useQuery({
    queryFn: async (context) => {
      const input = "input" in options ? options.input : undefined;

      const caller = createCaller(
        query,
        {
          signal: context.signal,
        },
        config,
      );

      const result = await caller(input as TInput);
      if (result.err) {
        config.logger.error(
          `Error fetching data for server query (${query.id}):`,
          result.val[0].title,
          result.val[0].detail,
        );

        throw new Error(result.val[0].title);
      }

      return result.val as ExtractOk<TResult>;
    },
    ...options,
  });
}
