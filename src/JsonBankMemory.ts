import ObjectCollection from "object-collection";
import { AxiosRequestConfig } from "axios";

class JsonBankMemory extends ObjectCollection {
    /**
     * Returns axios headers config for JSB_PUB_KEY only from memory
     */
    axiosPubKeyOnlyHeader(data: AxiosRequestConfig = {}) {
        return {
            headers: {
                JSB_PUB_KEY: this.get("axios.headers.JSB_PUB_KEY", "")
            },
            ...data
        };
    }

    /**
     * Returns axios headers config for JSB_PUB_KEY only from memory
     */
    axiosPrvKeyOnlyHeader(data: AxiosRequestConfig = {}) {
        return {
            headers: {
                JSB_PRV_KEY: this.get("axios.headers.JSB_PRV_KEY", "")
            },
            ...data
        };
    }
}

export = JsonBankMemory;
