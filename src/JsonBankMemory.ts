import ObjectCollection from "object-collection";
import { AxiosRequestConfig } from "axios";

class JsonBankMemory extends ObjectCollection {
    /**
     * Returns axios headers config for JSB_PUB_KEY only from memory
     */
    axiosPubKeyHeader(data: AxiosRequestConfig = {}) {
        return {
            headers: {
                "jsb-pub-key": this.get("axios.headers.jsb-pub-key")
            },
            ...data
        };
    }

    /**
     * Returns axios headers config for JSB_PUB_KEY from memory
     */
    axiosPrvKeyHeader(data: AxiosRequestConfig = {}) {
        return {
            headers: {
                "jsb-pub-key": this.get("axios.headers.jsb-pub-key"),
                "jsb-prv-key": this.get("axios.headers.jsb-prv-key")
            },
            ...data
        };
    }
}

export = JsonBankMemory;
