import env from "./env";
import { JsonBank } from "../index";

async function Main() {
    const jsb = new JsonBank({
        keys: {
            pub: env.jsbPublicKey,
            prv: env.jsbPrivateKey
        }
    });

    // await jsb.authenticate();
    //
    // if (jsb.isAuthenticated()) {
    //     console.log(`Account: "${jsb.getUsername()}"`);
    // }

    // const file = "VpWhUo6bQZ2dC7LW3uM7rCZegsofzIm0";
    // const data = await jsb.getOwnContent(file);

    const data = await jsb.updateOwnContent(
        // "currency/index.json",
        "public/package.json",
        JSON.stringify({
            message: "Data has been updated!"
        })
    );

    console.log(data);
}

Main().catch(console.error);
