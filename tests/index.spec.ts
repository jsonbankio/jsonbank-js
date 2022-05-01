import test from "japa";
import JsonBank, { JSB_Error } from "../src/JsonBank";
import env from "./env";

const testDoc = {
    id: "", // will be gotten from the server before the test
    path: "jsonbank/js-sdk-test/index"
};

test.group("JsonBank: Not Authenticated", (group) => {
    let jsb: JsonBank;

    group.before(async () => {
        jsb = new JsonBank({ host: env.JSB_HOST });

        // Find id of test document
        const index = await jsb.getContentMetaByPath(testDoc.path);
        testDoc.id = index.id;
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
            host: env.JSB_HOST,
            keys: {
                prv: env.JSB_PRIVATE_KEY,
                pub: env.JSB_PUBLIC_KEY
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

    test("hasOwnContent()", async (assert) => {
        assert.isTrue(await jsb.hasOwnContent(testDoc.id));
        // fail
        assert.isFalse(await jsb.hasOwnContent("not-existing-id"));
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

    test("createFolder():", async (assert) => {
        try {
            const folder = await jsb.createFolder({
                name: "folder",
                project: "js-sdk-test"
            });

            assert.isObject(folder);
            assert.hasAllKeys(folder, ["id", "name", "path", "project"]);

            // check folder name matches
            assert.equal(folder.name, "folder");
            assert.equal(folder.project, "js-sdk-test");
        } catch (e) {
            // Error: Folder already exists
            if ((e as JSB_Error).code !== "name.exists") throw e;
        }
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
        assert.hasAllKeys(doc, ["id", "name", "path", "createdAt", "project"]);
        // test project name
        assert.equal(doc.project, "js-sdk-test");
    });

    test("uploadDocument():", async (assert) => {
        // delete file if exists
        await jsb.deleteDocument("js-sdk-test/folder/upload");

        // upload file
        const doc = await jsb.uploadDocument({
            file: __dirname + "/upload.json",
            project: "js-sdk-test",
            folder: "folder"
        });

        assert.isObject(doc);
        assert.hasAllKeys(doc, ["id", "name", "path", "createdAt", "project"]);
        // test project name
        assert.equal(doc.project, "js-sdk-test");
    });
});
