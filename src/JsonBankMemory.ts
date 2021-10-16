import ObjectCollection from "object-collection";
import { AxiosRequestConfig } from "axios";

class JsonBankMemory extends ObjectCollection {
    /**
     * Returns axios headers config for JSB_PUB_KEY only from memory
     */
    axiosPubKeyHeader(data: AxiosRequestConfig = {}) {
        return {
            headers: {
                JSB_PUB_KEY: this.get("axios.headers.JSB_PUB_KEY", null)
            },
            ...data
        };
    }

    /**
     * Returns axios headers config for JSB_PUB_KEY only from memory
     */
    axiosPrvKeyHeader(data: AxiosRequestConfig = {}) {
        return {
            headers: {
                JSB_PUB_KEY: this.get("axios.headers.JSB_PUB_KEY", null),
                JSB_PRV_KEY: this.get("axios.headers.JSB_PRV_KEY", null)
            },
            ...data
        };
    }
}

export = JsonBankMemory;
