"use client";

import { createContext, useMemo } from "react";

import { ServerQueryConfig } from "../types";

/** Default configuration for server queries. */
export const defaultServerQueryConfig: ServerQueryConfig = {
  basePath: "/query",
  logger: console,
};

/** Context for sharing server query configuration. */
export const ServerQueryConfigContext = createContext<ServerQueryConfig>(
  defaultServerQueryConfig,
);

/** Props for the ServerQueryConfigProvider component. */
type Props = {
  /** Child components that will have access to the server query configuration. */
  children: React.ReactNode;
  /** Optional configuration to override the default server query settings. */
  config?: Partial<ServerQueryConfig>;
};

/**
 * Provider component for server query configuration.
 *
 * Allows customizing the configuration for server queries and makes it available
 * to child components through context.
 */
export const ServerQueryConfigProvider = ({ children, config }: Props) => {
  const mergedConfig = useMemo(() => {
    return { ...defaultServerQueryConfig, ...config };
  }, [config]);

  return (
    <ServerQueryConfigContext.Provider value={mergedConfig}>
      {children}
    </ServerQueryConfigContext.Provider>
  );
};
