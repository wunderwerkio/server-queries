# server-queries

A powerful TypeScript-first userland implementation of server actions with more
flexibility and support for data fetching.

This library is not a replacement but rather a powerful addition to the
server actions in Next.js.

## Features

- 🔒 **Type-safe Server Queries**: Full end-to-end type safety for your server-side queries.
- ⚡ **Optimized Performance**: Uses fetch requests under the hood with support for custom request options and abort signals.
- 🎯 **React Query Integration**: Seamless integration with TanStack Query for efficient data fetching and caching.
- 🛡️ **Zod Validation**: Built-in support for runtime validation using Zod schemas.
- 🎨 **Improved DX**: Usage is _very similar_ to server actions which you already know and love.
- ⚡️ **Fully Parallel**: Execution of server queries and mutations takes place completely in parallel.
- 🔄 **Automatic Code Transformation**: Webpack loader automatically transforms client-side code to not import server-only code.
- 🎯 **Uniform Error Format**: All errors follow the standardized JSON:API error format for consistent error handling.

## Installation

```bash
npm install server-queries
# or
yarn add server-queries
# or
pnpm add server-queries
```

## Configuration

To use server-queries in your Next.js project, you need to configure the webpack loader. Add the following to your `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      use: [
        {
          loader: "server-queries/webpack-loader",
        },
      ],
    });
    return config;
  },
};

module.exports = nextConfig;
```

## Usage

### 1. Define Your Server Query

```typescript
// ./src/server/my-query.ts
import { serverQuery } from "server-queries/server";
import { ServerQueryErr, ServerQueryOk } from "server-queries/results";

export const myQuery = serverQuery("my-query", async () => {
  const success = doSomethingOnTheServer();
  if (!success) {
    return ServerQueryErr({
      code: "some-error",
      title: "A server error occured",
    });
  }

  return ServerQueryOk({
    status: "ok",
  });
});
```

### 2. Add/Update the route handler.

Server queries and mutations use Next.js Route Handlers.  
Create a new file in `./src/app/query/[id]/route.ts`:

```typescript
import { createRouteHandler } from "server-queries/server";

import { myQuery } from "@/server/my-query";

// Add all queries and mutations in the array.
// The request will only be handled for a query or mutation if it is
// registered in this function.
export const { GET, POST } = createRouteHandler([myQuery]);
```

### 3. Use the query in your react component.

> [!IMPORTANT]
> Do not forget the import attributes!
>
> The type is either `server-query` or `server-mutation` and the ID MUST match
> the specified ID of the server query / mutation.

```typescript
// ./src/app/components/SomeComponent.tsx
import { useServerQuery } from 'server-queries/client';

// IMPORTANT: This library only works by adding the correct import attributes
// when importing the query or mutation in client code!!!
import { myQuery } from '@/server/my-query' with { type: "server-query", id: "my-query" };

export function SomeComponent() {
  const { data, isLoading, error } = useServerQuery(myQuery, {
    queryKey: ["my-query-key"],
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{data.status}</h1>
    </div>
  );
}
```

### Queries with input parameters.

Server queries can also support input parameters with schema validation.

The input is validated by the specified zod schema.
If validation fails, a validation error is automatically returned from the
query.

```typescript
// ./src/server/my-query-with-input.ts
import { z } from "zod";
import { serverQuery } from "server-queries/server";
import { ServerQueryErr, ServerQueryOk } from "server-queries/results";

const schema = z.object({
  name: z.string(),
  age: z.number(),
});

export const myQueryWithInput = serverQuery(
  "my-query-with-input",
  async (input) => {
    const success = doSomethingOnTheServer({
      // Use the data from input.
      name: input.name,
      age: input.age,
    });
    if (!success) {
      return ServerQueryErr({
        code: "some-error",
        title: "A server error occured",
      });
    }

    return ServerQueryOk({
      status: "ok",
    });
  }
);
```

```typescript
// ./src/app/components/SomeComponent.tsx
import { useServerQuery } from 'server-queries/client';

// IMPORTANT: This library only works by adding the correct import attributes
// when importing the query or mutation in client code!!!
import { myQueryWithInput } from '@/server/my-query-with-input' with { type: "server-query", id: "my-query-with-input" };

export function SomeComponent() {
  const { data, isLoading, error } = useServerQuery(myQueryWithInput, {
    queryKey: ["my-query-key"],
    // Pass the input here, can be state, props, etc.
    // But if so, do not forget to add the input to the query key!
    input: {
      name: "some-name",
      age: 40,
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{data.status}</h1>
    </div>
  );
}
```

### Infinite Query

A Server Query can also be used with infinite loading, by using the
`useServerInfiniteQuery` hook. Follow the [TanStack Query Infinite Query docs](https://tanstack.com/query/latest/docs/react/guides/infinite-queries) for more info. 

### Server Mutations

A server mutation has the same purpose as a server action, except that server
mutations can be triggered in parallel. When triggering a data mutation due to
user interaction, use of a **Server Action (!)** is always preferred!

*TODO: add documentation*

## Why Webpack Loader?

The webpack loader is a crucial part of the server-queries package.

To achieve a good DX similar to server actions, a server query / muation must
be importable in the client code in order to directly use it in the desired
hook.

This however leads to importing server code in a client component, which is
very dangerous because the server-code will be bundled in the client code if not
using `import "server-only"`!

The loader checks for all client code that imports a server query / muation
using the correct import attributes (the `with` statement at the end).

The import is then rewritten to only import the type (this makes sure to not
imoprt any actual server code), but keeps type-safety in tact by leaving the
needed TypeScript information.

Code for a mock object is then injected into the source code which is asserted
to the imported type of the query / mutation and thus making the TypeScript
compiler happy. But the object only contains the correct ID and type of the
server query / mutation, which is the minimal needed data for the caller to
create the request to the route handler.

## API Reference

### Server-side

- `serverQuery`: Factory function to create a server query (GET request).
- `serverMutation`: Factory function to create a server mutation (POST request).
- `createRouteHandler`: Function to create the GET and POST route handler in Next.js.

### Client-side

- `useServerQuery`: React hook for executing server queries.
- `useServerInfiniteQuery`: React hook for infinite loading queries.
- `useServerMutation`: React hook for executing a server mutation.
- `ServerQueryConfigProvider`: Context provider for global configuration.
