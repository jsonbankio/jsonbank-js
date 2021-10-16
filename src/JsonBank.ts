import axios from "axios";
import constants from "../constants";
import { jsb_handleHttpError, jsb_Query } from "./helpers";
import JsonBankMemory from "./JsonBankMemory";
import { JSB_Query, JSB_QueryVars, JSB_Response, JsonBankConfig } from "./types";
import AuthenticatedData = JSB_Response.AuthenticatedData;

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
     * Get  a json file from Github
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
     * Get own Content by Id or Path
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
     * Update own Content by Id or Path
     * @param idOrPath
     * @param content
     */
    async updateOwnContent<T = any>(idOrPath: string, content: string): Promise<T> {
        try {
            const { data, headers } = await v1.post<T>(
                "file/" + idOrPath,
                { content },
                this.memory.axiosPrvKeyHeader()
            );

            return data;
        } catch (err) {
            throw jsb_handleHttpError(err);
        }
    }
}

export = JsonBank;
