import env from "./env";
import { JsonBank } from "../index";

async function Main() {
    const jsb = new JsonBank({
        keys: { pub: env.jsbPublicKey, prv: env.jsbPrivateKey }
    });

    const uploadFile = __dirname + "/upload.json";

    const data = await jsb.uploadDocument({
        // name: "Test",
        project: "public",
        file: uploadFile
    });
    //
    //
    //
    console.log(data);
}

Main().catch(console.error);
