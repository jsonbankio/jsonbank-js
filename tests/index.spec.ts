import test from "japa";
import env from "./env";
import JsonBankNode from "../src/JsonBankNode";
import os from "os";
import { type JSB_Error } from "../src/JsonBank";

const TestFileContent = {
    name: "Js SDK Test File",
    author: "jsonbank"
};

const MetaExpectedKeys = [
    "id",
    "project",
    "contentSize",
    "path",
    "createdAt",
    "updatedAt"
];

const NewDocumentExpectedKeys = [
    "id",
    "name",
    "path",
    "contentSize",
    "createdAt",
    "project"
];

test.group("JsonBank: Not Authenticated", (group) => {
    let jsb: JsonBankNode;
    const testDoc = {
        id: "", // will be gotten from the server before the test
        path: "jsonbank/js-sdk-test/index"
    };

    group.before(async () => {
        jsb = new JsonBankNode({ host: env.JSB_HOST });

        // Find id of test document
        try {
            const index = await jsb.getContentMetaByPath(testDoc.path);
            testDoc.id = index.id;
        } catch (e: any) {
            if (e.code === "notFound") {
                throw new Error(
                    [
                        `Test document not found. Please create a document with the content below at {${testDoc.path}} before running tests.`,
                        "Test Document Content:",
                        JSON.stringify(TestFileContent, null, 2)
                    ].join(os.EOL)
                );
            }
            throw e;
        }
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

    test("getContent(): Get public content by id with {jsbQuery}", async (assert) => {
        const content = await jsb.getContent(testDoc.id, {
            apply: "pick",
            args: ["name"] /// only pick name
        });

        assert.deepEqual(content, {
            name: "Js SDK Test File"
        });
    });

    test("getContentMeta(): Get public content meta by ID", async (assert) => {
        const meta = await jsb.getContentMeta(testDoc.id);
        // test with .json extension
        const meta2 = await jsb.getContentMeta(testDoc.id + ".json");

        assert.hasAllKeys(meta, MetaExpectedKeys);

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

    test("getContentByPath(): Get public content by path with {jsbQuery}", async (assert) => {
        const content = await jsb.getContentByPath("jsonbank/js-sdk-test/index", {
            apply: "pick",
            args: ["name"] /// only pick name
        });

        assert.deepEqual(content, {
            name: "Js SDK Test File"
        });
    });

    test("getContentMetaByPath(): Get public content meta by path", async (assert) => {
        const meta = await jsb.getContentMetaByPath("jsonbank/js-sdk-test/index");
        // test with .json extension
        const meta2 = await jsb.getContentMetaByPath(
            "jsonbank/js-sdk-test/index.json"
        );

        assert.hasAllKeys(meta, MetaExpectedKeys);

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

    test("getGithubContent(): Get content from github with jsbQuery", async (assert) => {
        const pkg = await jsb.getGithubContent(
            "jsonbankio/jsonbank-js/package.json",
            { apply: "pick", args: ["name", "author"] }
        );

        assert.isObject(pkg);
        assert.deepEqual(pkg, {
            name: "jsonbank",
            author: "jsonbankio"
        });
    });
});

test.group("JsonBank: Authenticated", (group) => {
    let jsb: JsonBankNode;
    const project = "js-sdk-test";
    const testDoc = {
        id: "", // will be gotten from the server before the test
        path: `${project}/index`
    };

    group.before(async () => {
        jsb = new JsonBankNode({
            host: env.JSB_HOST,
            keys: {
                prv: env.JSB_PRIVATE_KEY,
                pub: env.JSB_PUBLIC_KEY
            }
        });

        await jsb.authenticate();

        // create test document
        const document = await jsb.createDocumentIfNotExists({
            name: "index.json",
            content: TestFileContent,
            project
        });

        testDoc.id = document.id;
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
        assert.hasAllKeys(meta, MetaExpectedKeys);
    });

    test("getOwnContentByPath():", async (assert) => {
        const content = await jsb.getOwnContentByPath(`${project}/index`);
        assert.deepEqual(content, {
            name: "Js SDK Test File",
            author: "jsonbank"
        });
    });

    test("getOwnContentMetaByPath():", async (assert) => {
        const meta = await jsb.getOwnContentMetaByPath(`${project}/index`);
        assert.hasAllKeys(meta, MetaExpectedKeys);
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

        await jsb.updateOwnContent(`${project}/index`, newContent);

        const newContentFromServer = await jsb.getOwnContentByPath(
            `${project}/index`
        );

        assert.deepEqual(newContent, newContentFromServer);

        // revert changes
        await jsb.updateOwnContent(`${project}/index`, {
            name: "Js SDK Test File",
            author: "jsonbank"
        });
    });

    test("createFolder():", async (assert) => {
        try {
            const folder = await jsb.createFolder({
                name: "folder",
                project
            });

            assert.isObject(folder);
            assert.hasAllKeys(folder, ["id", "name", "path", "project"]);

            // check folder name matches
            assert.equal(folder.name, "folder");
            assert.equal(folder.project, project);
        } catch (e) {
            // Error: Folder already exists
            if ((e as JSB_Error).code !== "name.exists") throw e;
        }
    });

    test("createDocument():", async (assert) => {
        await jsb.deleteDocument(`${project}/folder/new_doc`);

        const doc = await jsb.createDocument({
            name: "new_doc",
            project: project,
            folder: "folder",
            content: {
                name: "new_doc",
                created: new Date().toISOString()
            }
        });

        assert.isObject(doc);
        assert.hasAllKeys(doc, NewDocumentExpectedKeys);
        // test project name
        assert.equal(doc.project, project);
    });

    test("uploadDocument():", async (assert) => {
        // delete file if exists
        await jsb.deleteDocument(`${project}/folder/upload`);

        // upload file
        const doc = await jsb.uploadDocument({
            file: __dirname + "/upload.json",
            project,
            folder: "folder"
        });

        assert.isObject(doc);
        assert.hasAllKeys(doc, NewDocumentExpectedKeys);
        // test project name
        assert.equal(doc.project, project);
    });
});
