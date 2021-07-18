import env from "../env";
import { JsonBank } from "../dist";

async function Main() {
    const jsb = new JsonBank({
        keys: {
            pub: env.jsbPublicKey
            // prv: env.jsbPrivateKey
        }
    });

    // await jsb.authenticate();
    //
    // if (jsb.isAuthenticated()) {
    //     console.log(`Account: "${jsb.getUsername()}"`);
    // }

    // const file = "VpWhUo6bQZ2dC7LW3uM7rCZegsofzIm0";
    // const data = await jsb.getOwnContent(file);

    const data = await jsb.getOwnContent("public/package.json");
    console.log(typeof data, data);
}

Main().catch(console.error);
