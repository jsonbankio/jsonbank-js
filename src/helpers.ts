/**
 * Allowed Query modifiers
 */
import { JSB_Body } from "./types";

const modifiers = [
    // Array
    "chunk",
    "first",
    "last",
    "nth",
    "reverse",
    "slice",
    "take",
    "takeRight",
    "mapPick",

    // Obj
    "get",
    "at",
    "has",
    "hasIn",
    "keys",
    "values",
    "valuesIn",
    "keysIn",
    "omit",
    "unset",
    "pick",

    // lang
    "castArray",
    "isArray",

    // Collection
    "find",
    "findLast",
    "filter",
    "size",
    "every",
    "orderBy",
    "sortBy",
    "reject",
    "shuffle",
    "map",

    // math
    "max",
    "min",
    "sum"
] as const;
export type Modifier = typeof modifiers[number];

export type JSBVar = { json: string };
export type JSBVarJson = { var: string };

export type JSBQuery = {
    apply: Modifier;
    args?: string | string[] | JSBVar | JSBVarJson;
    query?: Record<string, any>;
};

/**
 * Convert JSBQuery to string
 * @param queries - JSBQuery
 * @example
 * const [query, additionalQueries] = jsbQuery({
 *   apply: "mapPick",
 *   args: ["name", "iso3"],
 * })
 */
export function jsb_Query(
    queries: JSBQuery | JSBQuery[]
): [string, Record<string, any>] {
    let $queries: string[] = [];
    let additionalQueries = {} as Record<string, any>;

    if (!Array.isArray(queries)) queries = [queries];

    for (const q of queries) {
        let query = q.apply;

        if (q.args) {
            if (typeof q.args === "string") {
                query += "-" + q.args;
            } else if (Array.isArray(q.args)) {
                query += "-" + q.args.join("-");
            } else {
                // args is a JSBVar
                const args = q.args;
                const $var = Object.keys(args)[0];
                const key = Object.values(args)[0];

                query += `-${$var}(${key})`;
            }
        }

        if (q.query) {
            additionalQueries = {
                ...additionalQueries,
                ...q.query
            };
        }

        $queries.push(query);
    }

    return [$queries.join(","), additionalQueries];
}

/**
 * Generate helper functions for query modifiers
 * @example
 * const {mapPick, size} = jsb_generateModifierHelpers();
 *
 * const query = [
 *  mapPick(args, query),
 *  size()
 * ]
 */
export function jsb_generateModifierHelpers() {
    const helpers: Record<
        Modifier,
        (args?: JSBQuery["args"], query?: JSBQuery["query"]) => JSBQuery
    > = {} as any;

    /**
     * Loop through and create a helper function for each modifier
     */
    for (const modifier of modifiers) {
        helpers[modifier] = (args, query) => {
            return {
                apply: modifier,
                args,
                query
            };
        };
    }

    return helpers;
}

/**
 * Make  path from document object
 * @param document
 */
export function jsb_makeDocumentPath(
    document: Pick<JSB_Body.CreateDocument, "name" | "folder" | "project">
) {
    const folder =
        document.folder && document.folder.length ? document.folder + "/" : "";
    return `${document.project}/${folder}${document.name}`;
}
