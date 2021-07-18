import constants from "../constants";

/**
 * Handles Axios Http Errors
 * @reason redundancy
 * @param err
 */
export function jsb_handleHttpError(err: any) {
    if (err.response) {
        if (err.response.data && err.response.data.error) {
            return Error(err.response.data.error);
        }
    }

    console.log(err);

    return Error(`Could not connect to ${constants.domain}`);
}

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
