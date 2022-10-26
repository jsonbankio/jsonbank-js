export type NumberAndString = { number: number; string: string };

/**
 * Json Bank Class Config
 */
export type JsonBankConfig = {
    keys?: { pub?: string; prv?: string };
    via?: "http";
    host?: string;
};

// export type JSB_Query = string | string[];
// export type JSB_QueryVars = Record<string, any>;

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
        id: string;
        name: string;
        path: string;
        project: string;
        createdAt: string;

        // module added
        exists?: boolean;
    };

    /**
     * Get Content Meta endpoint response
     * getContentMeta() response
     */
    type ContentMeta = {
        id: string;
        project: string;
        contentSize: NumberAndString;
        path: string;
        updatedAt: string;
        createdAt: string;
    };
}

export declare namespace JSB_Body {
    type CreateDocument = {
        name: string;
        project: string;
        folder?: string;
        content?: string | object;
    };
}
