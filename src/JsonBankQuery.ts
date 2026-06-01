/**
 * Allowed Query modifiers
 */
export const modifiers = [
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
    "mapOmit",

    // Obj
    "get",
    "at",
    "has",
    "keys",
    "values",
    "omit",
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
export type Modifier = (typeof modifiers)[number];

export type JSBVar = { json: string };
export type JSBVarJson = { var: string };
export type JSBArgs = string | string[] | JQVariable;
export type JSBQuery = {
    apply: Modifier;
    args?: JSBArgs;
    query?: Record<string, any>;
};

type JQArg = string | number | JQVariable;
type JQVar = "var" | "json" | "raw" | "b64";

function stringifyIfNotString(data: any): string | any {
    if (typeof data !== "string") {
        return JSON.stringify(data);
    }

    return data;
}
class JQVariable {
    public key: string;
    constructor(public type: JQVar, public data: JQArg | object, key?: string) {
        if (!key) {
            // set key to random 5 char string of alphabet characters
            key = Array.from({ length: 5 }, () =>
                String.fromCharCode(97 + Math.random() * 26)
            ).join("");
        }

        this.type = type;
        this.key = key;

        if (type === "json" || type === "raw") {
            this.data = stringifyIfNotString(data);
        } else if (type === "b64") {
            this.type = "json";
            const encodedData = Buffer.from(stringifyIfNotString(data)).toString("base64");
            this.data = `b64(${encodedData})`;
        } else {
            this.data = data;
        }
    }
}

/**
 * Convert JSBQuery to string
 * @param queries - JSBQuery
 * @example
 * const [query, additionalQueries] = parse_jsb_query({
 *   apply: "mapPick",
 *   args: ["name", "iso3"],
 * })
 */
export function parse_jsb_query(
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
                if (typeof q.args === "object" && q.args instanceof JQVariable) {
                    const arg = q.args;
                    query += `-${arg.type}(${arg.key})`;
                    additionalQueries[arg.key] = arg.data;
                } else {
                    throw new Error(`Argument must be string, array of strings or JQVariable`);
                }
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


export function $var(data: string, key?: string) {
    return new JQVariable("var", data, key);
}

export function $json(data: object, key?: string) {
    return new JQVariable("json", data, key);
}

export function $raw(data: string | object, key?: string) {
    return new JQVariable("raw", data, key);
}

export function $b64(data: object, key?: string) {
    return new JQVariable("b64", data, key);
}

/**
 * Convert JSBQuery or a list of JSBQuery to a query string
 * @param queries
 */
export function jsb_queries(queries: JSBQuery[]) {
    let queryStr = "";
    let queryObj: Record<string, any> = {};

    for (const jsbQuery of queries) {
        const [query, additionalQueries] = parse_jsb_query(jsbQuery);

        if (queryStr) queryStr += ",";
        queryStr += query;

        for (const [key, value] of Object.entries(additionalQueries)) {
            queryObj[key] = value;
        }
    }

    let url = new URL("https://query.jsonbank.io/");
    url.searchParams.set("query", queryStr);
    for (const [key, value] of Object.entries(queryObj)) {
        url.searchParams.set(key, value);
    }

    return url.searchParams.toString();
}

/**
 * Generate helper functions for query modifiers
 * @example
 * const {slice, size} = jsb_query_filters();
 *
 * const query = [
 *  slice(0, 2),
 *  size()
 * ]
 */
export function jsb_query_filters() {
    const helpers: Record<Modifier, (...args: JQArg[]) => JSBQuery> = {} as any;

    /**
     * Loop through and create a helper function for each modifier
     */
    for (const modifier of modifiers) {
        helpers[modifier] = (...args: JQArg[]) => {
            let queryArgs: any;

            if (
                args.length === 1 &&
                typeof args[0] === "object" &&
                args[0] instanceof JQVariable
            ) {
                queryArgs = args[0];
            } else {
                queryArgs = args;
            }

            return { apply: modifier, args: queryArgs };
        };
    }

    return helpers;
}
