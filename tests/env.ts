import { Env } from "@xpresser/env";

const env = Env(__dirname, {
    JSB_HOST: Env.is.string("https://api.jsonbank.io"),
    JSB_PUBLIC_KEY: Env.is.string(),
    JSB_PRIVATE_KEY: Env.is.string()
});

export default env;
