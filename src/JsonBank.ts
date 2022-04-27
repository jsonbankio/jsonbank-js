import axios, { AxiosInstance } from "axios";
import { jsb_Query } from "./helpers";
import JsonBankMemory from "./JsonBankMemory";
import { JSB_Query, JSB_QueryVars, JSB_Response, JsonBankConfig } from "./types";
import fs from "fs";
import path from "path";

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
                return Error(err.response.data.error);
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
     * Get Public Content by Id or Path
     * @param idOrPath
     */
    async getContent<T = any>(idOrPath: string): Promise<T> {
        try {
            const { data } = await this.#api.get("f/" + idOrPath);
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
     */
    async getContentByPath<T = any>(path: string): Promise<T> {
        return this.getContent<T>(path);
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
     */
    async getGithubContent<T = any>(path: string): Promise<T> {
        try {
            const { data } = await this.#api.get("gh/" + path);
            return data;
        } catch (err) {
            throw this.___handleHttpError(err);
        }
    }

    /**
     * Get own Content by ID or Path
     * @param idOrPath
     * @param options
     */
    async getOwnContent<T = any>(
        idOrPath: string,
        options: {
            query?: JSB_Query;
            vars?: JSB_QueryVars;
        } = {}
    ): Promise<T> {
        const config = this.memory.axiosPubKeyHeader({
            params: {
                ...(options.query ? jsb_Query(options.query, options.vars) : {})
            }
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
     * @param options
     */
    async getOwnContentByPath<T = any>(
        path: string,
        options: {
            query?: JSB_Query;
            vars?: JSB_QueryVars;
        } = {}
    ): Promise<T> {
        return this.getOwnContent<T>(path, options);
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
}

export default JsonBank;
