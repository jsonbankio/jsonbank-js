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

    /**
     * Pagination meta included with every paginated list
     */
    type PaginationMeta = {
        page: number;
        perPage: number;
        total: number;
        lastPage: number;
    };

    /**
     * A single page of results
     */
    type Paginated<T> = {
        data: T[];
        meta: PaginationMeta;
    };

    /**
     * The project a listing belongs to
     */
    type ListedProject = {
        slug: string;
        title: string;
        access: "private" | "public";
    };

    /**
     * The folder a listing was scoped to.
     * Only included when a folder was requested.
     */
    type ListedFolder = {
        id: string;
        name: string;
        path: string;
        parentFolder?: string;
    };

    /**
     * Scan Project endpoint response
     * scanProject() response
     */
    interface ScanProject {
        project: ListedProject;
        // folder is not set when the project root was listed
        folder?: ListedFolder;
        documents: Paginated<ContentMeta>;
        folders: Paginated<Folder>;
    }

    /**
     * List Documents endpoint response
     * listDocuments() response
     */
    interface ListDocuments {
        project: ListedProject;
        folder?: ListedFolder;
        documents: Paginated<ContentMeta>;
    }

    /**
     * List Folders endpoint response
     * listFolders() response
     */
    interface ListFolders {
        project: ListedProject;
        folder?: ListedFolder;
        folders: Paginated<Folder>;
    }
}

export declare namespace JSB_Params {
    /**
     * Field a listing can be sorted by
     */
    type SortField = "name" | "createdAt" | "updatedAt";

    /**
     * Direction a listing can be sorted in
     */
    type SortOrder = "asc" | "desc";

    /**
     * Scan Project endpoint query params.
     * Both lists paginate independently of each other.
     */
    type ScanProject = {
        // folder id or path, leave out to list the project root
        folder?: string;
        documentsPage?: number;
        // up to 1000
        documentsPerPage?: number;
        foldersPage?: number;
        // up to 1000
        foldersPerPage?: number;
        sort?: SortField;
        order?: SortOrder;
    };

    /**
     * List Documents/Folders endpoint query params.
     * One list, so one page.
     */
    type ListItems = {
        // folder id or path, leave out to list the project root
        folder?: string;
        page?: number;
        // up to 1000
        perPage?: number;
        sort?: SortField;
        order?: SortOrder;
    };
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
