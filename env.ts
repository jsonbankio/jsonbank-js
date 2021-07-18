const envLoader = require("@xpresser/env")

const env = envLoader(__dirname, {
    castBoolean: true, required: [
        "jsbPublicKey",
        "jsbPrivateKey"
    ]
})

export = env as { jsbPrivateKey: string, jsbPublicKey: string }
