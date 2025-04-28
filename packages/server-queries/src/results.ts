// This type defines the payload that is serializable by
// react server query.
export type ServerQueryPayload =
  | string
  | number
  | boolean
  | null
  | undefined
  | object
  | ServerQueryPayload[]
  | { [key: string | number]: ServerQueryPayload };

// The server query error.
export interface ServerQueryError<TMeta = Record<string, unknown>> {
  id?: string;
  links?: {
    about?: string;
    type?: string;
  };
  status?: string;
  code?: string;
  title?: string;
  detail?: string;
  source?: {
    pointer?: string;
    parameter?: string;
    header?: string;
  };
  meta?: TMeta;
}

// Defines a server query result.
export type ServerQueryResult = ServerQueryResultOk | ServerQueryResultErr;

/**
 * Create a server query ok result.
 *
 * @param val - The success payload. Defaults to undefined if not set.
 */
export const ServerQueryOk = <const T extends ServerQueryPayload>(val: T) => {
  return {
    ok: true,
    err: false,
    val,
  } as const;
};

export type ServerQueryResultOk = ReturnType<typeof ServerQueryOk>;

/**
 * Create a server query error result.
 *
 * @param err - The error.
 */
export const ServerQueryErr = <const T extends ServerQueryError>(
  err: T | T[],
) => {
  const val = Array.isArray(err) ? err : [err];

  return {
    ok: false,
    err: true,
    val,
  } as const;
};

export type ServerQueryResultErr = ReturnType<typeof ServerQueryErr>;
