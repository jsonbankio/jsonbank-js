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
    type NewDocument = {
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
     * getDocumentMeta() response
     */
    type ContentMeta = {
        id: string;
        project: string;
        contentSize: NumberAndString;
        path: string;
        name: string;
        folderId?: string;
        updatedAt: string;
        createdAt: string;
    };

    /**
     * Folder Stats
     */
    type FolderStats = {
        documents: number;
        folders: number;
    };

    /**
     * Get Folder endpoint response
     */
    interface Folder {
        id: string;
        name: string;
        path: string;
        project: string;
        parentFolder?: string;
        createdAt: string;
        updatedAt: string;
        // stats field is optional and will exist only when requested
        stats?: FolderStats;
    }

    /**
     * New Folder endpoint response
     */
    interface NewFolder extends Folder {
        // added by createFolderIfNotExists()
        exists?: boolean;
    }
}

export declare namespace JSB_Body {
    /**
     * Create Document endpoint body
     */
    type CreateDocument = {
        name: string;
        project: string;
        folder?: string;
        content?: string | object;
    };

    /**
     * Create Folder endpoint body
     */
    type CreateFolder = { name: string; project: string; folder?: string };
}
