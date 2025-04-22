import { ServerQueryResult } from "../results";
import { ServerQuerySerializer, ValidationError } from "../types";

/**
 * Creates a serializer for handling JSON serialization of server query data.
 *
 * ### Key features:
 * - Handles serialization of input data and results.
 * - Provides type-safe serialization methods.
 * - Uses JSON.stringify/parse for data conversion.
 *
 * @throws {Error} If input/result data cannot be serialized or parsed.
 */
export function createJsonSerializer<
  TInput,
  TResult extends ServerQueryResult,
>(): ServerQuerySerializer<TInput, TResult> {
  return {
    serializeInput(input: TInput): string {
      return JSON.stringify(input);
    },
    serializeResult(input: TResult | ValidationError): string {
      return JSON.stringify(input);
    },
    deserializeInput(input: string): TInput {
      return JSON.parse(input) as TInput;
    },
    deserializeResult(input: string): TResult {
      return JSON.parse(input) as TResult;
    },
  };
}
