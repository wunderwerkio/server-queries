import { ServerQueryResult } from "../results";
import {
  ServerQueryCaller,
  ServerQueryConfig,
  ServerQueryFunction,
} from "../types";
import { createJsonSerializer } from "./serializer";

/**
 * Creates a caller function that executes server queries and mutations.
 * 
 * Creates a type-safe function that handles serialization, HTTP requests,
 * and deserialization of server query/mutation results.
 * 
 * ### Key features:
 * - Handles both query (GET) and mutation (POST) requests.
 * - Automatically serializes input and deserializes results.
 * - Configurable fetch options and base path.
 * - Type-safe input and result handling.
 * 
 * @param query - The server query/mutation to create a caller for.
 * @param fetchOptions - Additional options to pass to fetch.
 * @param options - Configuration for the server query caller.
 */
export function createCaller<TInput, TResult extends ServerQueryResult>(
  query: ServerQueryFunction<TInput, TResult>,
  fetchOptions: RequestInit = {},
  options: ServerQueryConfig,
): ServerQueryCaller<TInput, TResult> {
  const serializer = createJsonSerializer<TInput, TResult>();

  return (async (input: TInput) => {
    const params = new URLSearchParams();
    params.set("payload", serializer.serializeInput(input));

    let path = `${options.basePath}/${query.id}`;

    if (query.type === "query") {
      path = `${path}?${params.toString()}`;
    } else {
      fetchOptions.body = serializer.serializeInput(input);
    }

    const request = await fetch(path, {
      ...fetchOptions,
      method: query.type === "query" ? "GET" : "POST",
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions?.headers,
      },
    });

    const payload = await request.text();
    const result = serializer.deserializeResult(payload);

    return result;
  }) as ServerQueryCaller<TInput, TResult>;
}
