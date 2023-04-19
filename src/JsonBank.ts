import axios, { AxiosInstance } from "axios";
import {
    jsb_makeDocumentPath,
    jsb_makeFolderPath,
    jsb_Query,
    JSBQuery
} from "./helpers";
import Memory from "./memory";
import { JSB_Body, JSB_Response, JsonBankConfig } from "./types";

export class JSB_Error extends Error {
    code?: string;

    constructor(message?: string) {
        super(message);
        this.name = "JSB_Error";
    }
}

/**
 * Json Bank class
 */
class JsonBank {
    private config!: JsonBankConfig;
    private memory!: Memory;
    #api: AxiosInstance;
    #v1: AxiosInstance;

    constructor(config?: JsonBankConfig) {
        if (!config) config = {};

        config.host = config.host || "https://api.jsonbank.io";

        // Api instance
        this.#api = axios.create({
            baseURL: config.host
        });

        // Api version 1 instance
        this.#v1 = axios.create({
            baseURL: config.host + "/v1"
        });

        // Set Config
        Object.defineProperty(this, "config", {
            value: config || {},
            enumerable: false
        });

        // Set Memory
        Object.defineProperty(this, "memory", {
            value: new Memory(),
            enumerable: false
        });

        // Set default config
        if (this.config.keys) {
            this.memory.path("axios.headers").setDefined({
                "jsb-pub-key": this.config.keys.pub,
                "jsb-prv-key": this.config.keys.prv
            });
        }
    }

    /**
     * Handles Axios Http Errors
     * @reason redundancy
     * @param err
     */
    protected ___handleHttpError(err: any) {
        if (err.response) {
            if (err.response.data && err.response.data.error) {
                const error = err.response.data.error;
                const e = new JSB_Error();

                if (typeof error === "object") {
                    e.code = error.code;
                    e.message = error.message;
                } else {
                    e.message = error;
                }

                return e;
            }
        }

        return Error(`Could not connect to ${this.config.host}`);
    }

    /**
     * Check if instance is authenticated.
     */
    isAuthenticated() {
        return this.memory.get("isAuthenticated") === true;
    }

    /**
     * Authenticate instance.
     * @note Uses public key only.
     */
    async authenticate() {
        try {
            const { data } = await this.#v1.post<JSB_Response.AuthenticatedData>(
                "authenticate",
                {},
                this.memory.axiosPubKeyHeader()
            );

            if (data.authenticated) {
                this.memory.set("isAuthenticated", true);
                this.memory.set("authData", data);
            }

            return data;
        } catch (err) {
            throw this.___handleHttpError(err);
        }
    }

    getUsername() {
        return this.memory.get("authData.username");
    }

    /**
     * Get Public Content by ID or Path
     * @param idOrPath
     * @param jsbQuery
     * @param queries
     */
    async getContent<T = any>(
        idOrPath: string,
        jsbQuery: JSBQuery | JSBQuery[] = [],
        queries: Record<string, any> = {}
    ): Promise<T> {
        try {
            const { data } = await this.#api.get("f/" + idOrPath, {
                params: JsonBank.queryParam(jsbQuery, queries)
            });
            return data;
        } catch (err) {
            throw this.___handleHttpError(err);
        }
    }

    /**
     * Get Public Content Meta by ID or Path
     * @param idOrPath
     */
    async getDocumentMeta(idOrPath: string): Promise<JSB_Response.ContentMeta> {
        try {
            const { data } = await this.#api.get("meta/f/" + idOrPath, {
                params: { meta: true }
            });

            return data;
        } catch (err: any) {
            throw this.___handleHttpError(err);
        }
    }

    /**
     * Get Public content meta by path
     * @param path
     */
    async getDocumentMetaByPath(path: string): Promise<JSB_Response.ContentMeta> {
        return this.getDocumentMeta(path);
    }

    /**
     * Get Public content by path
     * @param path
     * @param jsbQuery
     * @param queries
     */
    async getContentByPath<T = any>(
        path: string,
        jsbQuery: JSBQuery | JSBQuery[] = [],
        queries: Record<string, any> = {}
    ): Promise<T> {
        return this.getContent<T>(path, jsbQuery, queries);
    }

    /**
     * Get  a json file from GitHub
     * @param path
     * @param jsbQuery
     * @param queries
     */
    async getGithubContent<T = any>(
        path: string,
        jsbQuery: JSBQuery | JSBQuery[] = [],
        queries: Record<string, any> = {}
    ): Promise<T> {
        try {
            const { data } = await this.#api.get("gh/" + path, {
                params: JsonBank.queryParam(jsbQuery, queries)
            });
            return data;
        } catch (err) {
            throw this.___handleHttpError(err);
        }
    }

    protected static queryParam(
        query?: JSBQuery | JSBQuery[],
        queries: Record<string, any> = {}
    ) {
        if (!query) return {};

        const [q, additionalQueries] = jsb_Query(query);

        if (!q) return {};

        return {
            query: q,
            ...(additionalQueries || {}),
            ...queries
        };
    }

    /**
     * Get own Content by ID or Path
     * @param idOrPath
     * @param jsbQuery
     * @param queries
     */
    async getOwnContent<T = any>(
        idOrPath: string,
        jsbQuery: JSBQuery[] = [],
        queries: Record<string, any> = {}
    ): Promise<T> {
        const config = this.memory.axiosPubKeyHeader({
            params: JsonBank.queryParam(jsbQuery, queries)
        });

        try {
            const { data } = await this.#v1.get<T>("file/" + idOrPath, config);
            return data;
        } catch (err) {
            throw this.___handleHttpError(err);
        }
    }

    /**
     * Get own Content Meta by ID or Path
     * @param idOrPath
     */
    async getOwnDocumentMeta(idOrPath: string): Promise<JSB_Response.ContentMeta> {
        const config = this.memory.axiosPubKeyHeader();

        try {
            const { data } = await this.#v1.get("meta/file/" + idOrPath, config);
            return data;
        } catch (err) {
            throw this.___handleHttpError(err);
        }
    }

    /**
     * Get own Content Meta by ID or Path
     * @param path
     */
    async getOwnDocumentMetaByPath(path: string): Promise<JSB_Response.ContentMeta> {
        return this.getOwnDocumentMeta(path);
    }

    /**
     * Get own Content by ID or Path
     * @param path
     * @param jsbQuery
     * @param queries
     */
    async getOwnContentByPath<T = any>(
        path: string,
        jsbQuery: JSBQuery[] = [],
        queries: Record<string, any> = {}
    ): Promise<T> {
        return this.getOwnContent<T>(path, jsbQuery, queries);
    }

    /**
     * Check if a file exists
     * @param idOrPath
     */
    async hasOwnDocument(idOrPath: string): Promise<boolean> {
        try {
            await this.getOwnContent(idOrPath);
            return true;
        } catch (err) {
            return false;
        }
    }

    /**
     * Update own Content by ID or Path
     * @param idOrPath
     * @param content
     */
    async updateOwnDocument(
        idOrPath: string,
        content: string | object
    ): Promise<{ id: string; changed: boolean; message: string }> {
        if (typeof content === "object") {
            content = JSON.stringify(content);
        }

        try {
            const { data } = await this.#v1.post(
                "file/" + idOrPath,
                { content },
                this.memory.axiosPrvKeyHeader()
            );

            return data;
        } catch (err) {
            throw this.___handleHttpError(err);
        }
    }

    /**
     * Create a new document
     * @param document
     */
    async createDocument(document: JSB_Body.CreateDocument) {
        if (typeof document.content === "object") {
            document.content = JSON.stringify(document.content, null, 0);
        }

        try {
            const { data } = await this.#v1.post<JSB_Response.NewDocument>(
                `project/${document.project}/document`,
                { ...document },
                this.memory.axiosPrvKeyHeader()
            );

            return data;
        } catch (err) {
            throw this.___handleHttpError(err);
        }
    }

    /**
     * Create Document if not exists,
     * This method will try to create a document
     * If it fails with code "name.exists", it will try to get the document by meta
     * @param document
     */
    async createDocumentIfNotExists(
        document: JSB_Body.CreateDocument
    ): Promise<JSB_Response.NewDocument> {
        try {
            return await this.createDocument(document);
        } catch (err: any) {
            // If a document already exists
            // find a document by meta and return it
            if (err.code && err.code === "name.exists") {
                const doc = await this.getOwnDocumentMetaByPath(
                    jsb_makeDocumentPath(document)
                );

                return {
                    id: doc.id,
                    path: doc.path,
                    name: document.name,
                    project: doc.project,
                    createdAt: doc.createdAt,
                    exists: true
                };
            }

            throw err;
        }
    }

    /**
     * Delete own document
     * @param idOrPath
     */
    async deleteDocument(idOrPath: string) {
        try {
            const { data } = await this.#v1.delete(
                "file/" + idOrPath,
                this.memory.axiosPrvKeyHeader()
            );

            return data as { deleted: boolean };
        } catch (err) {
            return { deleted: false };
        }
    }

    /**
     * Get Folder by ID or Path
     */
    async getFolder(idOrPath: string, includeStats = false) {
        try {
            const { data } = await this.#v1.get<JSB_Response.Folder>(
                "folder/" + idOrPath,
                this.memory.axiosPubKeyHeader({
                    params: { stats: includeStats }
                })
            );

            return data;
        } catch (err) {
            throw this.___handleHttpError(err);
        }
    }

    /**
     * Get Folder with stats by ID or Path
     */
    async getFolderWithStats(idOrPath: string) {
        return this.getFolder(idOrPath, true);
    }

    /**
     * Create a new folder
     * @param folder
     */
    async createFolder(folder: JSB_Body.CreateFolder) {
        try {
            const { data } = await this.#v1.post<JSB_Response.Folder>(
                `project/${folder.project}/folder`,
                folder,
                this.memory.axiosPrvKeyHeader()
            );

            data.exists = false;

            return data;
        } catch (err) {
            throw this.___handleHttpError(err);
        }
    }

    /**
     * Create Folder if not exists
     */
    async createFolderIfNotExists(folder: JSB_Body.CreateFolder) {
        try {
            return await this.createFolder(folder);
        } catch (err: any) {
            // If folder already exists
            // find folder by meta and return it
            if (err.code && err.code === "name.exists") {
                const doc = await this.getFolder(jsb_makeFolderPath(folder));
                doc.exists = true;
                return doc;
            }

            throw err;
        }
    }
}

export default JsonBank;
