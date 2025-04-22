import generate from "@babel/generator";
import * as parser from "@babel/parser";
import { type Node } from "@babel/types";
import type webpack from "webpack";

/**
 * Webpack loader that transforms server query imports.
 *
 * Note: This loader works with turbopack!
 *
 * This loader processes import statements with server query attributes and transforms them
 * into the appropriate runtime code. It handles both server queries and mutations.
 *
 * This loader is needed, because using the server query/mutation in the client code results
 * in the server code being bundled into the client bundle, which leads to an error, when
 * using `import "server-only"` in the query/mutation file.
 *
 * The loader checks for files importing a query/mutation with import attributes specifying the
 * type (either "server-query" or "server-mutation") and the id of the query/mutation. It then
 * transforms the to only import the type from the query/mutation and creates a new variable
 * with just enough data for the caller to be satisfied on the client.
 *
 * ### Key features:
 * - Transforms import assertions for server queries and mutations.
 * - Validates import attributes and IDs.
 * - Generates optimized runtime code.
 *
 * @param source - The source code content of the module being loaded.
 * @throws {Error} If invalid import attributes are found.
 */
export default function loader(this: LoaderThis<unknown>, source: string) {
  // First quick check.
  if (!source.includes("server-query") && !source.includes("server-mutation")) {
    return source;
  }

  // Second more thorough check using regex.
  // Makes sure that there is a with clause in the import.
  const singleLineSource = source.replace(/[\r\n]+/g, "");
  if (!/import[^;]*with[\s\n]*{.*}/.test(singleLineSource)) {
    return source;
  }

  // Parse the source code into an AST.
  const ast = parser.parse(source, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });

  const transformedServerQueryImports = new Map<
    string,
    { id: string; type: string }
  >();

  // Transform import assertions.
  for (const node of ast.program.body) {
    if (node.type === "ImportDeclaration") {
      if (
        node.attributes?.find(
          (attr) =>
            (attr.type === "ImportAttribute" &&
              attr.key?.type === "Identifier" &&
              attr.key.name === "type" &&
              attr.value?.value === "server-query") ||
            attr.value?.value === "server-mutation",
        )
      ) {
        const id = node.attributes?.find(
          (attr) =>
            attr.type === "ImportAttribute" &&
            attr.key?.type === "Identifier" &&
            attr.key.name === "id",
        )?.value.value;

        const type = node.attributes?.find(
          (attr) =>
            attr.type === "ImportAttribute" &&
            attr.key?.type === "Identifier" &&
            attr.key.name === "type",
        )?.value.value;

        if (type !== "server-query" && type !== "server-mutation") {
          this.emitError(
            new Error(
              `Server query type ${type} is not supported. Only "server-query" and "server-mutation" are supported.`,
            ),
          );

          continue;
        }

        if (!id) {
          this.emitError(
            new Error(
              `Server query import must specify it's ID in the with clause.`,
            ),
          );

          continue;
        }

        node.attributes = [];
        node.importKind = "type";

        const hasNamedImport =
          node.specifiers.findIndex(
            (spec) => spec.type === "ImportSpecifier",
          ) !== -1;

        if (hasNamedImport) {
          const namedSpec = node.specifiers.find(
            (spec) => spec.type === "ImportSpecifier",
          );
          if (!namedSpec) {
            continue;
          }

          const localName = namedSpec.local.name;
          const originalName =
            namedSpec.imported.type === "Identifier"
              ? namedSpec.imported.name
              : namedSpec.imported.value;

          const name = localName === originalName ? originalName : localName;

          namedSpec.local.name = `_clientOnlyServerQuery_${name}`;

          transformedServerQueryImports.set(name, {
            id,
            type: type.startsWith("server-") ? type.slice(7) : type,
          });
        }
      }
    }
  }

  // Generate code without transforming the syntax
  const output = generate(
    ast as Node,
    {
      retainLines: true,
    },
    source,
  );

  for (const [name, { id, type }] of transformedServerQueryImports.entries()) {
    output.code += `
const ${name} = {
  id: "${id}",
  type: "${type}",
} as typeof _clientOnlyServerQuery_${name};
    `;
  }

  return output.code;
}

export type LoaderThis<Options> = {
  /**
   * Path to the file being loaded.
   *
   * @see https://webpack.js.org/api/loaders/#thisresourcepath
   */
  resourcePath: string;

  /**
   * Function to add outside file used by loader to `watch` process.
   *
   * @see https://webpack.js.org/api/loaders/#thisadddependency
   */
  addDependency: (filepath: string) => void;

  /**
   * Marks a loader result as cacheable.
   *
   * @see https://webpack.js.org/api/loaders/#thiscacheable
   */
  cacheable: (flag: boolean) => void;

  /**
   * Marks a loader as asynchronous.
   *
   * @see https://webpack.js.org/api/loaders/#thisasync
   */
  async: webpack.LoaderContext<unknown>["async"];

  /**
   * Return errors, code, and sourcemaps from an asynchronous loader.
   *
   * @see https://webpack.js.org/api/loaders/#thiscallback
   */
  callback: webpack.LoaderContext<unknown>["callback"];
  /**
   * Loader options in Webpack 5.
   *
   * @see https://webpack.js.org/api/loaders/#thisgetoptionsschema
   */
  getOptions: () => Options;

  /**
   * Emit an error during compilation.
   *
   * @see https://webpack.js.org/api/loaders/#thisemiterror
   */
  emitError: webpack.LoaderContext<unknown>["emitError"];

  /**
   * The absolute path to the root directory of the project.
   *
   * @see https://webpack.js.org/api/loaders/#thisrootcontext
   */
  rootContext: string;
};
