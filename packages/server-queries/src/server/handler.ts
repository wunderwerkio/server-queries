import { createJsonSerializer } from "../lib/serializer";
import { ServerQueryError, ServerQueryResult } from "../results";
import { LogFunc, ServerQueryFunction } from "../types";

/** Custom minimal implementation of NextRequest to ensure broader compatibility with different Next.js versions. */
interface NextRequest extends Request {
  nextUrl: {
    /** URL pathname from the request. */
    pathname: string;
  };
}

/** Options for configuring the route handler. */
type Options = {
  /** Logger interface for recording events. */
  logger: {
    /** Log informational messages. */
    log: LogFunc;
    /** Log warning messages. */
    warn: LogFunc;
    /** Log error messages. */
    error: LogFunc;
  };
};

const defaultOptions: Options = {
  logger: console,
};

/**
 * Creates a route handler for server queries and mutations.
 *
 * Creates GET and POST handlers that validate requests, execute the appropriate
 * query/mutation, and return type-safe responses.
 *
 * ### Key features:
 * - Handles both query (GET) and mutation (POST) requests.
 * - Validates request payloads and query IDs.
 * - Provides detailed error responses.
 * - Supports custom logging configuration.
 *
 * @param queries - Array of server query/mutation functions to handle.
 * @param options - Configuration options for the handler.
 * @throws {Error} If request validation fails or query execution errors.
 */
export function createRouteHandler(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queries: ServerQueryFunction<any, ServerQueryResult>[],
  options?: Partial<Options>,
) {
  const mergedOptions = { ...defaultOptions, ...options };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serializer = createJsonSerializer<any, ServerQueryResult>();

  const handleGet = async (request: NextRequest) => {
    const params = new URLSearchParams(request.url.split("?")[1]);
    const payload = params.get("payload");

    const id = extractQueryIdFromPath(request.nextUrl.pathname);
    if (!id) {
      mergedOptions.logger.error(
        "Error handling server query request: No query ID found in URL!",
        request.url,
      );

      return createErrorResponse({
        status: "400",
        title: "Bad Request",
        detail: "No query ID found in URL!",
      });
    }

    try {
      const query = queries.find((query) => query.id === id);
      if (!query) {
        mergedOptions.logger.error(
          "Error handling server query request: No matching query found for ID:",
          id,
        );

        return createErrorResponse({
          status: "404",
          title: "Not Found",
          detail: `No matching query found for ID: ${id}`,
        });
      }

      if (query.type !== "query") {
        mergedOptions.logger.error(
          `Error handling server query request: Query with id ${id} is not a query, instead has type: ${query.type}!`,
        );

        return createErrorResponse({
          status: "405",
          title: "Method Not Allowed",
          detail: `Query with id ${id} is not a query, instead has type: ${query.type}!`,
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const input = payload ? serializer.deserializeInput(payload) : undefined;

      const result = await query.func(input);

      return new Response(serializer.serializeResult(result), { status: 200 });
    } catch (e) {
      mergedOptions.logger.error(
        "Error handling server query request:",
        e,
        request.url,
      );

      return createErrorResponse({
        status: "500",
        title: "Internal Server Error",
        detail: e instanceof Error ? e.message : "Unknown error",
      });
    }
  };

  const handlePost = async (request: NextRequest) => {
    const payload = await request.text();

    const id = extractQueryIdFromPath(request.nextUrl.pathname);
    if (!id) {
      return createErrorResponse({
        status: "400",
        title: "Bad Request",
        detail: "No query ID found in URL!",
      });
    }

    try {
      const query = queries.find((query) => query.id === id);
      if (!query) {
        mergedOptions.logger.error(
          "Error handling server query request: No matching query found for ID:",
          id,
        );

        return createErrorResponse({
          status: "404",
          title: "Not Found",
          detail: `No matching query found for ID: ${id}`,
        });
      }

      if (query.type !== "mutation") {
        mergedOptions.logger.error(
          `Error handling server query request: Query with id ${id} is not a mutation, instead has type: ${query.type}!`,
        );

        return createErrorResponse({
          status: "405",
          title: "Method Not Allowed",
          detail: `Query with id ${id} is not a mutation, instead has type: ${query.type}!`,
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const input = payload ? serializer.deserializeInput(payload) : undefined;

      const result = await query.func(input);

      return new Response(serializer.serializeResult(result), { status: 200 });
    } catch (err) {
      mergedOptions.logger.error(
        "Error handling server query request:",
        err,
        request.url,
      );

      return createErrorResponse({
        status: "500",
        title: "Internal Server Error",
        detail: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  return {
    GET: handleGet,
    POST: handlePost,
  };
}

/**
 * Extracts the query ID from the request path.
 *
 * @param path - Request URL path to extract from.
 */
function extractQueryIdFromPath(path: string) {
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) {
    return null;
  }

  return parts[parts.length - 1];
}

/**
 * Creates an error response with the given payload.
 *
 * @param payload - Error details to include in response.
 */
function createErrorResponse(payload: ServerQueryError): Response {
  const status = parseInt(payload.status ?? "500") || 500;
  const body = JSON.stringify(payload);

  return new Response(body, { status });
}
