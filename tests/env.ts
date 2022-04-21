import { Env } from "@xpresser/env";

const env = Env(__dirname, {
    jsbPublicKey: Env.is.string(),
    jsbPrivateKey: Env.is.string()
});

export default env;
