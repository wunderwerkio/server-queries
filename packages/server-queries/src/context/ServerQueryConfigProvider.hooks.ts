import { useContext } from "react";

import { ServerQueryConfigContext } from "./ServerQueryConfigProvider.client";

/**
 * Hook to access the server query configuration from context.
 * 
 * @throws {Error} If used outside of a ServerQueryConfigProvider.
 */
export function useServerQueryConfig() {
  const config = useContext(ServerQueryConfigContext);
  if (!config) {
    throw new Error(
      "useServerQuery, useServerInfiniteQuery, and useServerMutation must be used within a ServerQueryConfigProvider!",
    );
  }

  return config;
}
