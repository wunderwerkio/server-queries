import {
  DefinedInitialDataInfiniteOptions,
  DefinedUseInfiniteQueryResult,
  InfiniteData,
  UndefinedInitialDataInfiniteOptions,
  useInfiniteQuery,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";

import { useServerQueryConfig } from "../context/ServerQueryConfigProvider.hooks";
import { createCaller } from "../lib/caller";
import { ServerQueryResult } from "../results";
import { ServerQueryFunction } from "../types";

type ExtractOk<T> = T extends {
  readonly ok: true;
  readonly val: infer V;
}
  ? V
  : never;

/**
 * Hook to query data via `useInfiniteQuery` from a server query.
 *
 * This hook wraps `useInfiniteQuery` and supplies a custom `queryFn` that invokes 
 * the server query to fetch the data. The page params are passed to the server query
 * through the `prepareQueryFn` option, which creates the server query input object.
 *
 * ### Key features:
 * - Handles pagination through the standard `useInfiniteQuery` interface.
 * - Automatically logs errors through the configured logger.
 * - Provides type-safe access to server query results.
 *
 * @param query - The server query to call.
 * @param options - Options for `useInfiniteQuery` and additional `prepareQueryFn`.
 * @throws {Error} If the server query returns an error result.
 */
export function useServerInfiniteQuery<
  TInput,
  TResult extends ServerQueryResult,
>(
  query: ServerQueryFunction<TInput, TResult>,
  options: Omit<
    UndefinedInitialDataInfiniteOptions<ExtractOk<TResult>>,
    "queryFn"
  > & {
    prepareQueryFn: (
      pageParam: unknown,
    ) => keyof Parameters<(typeof query)["func"]>[0] extends undefined
      ? void
      : Parameters<(typeof query)["func"]>[0];
  },
): UseInfiniteQueryResult<InfiniteData<ExtractOk<TResult>>>;
export function useServerInfiniteQuery<
  TInput,
  TResult extends ServerQueryResult,
>(
  query: ServerQueryFunction<TInput, TResult>,
  options: Omit<
    DefinedInitialDataInfiniteOptions<ExtractOk<TResult>>,
    "queryFn"
  > & {
    prepareQueryFn: (
      pageParam: unknown,
    ) => keyof Parameters<(typeof query)["func"]>[0] extends undefined
      ? void
      : Parameters<(typeof query)["func"]>[0];
  },
): DefinedUseInfiniteQueryResult<InfiniteData<ExtractOk<TResult>>>;
// eslint-disable-next-line
export function useServerInfiniteQuery<
  TInput,
  TResult extends ServerQueryResult,
>(
  query: ServerQueryFunction<TInput, TResult>,
  options:
    | (Omit<
        UndefinedInitialDataInfiniteOptions<ExtractOk<TResult>>,
        "queryFn"
      > & {
        prepareQueryFn: (
          pageParam: unknown,
        ) => keyof Parameters<(typeof query)["func"]>[0] extends undefined
          ? void
          : Parameters<(typeof query)["func"]>[0];
      })
    | (Omit<
        DefinedInitialDataInfiniteOptions<ExtractOk<TResult>>,
        "queryFn"
      > & {
        prepareQueryFn: (
          pageParam: unknown,
        ) => keyof Parameters<(typeof query)["func"]>[0] extends undefined
          ? void
          : Parameters<(typeof query)["func"]>[0];
      }),
):
  | DefinedUseInfiniteQueryResult<InfiniteData<ExtractOk<TResult>>>
  | UseInfiniteQueryResult<InfiniteData<ExtractOk<TResult>>> {
  const config = useServerQueryConfig();

  return useInfiniteQuery({
    queryFn: async (context) => {
      const input = options.prepareQueryFn(context.pageParam);

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
          `Error fetching data for server infinite query (${query.id}):`,
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
