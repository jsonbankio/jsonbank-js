import test from "japa";
import JsonBank from "../src/JsonBank";
import env from "./env";

const testDoc = {
    id: "kWINhzTZkI80Ktdo4EjqS5BGEALUuaEM",
    path: "index.json"
};

// type OwnContent = {
//     name: string;
//     author: string;
//     updatedAt?: string;
// };

test.group("JsonBank: Not Authenticated", (group) => {
    let jsb: JsonBank;

    group.before(() => {
        jsb = new JsonBank({ host: "http://localhost:2221" });
    });

    test.failing("authenticate(): Should not be able to authenticate", async () => {
        await jsb.authenticate();
    });

    test("isAuthenticated(): Should not be authenticated", async (assert) => {
        await assert.isFalse(jsb.isAuthenticated());
    });

    test("getContent(): Get public content by Id", async (assert) => {
        const content = await jsb.getContent(testDoc.id);
        // test with .json extension
        const content2 = await jsb.getContent(testDoc.id + ".json");

        assert.deepEqual(content, {
            name: "Js SDK Test File",
            author: "jsonbank"
        });

        assert.deepEqual(content, content2);
    });

    test("getContentMeta(): Get public content meta by ID", async (assert) => {
        const meta = await jsb.getContentMeta(testDoc.id);
        // test with .json extension
        const meta2 = await jsb.getContentMeta(testDoc.id + ".json");

        assert.hasAllKeys(meta, ["id", "project", "path", "createdAt", "updatedAt"]);

        assert.deepEqual(meta, meta2);
    });

    test("getContentByPath(): Get public content by path", async (assert) => {
        const content = await jsb.getContentByPath("jsonbank/js-sdk-test/index");
        // test with .json extension
        const content2 = await jsb.getContentByPath(
            "jsonbank/js-sdk-test/index.json"
        );

        assert.deepEqual(content, {
            name: "Js SDK Test File",
            author: "jsonbank"
        });

        assert.deepEqual(content, content2);
    });

    test("getContentMetaByPath(): Get public content meta by path", async (assert) => {
        const meta = await jsb.getContentMetaByPath("jsonbank/js-sdk-test/index");
        // test with .json extension
        const meta2 = await jsb.getContentMetaByPath(
            "jsonbank/js-sdk-test/index.json"
        );

        assert.hasAllKeys(meta, ["id", "project", "path", "createdAt", "updatedAt"]);

        assert.deepEqual(meta, meta2);
    });

    test("getGithubContent(): Get content from github", async (assert) => {
        const pkg = await jsb.getGithubContent(
            "jsonbankio/jsonbank-js/package.json"
        );

        assert.isObject(pkg);
        assert.equal(pkg.name, "jsonbank");
        assert.equal(pkg.author, "jsonbankio");
    });
});

test.group("JsonBank: Authenticated", (group) => {
    let jsb: JsonBank;

    group.before(async () => {
        jsb = new JsonBank({
            host: "http://localhost:2221",
            keys: {
                prv: env.jsbPrivateKey,
                pub: env.jsbPublicKey
            }
        });

        await jsb.authenticate();
    });

    test("isAuthenticated()", async (assert) => {
        assert.isTrue(jsb.isAuthenticated());
    });

    test("getUsername():", async (assert) => {
        assert.equal(await jsb.getUsername(), "jsonbank");
    });

    test("getOwnContent():", async (assert) => {
        const content = await jsb.getOwnContent(testDoc.id);

        assert.deepEqual(content, {
            name: "Js SDK Test File",
            author: "jsonbank"
        });
    });

    test("getOwnContentMeta():", async (assert) => {
        const meta = await jsb.getOwnContentMeta(testDoc.id);
        assert.hasAllKeys(meta, ["id", "project", "path", "createdAt", "updatedAt"]);
    });

    test("getOwnContentByPath():", async (assert) => {
        const content = await jsb.getOwnContentByPath("js-sdk-test/index");
        assert.deepEqual(content, {
            name: "Js SDK Test File",
            author: "jsonbank"
        });
    });

    test("getOwnContentMetaByPath():", async (assert) => {
        const meta = await jsb.getOwnContentMetaByPath("js-sdk-test/index");
        assert.hasAllKeys(meta, ["id", "project", "path", "createdAt", "updatedAt"]);
    });

    test("updateContent():", async (assert) => {
        const newContent = {
            name: "Js SDK Test File",
            author: "jsonbank",
            updatedAt: new Date().toISOString()
        };

        await jsb.updateOwnContent("js-sdk-test/index", newContent);

        const newContentFromServer = await jsb.getOwnContentByPath(
            "js-sdk-test/index"
        );

        assert.deepEqual(newContent, newContentFromServer);

        // revert changes
        await jsb.updateOwnContent("js-sdk-test/index", {
            name: "Js SDK Test File",
            author: "jsonbank"
        });
    });

    test("createDocument():", async (assert) => {
        await jsb.deleteDocument("js-sdk-test/folder/new_doc");

        const doc = await jsb.createDocument({
            name: "new_doc",
            project: "js-sdk-test",
            folder: "folder",
            content: {
                name: "new_doc",
                created: new Date().toISOString()
            }
        });

        assert.isObject(doc);
        assert.hasAllKeys(doc.document, ["id", "name", "path", "createdAt"]);
        // test project name
        assert.equal(doc.project, "js-sdk-test");
    });

    test("hasOwnContent()", async (assert) => {
        assert.isTrue(await jsb.hasOwnContent(testDoc.id));
        // fail
        assert.isFalse(await jsb.hasOwnContent("not-existing-id"));
    });
});
