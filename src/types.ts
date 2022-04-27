/**
 * Json Bank Class Config
 */
export type JsonBankConfig = {
    keys?: { pub?: string; prv?: string };
    via?: "http";
};

export type JSB_Query = string | string[];
export type JSB_QueryVars = Record<string, any>;

export declare namespace JSB_Response {
    /**
     * Authenticated endpoint response
     * /v1/authenticate
     */
    type AuthenticatedData = {
        authenticated: boolean;
        username: string;
        apiKey: { title: string; projects: string };
    };

    /**
     * Create Document endpoint response
     * createDocument(): response
     */
    type CreateDocument = {
        document: {
            id: string;
            name: string;
            path: string;
            createdAt: string;
        };
        project: string;
    };

    /**
     * Get Content Meta endpoint response
     * getContentMeta() response
     */
    type ContentMeta = {
        id: string;
        project: string;
        path: string;
        updatedAt: string;
        createdAt: string;
    };
}
