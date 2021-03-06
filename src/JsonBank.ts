import axios, { AxiosInstance } from "axios";
import { jsb_Query, JSBQuery } from "./helpers";
import JsonBankMemory from "./JsonBankMemory";
import { JSB_Response, JsonBankConfig } from "./types";
import fs from "fs";
import path from "path";

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
    private memory!: JsonBankMemory;
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
            value: new JsonBankMemory(),
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
    private ___handleHttpError(err: any) {
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
     * Get Public Content Meta by Id or Path
     * @param idOrPath
     */
    async getContentMeta(idOrPath: string): Promise<JSB_Response.ContentMeta> {
        try {
            const { data } = await this.#api.get("meta/f/" + idOrPath, {
                params: { meta: true }
            });
            return data;
        } catch (err) {
            throw this.___handleHttpError(err);
        }
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
     * Get Public content meta by path
     * @param path
     */
    async getContentMetaByPath(path: string): Promise<JSB_Response.ContentMeta> {
        return this.getContentMeta(path);
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

    private static queryParam(
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
    async getOwnContentMeta(idOrPath: string): Promise<JSB_Response.ContentMeta> {
        const config = this.memory.axiosPubKeyHeader();

        try {
            const { data } = await this.#v1.get("meta/file/" + idOrPath, config);
            return data;
        } catch (err) {
            throw this.___handleHttpError(err);
        }
    }

    /**
     * Get own Content by Id or Path
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
     * Get own Content Meta by Id or Path
     * @param path
     */
    async getOwnContentMetaByPath(path: string): Promise<JSB_Response.ContentMeta> {
        return this.getOwnContentMeta(path);
    }

    /**
     * Check if a file exists
     * @param idOrPath
     */
    async hasOwnContent(idOrPath: string): Promise<boolean> {
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
    async updateOwnContent(
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
     * Create new document
     * @param document
     */
    async createDocument(document: {
        name: string;
        project: string;
        folder?: string;
        content?: string | object;
    }) {
        if (typeof document.content === "object") {
            document.content = JSON.stringify(document.content, null, 0);
        }

        try {
            const { data } = await this.#v1.post<JSB_Response.CreateDocument>(
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
     * Upload Document from file system
     * @param document
     */
    uploadDocument(document: {
        file: string;
        project: string;
        name?: string;
        folder?: string;
    }) {
        // check if file exists
        if (!fs.existsSync(document.file)) {
            throw new Error(`File does not exist: ${document.file}`);
        }

        // Set name to file name if none is defined
        if (!document.name) {
            document.name = path.basename(document.file);
        }

        try {
            return this.createDocument({
                name: document.name,
                project: document.project,
                // Read file.
                content: fs.readFileSync(document.file, "utf8"),
                folder: document.folder
            });
        } catch (err) {
            throw this.___handleHttpError(err);
        }
    }

    async deleteDocument(idOrPath: string) {
        try {
            const { data } = await this.#v1.delete(
                "file/" + idOrPath,
                this.memory.axiosPrvKeyHeader()
            );

            return data as { delete: boolean };
        } catch (err) {
            return { delete: false };
        }
    }

    async createFolder(folder: { name: string; project: string; folder?: string }) {
        try {
            const { data } = await this.#v1.post(
                `project/${folder.project}/folder`,
                folder,
                this.memory.axiosPrvKeyHeader()
            );

            return data as {
                id: string;
                name: string;
                path: string;
                project: string;
            };
        } catch (err) {
            throw this.___handleHttpError(err);
        }
    }
}

export default JsonBank;
