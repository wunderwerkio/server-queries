import { z } from "zod";
import { serverAction } from "../src/entry/server";
import { useServerAction } from "../src/entry/client";
import { ServerQueryErr, ServerQueryOk } from "../src/entry/results";
import type { ValidationError } from "../src/types";

// Define a server mutation without input.
const inputLessAction = serverAction(async () => {
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

const inputAction = serverAction(schema, async (input) => {
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

//
// Client hooks.
//

const {
  mutate: mutateInputLessAction,
  mutateAsync: mutateAsyncInputLessAction,
  mutateNoTransition: mutateNoTransitionInputLessAction,
  mutateAsyncNoTransition: mutateAsyncNoTransitionInputLessAction,
} = useServerAction(inputLessAction, {
  onSuccess(result) {
    // `ok` must be a property on result.
    console.log(result.ok);
  },
  onError(error, errors) {
    isInputLessActionError(error);
    isInputLessActionError(errors[0]);
  },
  onSettled(result, error, errors) {
    // Each argument MAY be undefined.
    if (!result || !error || !errors) {
      return;
    }

    // `ok` must be a property on result.
    console.log(result.ok);

    isInputLessActionError(error);
    isInputLessActionError(errors[0]);
  },
  retry: (failureCount, error, errors) => {
    // Make sure failureCount is a number.
    isNumber(failureCount);

    isInputLessActionError(error);
    isInputLessActionError(errors[0]);

    return true;
  },
  retryDelay: (failureCount, error, errors) => {
    isNumber(failureCount);

    isInputLessActionError(error);
    isInputLessActionError(errors[0]);

    return 1;
  },
  throwOnError: (error, errors) => {
    isInputLessActionError(error);
    isInputLessActionError(errors[0]);

    return true;
  },
});

mutateInputLessAction();
// @ts-expect-error Wrong payload type.
mutateInputLessAction({ wrong: "John" });

mutateAsyncInputLessAction();
// @ts-expect-error Wrong payload type.
mutateAsyncInputLessAction({ wrong: "John" });

mutateNoTransitionInputLessAction();
// @ts-expect-error Wrong payload type.
mutateNoTransitionInputLessAction({ wrong: "John" });

mutateAsyncNoTransitionInputLessAction();
// @ts-expect-error Wrong payload type.
mutateAsyncNoTransitionInputLessAction({ wrong: "John" });

const {
  mutate: mutateInputAction,
  mutateAsync: mutateAsyncInputAction,
  mutateNoTransition: mutateNoTransitionInputAction,
  mutateAsyncNoTransition: mutateAsyncNoTransitionInputAction,
} = useServerAction(inputAction, {
  onSuccess(result) {
    // `ok` must be a property on result.
    console.log(result.ok);
  },
  onError(error, errors) {
    isInputActionError(error);
    isInputActionError(errors[0]);
  },
  onSettled(result, error, errors) {
    // Each argument MAY be undefined.
    if (!result || !error || !errors) {
      return;
    }

    // `ok` must be a property on result.
    console.log(result.ok);

    isInputActionError(error);
    isInputActionError(errors[0]);
  },
  retry: (failureCount, error, errors) => {
    // Make sure failureCount is a number.
    isNumber(failureCount);

    isInputActionError(error);
    isInputActionError(errors[0]);

    return true;
  },
  retryDelay: (failureCount, error, errors) => {
    isNumber(failureCount);

    isInputActionError(error);
    isInputActionError(errors[0]);

    return 1;
  },
  throwOnError: (error, errors) => {
    isInputActionError(error);
    isInputActionError(errors[0]);

    return true;
  },
});

mutateInputAction(
  { name: "John", age: 20 },
  {
    onSuccess(result) {
      // `ok` must be a property on result.
      console.log(result.ok);
    },
    onError(error) {
      isInputActionError(error.payload[0]);
    },
  },
);
// @ts-expect-error Wrong payload type.
mutateInputAction({ wrong: "John" });

mutateAsyncInputAction(
  { name: "John", age: 20 },
  {
    onSuccess(result) {
      // `ok` must be a property on result.
      console.log(result.ok);
    },
    onError(error) {
      isInputActionError(error.payload[0]);
    },
  },
);
// @ts-expect-error Wrong payload type.
mutateAsyncInputAction({ wrong: "John" });

mutateNoTransitionInputAction(
  { name: "John", age: 20 },
  {
    onSuccess(result) {
      // `ok` must be a property on result.
      console.log(result.ok);
    },
    onError(error) {
      isInputActionError(error.payload[0]);
    },
  },
);
// @ts-expect-error Wrong payload type.
mutateNoTransitionInputAction({ wrong: "John" });

mutateAsyncNoTransitionInputAction(
  { name: "John", age: 20 },
  {
    onSuccess(result) {
      // `ok` must be a property on result.
      console.log(result.ok);
    },
    onError(error) {
      isInputActionError(error.payload[0]);
    },
  },
);
// @ts-expect-error Wrong payload type.
mutateAsyncNoTransitionInputAction({ wrong: "John" });

//
// Test functions.
//

function isNumber(value: number): void {}

function isInputActionError(
  error:
    | {
        code: "too_young";
        title: string;
      }
    | ValidationError["val"][number],
): void {}

function isInputLessActionError(
  error:
    | {
        code: "random_fail";
        title: string;
      }
    | ValidationError["val"][number],
): void {}
