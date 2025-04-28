import { z } from "zod";
import { createRouteHandler, serverMutation } from "../src/entry/server";
import { useServerMutation } from "../src/entry/client";
import { ServerQueryErr, ServerQueryOk } from "../src/entry/results";
import type { ValidationError } from "../src/types";

// Define a server mutation without input.
const inputLessMutation = serverMutation("test", async () => {
  if (Math.random() > 0.5) {
    return ServerQueryOk({
      ok: true,
    });
  }

  return ServerQueryErr({
    code: "random_fail",
    title: "Random failure",
  });
});

const schema = z.object({
  name: z.string(),
  age: z.number(),
});

const inputMutation = serverMutation("test", schema, async (input) => {
  if (input.age < 18) {
    return ServerQueryErr({
      code: "too_young",
      title: "Too young",
    });
  }

  // Make sure input.age is number.
  console.log(input.age.toExponential());
  // Make sure input.name is string.
  console.log(input.name.startsWith("John"));

  // @ts-expect-error This property must not exist.
  console.log(input.non_existant);

  return ServerQueryOk({
    ok: true,
  });
});

// Test types in route handler.
createRouteHandler([inputLessMutation, inputMutation]);

//
// Client hooks.
//

const {
  mutate: mutateInputLessMutation,
  mutateAsync: mutateAsyncInputLessMutation,
  mutateNoTransition: mutateNoTransitionInputLessMutation,
  mutateAsyncNoTransition: mutateAsyncNoTransitionInputLessMutation,
} = useServerMutation(inputLessMutation, {
  onSuccess(result) {
    // `ok` must be a property on result.
    console.log(result.ok);
  },
  onError(error, errors) {
    isInputLessMutationError(error);
    isInputLessMutationError(errors[0]);
  },
  onSettled(result, error, errors) {
    // Each argument MAY be undefined.
    if (!result || !error || !errors) {
      return;
    }

    // `ok` must be a property on result.
    console.log(result.ok);

    isInputLessMutationError(error);
    isInputLessMutationError(errors[0]);
  },
  retry: (failureCount, error, errors) => {
    // Make sure failureCount is a number.
    isNumber(failureCount);

    isInputLessMutationError(error);
    isInputLessMutationError(errors[0]);

    return true;
  },
  retryDelay: (failureCount, error, errors) => {
    isNumber(failureCount);

    isInputLessMutationError(error);
    isInputLessMutationError(errors[0]);

    return 1;
  },
  throwOnError: (error, errors) => {
    isInputLessMutationError(error);
    isInputLessMutationError(errors[0]);

    return true;
  },
});

mutateInputLessMutation();
// @ts-expect-error Wrong payload type.
mutateInputLessMutation({ wrong: "John" });

mutateAsyncInputLessMutation();
// @ts-expect-error Wrong payload type.
mutateAsyncInputLessMutation({ wrong: "John" });

mutateNoTransitionInputLessMutation();
// @ts-expect-error Wrong payload type.
mutateNoTransitionInputLessMutation({ wrong: "John" });

mutateAsyncNoTransitionInputLessMutation();
// @ts-expect-error Wrong payload type.
mutateAsyncNoTransitionInputLessMutation({ wrong: "John" });

const {
  mutate: mutateInputMutation,
  mutateAsync: mutateAsyncInputMutation,
  mutateNoTransition: mutateNoTransitionInputMutation,
  mutateAsyncNoTransition: mutateAsyncNoTransitionInputMutation,
} = useServerMutation(inputMutation, {
  onSuccess(result) {
    // `ok` must be a property on result.
    console.log(result.ok);
  },
  onError(error, errors) {
    isInputMutationError(error);
    isInputMutationError(errors[0]);
  },
  onSettled(result, error, errors) {
    // Each argument MAY be undefined.
    if (!result || !error || !errors) {
      return;
    }

    // `ok` must be a property on result.
    console.log(result.ok);

    isInputMutationError(error);
    isInputMutationError(errors[0]);
  },
  retry: (failureCount, error, errors) => {
    // Make sure failureCount is a number.
    isNumber(failureCount);

    isInputMutationError(error);
    isInputMutationError(errors[0]);

    return true;
  },
  retryDelay: (failureCount, error, errors) => {
    isNumber(failureCount);

    isInputMutationError(error);
    isInputMutationError(errors[0]);

    return 1;
  },
  throwOnError: (error, errors) => {
    isInputMutationError(error);
    isInputMutationError(errors[0]);

    return true;
  },
});

mutateInputMutation(
  { name: "John", age: 20 },
  {
    onSuccess(result) {
      // `ok` must be a property on result.
      console.log(result.ok);
    },
    onError(error) {
      isInputMutationError(error.payload[0]);
    },
  },
);
// @ts-expect-error Wrong payload type.
mutateInputMutation({ wrong: "John" });

mutateAsyncInputMutation(
  { name: "John", age: 20 },
  {
    onSuccess(result) {
      // `ok` must be a property on result.
      console.log(result.ok);
    },
    onError(error) {
      isInputMutationError(error.payload[0]);
    },
  },
);
// @ts-expect-error Wrong payload type.
mutateAsyncInputMutation({ wrong: "John" });

mutateNoTransitionInputMutation(
  { name: "John", age: 20 },
  {
    onSuccess(result) {
      // `ok` must be a property on result.
      console.log(result.ok);
    },
    onError(error) {
      isInputMutationError(error.payload[0]);
    },
  },
);
// @ts-expect-error Wrong payload type.
mutateNoTransitionInputMutation({ wrong: "John" });

mutateAsyncNoTransitionInputMutation(
  { name: "John", age: 20 },
  {
    onSuccess(result) {
      // `ok` must be a property on result.
      console.log(result.ok);
    },
    onError(error) {
      isInputMutationError(error.payload[0]);
    },
  },
);
// @ts-expect-error Wrong payload type.
mutateAsyncNoTransitionInputMutation({ wrong: "John" });

//
// Test functions.
//

function isNumber(value: number): void {}

function isInputMutationError(
  error:
    | {
        code: "too_young";
        title: string;
      }
    | ValidationError["val"][number],
): void {}

function isInputLessMutationError(
  error:
    | {
        code: "random_fail";
        title: string;
      }
    | ValidationError["val"][number],
): void {}
