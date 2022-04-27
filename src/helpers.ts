/**
 * Query Parser
 * @param query
 * @param vars
 */
export function jsb_Query(query: string | string[], vars: Record<string, any> = {}) {
    if (Array.isArray(query)) query = query.join(",");
    if (!vars) vars = {};

    return { query, ...vars };
}
