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
    // Prepare URL parameters for GET requests.
    const params = new URLSearchParams();
    if (input) {
      params.set("payload", serializer.serializeInput(input));
    }

    // Build the request path.
    const basePath = `${options.basePath}/${query.id}`;
    const path =
      query.type === "query"
        ? params.size > 0
          ? `${basePath}?${params.toString()}`
          : basePath
        : basePath;

    // For POST requests, set the body if there's input.
    if (query.type === "mutation" && input) {
      fetchOptions.body = serializer.serializeInput(input);
    }

    // Make the request with appropriate method and headers.
    const request = await fetch(path, {
      ...fetchOptions,
      method: query.type === "query" ? "GET" : "POST",
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions?.headers,
      },
    });

    // Get response as text.
    const responseText = await request.text();

    // Deserialize the JSON response.
    return serializer.deserializeResult(responseText);
  }) as ServerQueryCaller<TInput, TResult>;
}
