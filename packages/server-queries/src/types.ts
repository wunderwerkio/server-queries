import { ServerQueryResult } from "./results";

type JsonPrimitive = string | number | boolean | null;
type JsonArray = JsonValue[];
type JsonObject = { [key: string]: JsonValue };
export type JsonValue = JsonPrimitive | JsonArray | JsonObject;

export type LogFunc = (...args: unknown[]) => void;

export interface ServerQueryConfig {
  basePath: string;
  logger: {
    log: LogFunc;
    warn: LogFunc;
    error: LogFunc;
  };
}

export type ValidationError = {
  readonly ok: false;
  readonly err: true;
  readonly val: {
    code: "validation_failed";
    title: string;
    detail: string;
    source: {
      pointer: string;
    };
    meta: {
      reason: string;
      expected?: string;
      received?: string;
    };
  }[];
};

export type ServerQueryFunction<TInput, TResult extends ServerQueryResult> = {
  id: string;
  type: "query" | "mutation";
  func: TInput extends object
    ? (input: TInput) => Promise<ValidationError | TResult>
    : () => Promise<ValidationError | TResult>;
};

export type ServerQueryCaller<
  TInput,
  TResult extends ServerQueryResult,
> = TInput extends object
  ? (input: TInput) => Promise<ValidationError | TResult>
  : () => Promise<ValidationError | TResult>;

export interface ServerQuerySerializer<
  TInput,
  TResult extends ServerQueryResult,
> {
  serializeInput(input: TInput): string;
  serializeResult(input: TResult | ValidationError): string;
  deserializeInput(input: string): TInput;
  deserializeResult(input: string): TResult;
}

export type ExtractOk<T> = T extends {
  readonly ok: true;
  readonly val: infer V;
}
  ? V
  : never;

export type ExtractErr<T> = T extends {
  readonly err: true;
  readonly val: infer V;
}
  ? V
  : never;
