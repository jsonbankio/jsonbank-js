import { Env } from "@xpresser/env";

const env = Env(__dirname, {
    JSB_PUBLIC_KEY: Env.is.string(),
    JSB_PRIVATE_KEY: Env.is.string()
});

export default env;
