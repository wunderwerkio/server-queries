import { z, ZodSchema } from "zod";

import { ServerQueryErr, ServerQueryResult } from "../results";
import { JsonValue, ValidationError } from "../types";

/**
 * Creates a server action with input validation.
 *
 * Creates a type-safe server action that validates input data against a schema
 * before executing the action logic.
 *
 * ### Key features:
 * - Validates input against Zod schema.
 * - Returns validation errors if input is invalid.
 * - Type-safe input and result handling.
 *
 * @param schema - Zod schema to validate input against.
 * @param callback - Function containing mutation logic.
 */
export function serverAction<
  TSchema extends ZodSchema<JsonValue>,
  TReturn extends PromiseLike<ServerQueryResult>,
>(
  schema: TSchema,
  callback: (input: z.infer<TSchema>) => TReturn,
): (input: z.infer<TSchema>) => Promise<Awaited<TReturn> | ValidationError>;

/**
 * Creates a server action without input.
 *
 * Creates a type-safe server action that executes action logic
 * without requiring any input data.
 *
 * ### Key features:
 * - No input validation needed.
 * - Type-safe result handling.
 *
 * @param callback - Function containing action logic.
 */
export function serverAction<TReturn extends PromiseLike<ServerQueryResult>>(
  callback: () => TReturn,
): () => Promise<Awaited<TReturn> | ValidationError>;

/**
 * Core implementation of the server action function.
 *
 * Creates a server action that optionally validates input data before
 * executing the action logic.
 *
 * ### Key features:
 * - Supports both input and no-input actions.
 * - Validates input against schema if provided.
 * - Returns detailed validation errors.
 *
 * @param schemaOrCallback - Zod schema for input validation or action function.
 * @param callback - Action function if schema is provided.
 */
export function serverAction<TReturn extends PromiseLike<ServerQueryResult>>(
  schemaOrCallback: ZodSchema | (() => PromiseLike<TReturn>),
  callback?: (data: unknown) => PromiseLike<TReturn>,
) {
  if (typeof schemaOrCallback === "function") {
    return () => schemaOrCallback();
  }

  return (input: unknown) => {
    const validationResult = schemaOrCallback.safeParse(input);
    if (!validationResult.success) {
      // eslint-disable-next-line
      console.error(
        "[Server Query] Validation failed:",
        validationResult.error.toString(),
      );

      // Properly map zod errors to the ServerQueryError format.
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
  };
}
