import { ServerQueryResult } from "./results";

/** Basic JSON primitive types. */
type JsonPrimitive = string | number | boolean | null;

/** Array of JSON values. */
type JsonArray = JsonValue[];

/** Object with string keys and JSON values. */
type JsonObject = { [key: string]: JsonValue };

/** Any valid JSON value. */
export type JsonValue = JsonPrimitive | JsonArray | JsonObject;

/** Function for logging messages. */
export type LogFunc = (...args: unknown[]) => void;

/** Configuration for server queries. */
export interface ServerQueryConfig {
  /** Base URL path for API requests. */
  basePath: string;
  /** Logger interface for different log levels. */
  logger: {
    /** Log informational messages. */
    log: LogFunc;
    /** Log warning messages. */
    warn: LogFunc;
    /** Log error messages. */
    error: LogFunc;
  };
}

/** Error returned when request validation fails. */
export type ValidationError = {
  /** Indicates validation failure. */
  readonly ok: false;
  /** Indicates error state. */
  readonly err: true;
  /** Array of validation error details. */
  readonly val: {
    /** Error code indicating validation failure. */
    code: "validation_failed";
    /** Short error title. */
    title: string;
    /** Detailed error message. */
    detail: string;
    /** Location where error occurred. */
    source: {
      /** JSON pointer to error location. */
      pointer: string;
    };
    /** Additional error metadata. */
    meta: {
      /** Reason for validation failure. */
      reason: string;
      /** Expected value if applicable. */
      expected?: string;
      /** Received value if applicable. */
      received?: string;
    };
  }[];
};

/** Server query or mutation function definition. */
export type ServerQueryFunction<TInput, TResult extends ServerQueryResult> = {
  /** Unique identifier for the query/mutation. */
  id: string;
  /** Type of operation. */
  type: "query" | "mutation";
  /** Function implementation that handles the request. */
  func: TInput extends object
    ? (input: TInput) => Promise<ValidationError | TResult>
    : () => Promise<ValidationError | TResult>;
};

/** Server action function definition. */
export type ServerActionFunction<
  TInput,
  TResult extends ServerQueryResult,
> = TInput extends object
  ? (input: TInput) => Promise<ValidationError | TResult>
  : () => Promise<ValidationError | TResult>;

/** Function for executing server queries/mutations. */
export type ServerQueryCaller<
  TInput,
  TResult extends ServerQueryResult,
> = TInput extends object
  ? (input: TInput) => Promise<ValidationError | TResult>
  : () => Promise<ValidationError | TResult>;

/** Interface for serializing server query inputs and results. */
export interface ServerQuerySerializer<
  TInput,
  TResult extends ServerQueryResult,
> {
  /** Serialize query input to string. */
  serializeInput(input: TInput): string;
  /** Serialize query result to string. */
  serializeResult(input: TResult | ValidationError): string;
  /** Deserialize string to query input. */
  deserializeInput(input: string): TInput;
  /** Deserialize string to query result. */
  deserializeResult(input: string): TResult;
}

/** Extract success value type from result. */
export type ExtractOk<T> = T extends {
  readonly ok: true;
  readonly val: infer V;
}
  ? V
  : never;

/** Extract error value type from result. */
export type ExtractErr<T> = T extends {
  readonly err: true;
  readonly val: infer V;
}
  ? V extends Array<infer U>
    ? U
    : V
  : never;
