import { z, ZodSchema } from "zod";

import { ServerQueryErr, ServerQueryResult } from "../results";
import { JsonValue, ValidationError } from "../types";

/**
 * Creates a server query with input validation.
 *
 * Creates a type-safe server query that validates input data against a schema
 * before executing the query logic.
 *
 * ### Key features:
 * - Validates input against Zod schema.
 * - Returns validation errors if input is invalid.
 * - Type-safe input and result handling.
 *
 * @param id - Unique identifier for the query.
 * @param schema - Zod schema to validate input against.
 * @param callback - Function containing query logic.
 */
export function serverQuery<
  TSchema extends ZodSchema<JsonValue>,
  TReturn extends PromiseLike<ServerQueryResult>,
>(
  id: string,
  schema: TSchema,
  callback: (input: z.infer<TSchema>) => TReturn
): {
  id: string;
  type: "query";
  func: (
    input: z.infer<TSchema>
  ) => Promise<Awaited<TReturn> | ValidationError>;
};

/**
 * Creates a server query without input.
 *
 * Creates a type-safe server query that executes query logic
 * without requiring any input data.
 *
 * ### Key features:
 * - No input validation needed.
 * - Type-safe result handling.
 *
 * @param id - Unique identifier for the query.
 * @param callback - Function containing query logic.
 */
export function serverQuery<TReturn extends PromiseLike<ServerQueryResult>>(
  id: string,
  callback: () => TReturn
): {
  id: string;
  type: "query";
  func: () => Promise<Awaited<TReturn> | ValidationError>;
};

/**
 * Core implementation of the server query function.
 *
 * Creates a server query that optionally validates input data before
 * executing the query logic.
 *
 * ### Key features:
 * - Supports both input and no-input queries.
 * - Validates input against schema if provided.
 * - Returns detailed validation errors.
 *
 * @param id - Unique identifier for the query.
 * @param schemaOrCallback - Zod schema for input validation or query function.
 * @param callback - Query function if schema is provided.
 */
export function serverQuery<TReturn extends PromiseLike<ServerQueryResult>>(
  id: string,
  schemaOrCallback: ZodSchema | (() => PromiseLike<TReturn>),
  callback?: (data: unknown) => PromiseLike<TReturn>
) {
  if (typeof schemaOrCallback === "function") {
    return {
      id,
      type: "query",
      func: () => schemaOrCallback(),
    };
  }

  return {
    id,
    type: "query",
    func: (input: unknown) => {
      const validationResult = schemaOrCallback.safeParse(input);
      if (!validationResult.success) {
        // eslint-disable-next-line
        console.error(
          "[Server Query] Validation failed:",
          validationResult.error.toString()
        );

        // Properly map zod errors to the ServerActionError format.
        const errors = validationResult.error.errors.map((error) => ({
          code: "validation_failed",
          title: "Validation failed",
          detail: error.message,
          source: {
            pointer: error.path.join("."),
          },
          meta: {
            reason: error.code,
            expected: "expected" in error ? error.expected : undefined,
            received: "received" in error ? error.received : undefined,
          },
        }));

        return ServerQueryErr(errors);
      }

      return callback?.(validationResult.data);
    },
  };
}
