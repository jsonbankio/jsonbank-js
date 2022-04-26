import axios from "axios";
import constants from "../constants";
import { jsb_handleHttpError, jsb_Query } from "./helpers";
import JsonBankMemory from "./JsonBankMemory";
import { JSB_Query, JSB_QueryVars, JSB_Response, JsonBankConfig } from "./types";
import AuthenticatedData = JSB_Response.AuthenticatedData;
import fs from "fs";
import path from "path";

// Axios instance for public requests
const httpChannel = axios.create({
    baseURL: constants.apiUrl
});

// Axios instance for auth requests
const v1 = axios.create({
    baseURL: constants.apiUrl + "/v1"
});

/**
 * Json Bank class
 */
class JsonBank {
    private config!: JsonBankConfig;
    private memory!: JsonBankMemory;

    constructor(config?: JsonBankConfig) {
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

        if (this.config.keys) {
            this.memory.path("axios.headers").setDefined({
                "jsb-pub-key": this.config.keys.pub,
                "jsb-prv-key": this.config.keys.prv
            });
        }
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
            const { data } = await v1.post<AuthenticatedData>(
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
            throw jsb_handleHttpError(err);
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
            const { data } = await httpChannel.get("f/" + idOrPath);
            return data;
        } catch (err) {
            throw jsb_handleHttpError(err);
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
     * Get  a json file from GitHub
     * @param path
     */
    async getGithubContent<T = any>(path: string): Promise<T> {
        try {
            const { data } = await httpChannel.get("gh/" + path);
            return data;
        } catch (err) {
            throw jsb_handleHttpError(err);
        }
    }

    /**
     * Get own Content by ID or Path
     * @param idOrPath
     * @param query
     * @param vars
     */
    async getOwnContent<T = any>(
        idOrPath: string,
        query?: JSB_Query,
        vars?: JSB_QueryVars
    ): Promise<T> {
        try {
            const { data } = await v1.get<T>(
                "file/" + idOrPath,
                this.memory.axiosPubKeyHeader(
                    query ? { params: jsb_Query(query, vars) } : undefined
                )
            );
            return data;
        } catch (err) {
            throw jsb_handleHttpError(err);
        }
    }

    /**
     * Get own Content by Id or Path
     * @param path
     * @param query
     * @param vars
     */
    async getOwnContentByPath<T = any>(
        path: string,
        query?: JSB_Query,
        vars?: JSB_QueryVars
    ): Promise<T> {
        return this.getOwnContent<T>(path, query, vars);
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
            const { data } = await v1.post(
                "file/" + idOrPath,
                { content },
                this.memory.axiosPrvKeyHeader()
            );

            return data;
        } catch (err) {
            throw jsb_handleHttpError(err);
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
            const { data } = await v1.post<JSB_Response.CreateDocument>(
                `project/${document.project}/document`,
                { ...document },
                this.memory.axiosPrvKeyHeader()
            );

            return data;
        } catch (err) {
            throw jsb_handleHttpError(err);
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
            throw jsb_handleHttpError(err);
        }
    }

    async deleteDocument(idOrPath: string) {
        try {
            const { data } = await v1.delete(
                "file/" + idOrPath,
                this.memory.axiosPrvKeyHeader()
            );

            return data as { delete: boolean };
        } catch (err) {
            return { delete: false };
        }
    }
}

export = JsonBank;
