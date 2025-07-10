# server-queries

## 0.5.2

### Patch Changes

- 3ae23ed: Support browsers not implementing URLSearchParams.prototype.size

## 0.5.1

### Patch Changes

- 4c72cb7: Fix invalid return of serverAction factory function if no schema is supplied

## 0.5.0

### Minor Changes

- a32c54a: Make options argument of `useServerAction` and `useServerMutation` hooks optional

## 0.4.0

### Minor Changes

- a9454e5: Add support for server actions, very similar to server mutation

### Patch Changes

- 1383b69: Ensure consistent file names

## 0.3.0

### Minor Changes

- e573acb: BREAKING: Correct implementation of adding mutate options to mutate function calls to reflect the original implementation in useMutation

### Patch Changes

- d5cd9d5: Improve types of useServerMutation; allow call without schema with no arguments to mutation

## 0.2.0

### Minor Changes

- 81c1ebb: BREAKING: New implementation of useServerMutation hook that wraps the useMutation hook from react-query

## 0.1.5

### Patch Changes

- 10e175c: Do not forcefully expect a payload in the route handler
- bdabd10: Only add ? to fetch path if at least on query param is set

## 0.1.4

### Patch Changes

- 7e0734e: Do not add input payload in caller if input is undefined

## 0.1.3

### Patch Changes

- 98c4517: Fix the types for createRouteHandler to not error when adding multiple different queries

## 0.1.2

### Patch Changes

- bc3d554: Remove webpack loader (install the server-queries-loader package)

## 0.1.1

### Patch Changes

- 135458a: Add readme
