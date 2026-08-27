import { test } from "@japa/runner";
import type { Assert } from "@japa/assert";
import env from "./env";
import JsonBankNode from "../src/JsonBankNode";
import os from "os";
import { type JSB_Error } from "../src/JsonBank";
import isCi from "is-ci";

const TestFileContent = {
    name: "JsonBank SDK Test File",
    author: "jsonbank"
};

const MetaExpectedKeys = [
    "id",
    "project",
    "contentSize",
    "path",
    "name",
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
    group.each.timeout(env.JSB_TIMEOUT);

    let jsb: JsonBankNode;
    const testDoc = {
        id: "", // will be gotten from the server before the test
        path: "jsonbank/sdk-test/index"
    };

    group.setup(async () => {
        jsb = new JsonBankNode({ host: env.JSB_HOST });

        // Find id of a test document
        try {
            const index = await jsb.getDocumentMeta(testDoc.path);
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

    test("authenticate(): Should not be able to authenticate", async () => {
        await jsb.authenticate();
    }).fails();

    test("isAuthenticated(): Should not be authenticated", async ({ assert }: { assert: Assert }) => {
        await assert.isFalse(jsb.isAuthenticated());
    });

    test("getContent(): Get public content by Id", async ({ assert }: { assert: Assert }) => {
        const content = await jsb.getContent(testDoc.id);
        // test with .json extension
        const content2 = await jsb.getContent(testDoc.id + ".json");
        assert.deepEqual(content, TestFileContent);
        assert.deepEqual(content, content2);
    });

    test("getContentAsString(): Get public content by Id", async ({ assert }: { assert: Assert }) => {
        const content = await jsb.getContentAsString(testDoc.id);
        // test with .json extension
        const content2 = await jsb.getContentAsString(testDoc.id + ".json");

        assert.deepEqual(content, JSON.stringify(TestFileContent));

        assert.deepEqual(content, content2);
    });

    test("getContent(): Get public content by id with {jsbQuery}", async ({ assert }: { assert: Assert }) => {
        const content = await jsb.getContent(testDoc.id, {
            apply: "pick",
            args: ["name"] /// only pick name
        });

        assert.deepEqual(content, {
            name: TestFileContent.name
        });
    });

    test("getDocumentMeta(): Get public content meta by ID", async ({ assert }: { assert: Assert }) => {
        const meta = await jsb.getDocumentMeta(testDoc.id);
        // test with .json extension
        const meta2 = await jsb.getDocumentMeta(testDoc.id + ".json");

        assert.onlyProperties(meta, MetaExpectedKeys);

        assert.deepEqual(meta, meta2);
    });

    test("getContent(): Get public content by path", async ({ assert }: { assert: Assert }) => {
        const content = await jsb.getContent("jsonbank/sdk-test/index");
        // test with .json extension
        const content2 = await jsb.getContent("jsonbank/sdk-test/index.json");

        assert.deepEqual(content, TestFileContent);

        assert.deepEqual(content, content2);
    });

    test("getContent(): Get public content by path with {jsbQuery}", async ({ assert }: { assert: Assert }) => {
        const content = await jsb.getContent("jsonbank/sdk-test/index", {
            apply: "pick",
            args: ["name"] /// only pick name
        });

        assert.deepEqual(content, {
            name: TestFileContent.name
        });
    });

    test("getDocumentMeta(): Get public content meta by path", async ({ assert }: { assert: Assert }) => {
        const meta = await jsb.getDocumentMeta("jsonbank/sdk-test/index");
        // test with .json extension
        const meta2 = await jsb.getDocumentMeta("jsonbank/sdk-test/index.json");

        assert.onlyProperties(meta, MetaExpectedKeys);

        assert.deepEqual(meta, meta2);
    });

    test("getGithubContent(): Get content from github", async ({ assert }: { assert: Assert }) => {
        const pkg = await jsb.getGithubContent(
            "jsonbankio/jsonbank-js/package.json"
        );

        assert.isObject(pkg);
        assert.equal(pkg.name, "jsonbank");
        assert.equal(pkg.author, "jsonbankio");
    });

    test("getGithubContent(): Get content from github with jsbQuery", async ({ assert }: { assert: Assert }) => {
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
    group.each.timeout(env.JSB_TIMEOUT);

    let jsb: JsonBankNode;
    const project = "sdk-test";
    const testDoc = {
        id: "", // will be gotten from the server before the test
        path: `${project}/index`
    };

    group.setup(async () => {
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

    test("isAuthenticated()", async ({ assert }: { assert: Assert }) => {
        assert.isTrue(jsb.isAuthenticated());
    });

    test("getUsername():", async ({ assert }: { assert: Assert }) => {
        assert.equal(await jsb.getUsername(), "jsonbank");
    });

    test("getOwnContent():", async ({ assert }: { assert: Assert }) => {
        const content = await jsb.getOwnContent(testDoc.id);

        assert.deepEqual(content, TestFileContent);
    });

    test("getOwnContentAsString(): by path", async ({ assert }: { assert: Assert }) => {
        const content = await jsb.getOwnContentAsString(`${project}/index`);
        assert.deepEqual(content, JSON.stringify(TestFileContent));
    });

    test("getOwnDocumentMeta():", async ({ assert }: { assert: Assert }) => {
        const meta = await jsb.getOwnDocumentMeta(testDoc.id);
        assert.onlyProperties(meta, MetaExpectedKeys);
    });

    test("getOwnContent(): by path", async ({ assert }: { assert: Assert }) => {
        const content = await jsb.getOwnContent(`${project}/index`);
        assert.deepEqual(content, TestFileContent);
    });

    test("getOwnDocumentMeta(): by path", async ({ assert }: { assert: Assert }) => {
        const meta = await jsb.getOwnDocumentMeta(`${project}/index`);
        assert.onlyProperties(meta, MetaExpectedKeys);
    });

    test("hasOwnDocument()", async ({ assert }: { assert: Assert }) => {
        assert.isTrue(await jsb.hasOwnDocument(testDoc.id));
        // fail
        assert.isFalse(await jsb.hasOwnDocument("not-existing-id"));
    });

    test("updateContent():", async ({ assert }: { assert: Assert }) => {
        const newContent = {
            ...TestFileContent,
            updatedAt: new Date().toISOString()
        };

        const { changed } = await jsb.updateOwnDocument(
            `${project}/index`,
            newContent
        );

        assert.isTrue(changed);

        if (!isCi) {
            const newContentFromServer = await jsb.getOwnContent(`${project}/index`);

            assert.deepEqual(newContent, newContentFromServer);
        }

        // revert changes
        await jsb.updateOwnDocument(`${project}/index`, TestFileContent);
    });

    test("createFolder():", async ({ assert }: { assert: Assert }) => {
        try {
            const folder = await jsb.createFolder({
                name: "folder",
                project
            });

            assert.isObject(folder);
            assert.onlyProperties(folder, ["id", "name", "path", "project"]);

            // check folder name matches
            assert.equal(folder.name, "folder");
            assert.equal(folder.project, project);
        } catch (e) {
            // Error: Folder already exists
            if ((e as JSB_Error).code !== "name.exists") throw e;
        }
    });

    test("createDocument():", async ({ assert }: { assert: Assert }) => {
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
        assert.onlyProperties(doc, NewDocumentExpectedKeys);
        // test project name
        assert.equal(doc.project, project);

        await jsb.deleteDocument(`${project}/folder/new_doc`);
    });

    test("uploadDocument():", async ({ assert }: { assert: Assert }) => {
        // delete file if exists
        await jsb.deleteDocument(`${project}/folder/upload`);

        // upload file
        const doc = await jsb.uploadDocument({
            file: __dirname + "/upload.json",
            project,
            folder: "folder"
        });

        assert.isObject(doc);
        assert.onlyProperties(doc, NewDocumentExpectedKeys);
        // test project name
        assert.equal(doc.project, project);
    });

    test("getFolder", async ({ assert }: { assert: Assert }) => {
        const folder = await jsb.getFolder(`${project}/folder`);

        assert.isObject(folder);
        assert.onlyProperties(folder, [
            "id",
            "name",
            "path",
            "project",
            "createdAt",
            "updatedAt"
        ]);

        // test project name
        assert.equal(folder.project, project);

        // get folder by id
        const folder2 = await jsb.getFolder(folder.id);

        assert.deepEqual(folder, folder2);
    });

    test("getFolder with stats", async ({ assert }: { assert: Assert }) => {
        const folder = await jsb.getFolderWithStats(`${project}/folder`);

        assert.isObject(folder);
        assert.onlyProperties(folder, [
            "id",
            "name",
            "path",
            "project",
            "createdAt",
            "updatedAt",
            "stats"
        ]);

        // test project name
        assert.equal(folder.project, project);

        // get folder by id
        const folder2 = await jsb.getFolderWithStats(folder.id);

        assert.deepEqual(folder, folder2);
    });

    test("scanProject(): list project root", async ({ assert }: { assert: Assert }) => {
        const list = await jsb.scanProject(project);

        // no folder was requested, so the project root was listed
        assert.onlyProperties(list, ["project", "documents", "folders"]);
        assert.equal(list.project.slug, project);
        assert.oneOf(list.project.access, ["public", "private"]);

        for (const paginated of [list.documents, list.folders]) {
            assert.isArray(paginated.data);
            assert.onlyProperties(paginated.meta, [
                "page",
                "perPage",
                "total",
                "lastPage"
            ]);
        }

        // index.json lives at the root
        assert.isTrue(list.documents.data.some((doc) => doc.name === "index"));
        for (const doc of list.documents.data) {
            assert.properties(doc, MetaExpectedKeys);
        }

        // the "folder" folder lives at the root
        assert.isTrue(list.folders.data.some((folder) => folder.name === "folder"));
    });

    test("scanProject(): list a folder by path and by id", async ({ assert }: { assert: Assert }) => {
        const list = await jsb.scanProject(project, { folder: "folder" });

        // a folder was requested, so it is echoed back
        assert.onlyProperties(list, ["project", "folder", "documents", "folders"]);
        assert.isObject(list.folder);
        assert.equal(list.folder!.path, "folder");

        // every document in a folder is tagged with its folder id
        for (const doc of list.documents.data) {
            assert.equal(doc.folderId, list.folder!.id);
        }

        // listing by id must match listing by path
        const listById = await jsb.scanProject(project, { folder: list.folder!.id });
        assert.deepEqual(list, listById);
    });

    test("listDocuments():", async ({ assert }: { assert: Assert }) => {
        const list = await jsb.listDocuments(project);

        // folders are not queried by this endpoint
        assert.onlyProperties(list, ["project", "documents"]);
        assert.equal(list.project.slug, project);

        for (const doc of list.documents.data) {
            assert.properties(doc, MetaExpectedKeys);
        }

        // documents must match the ones scanProject() returns
        const scan = await jsb.scanProject(project);
        assert.deepEqual(list.documents, scan.documents);
    });

    test("listFolders():", async ({ assert }: { assert: Assert }) => {
        const list = await jsb.listFolders(project);

        // documents are not queried by this endpoint
        assert.onlyProperties(list, ["project", "folders"]);
        assert.equal(list.project.slug, project);

        for (const folder of list.folders.data) {
            assert.properties(folder, [
                "id",
                "name",
                "path",
                "project",
                "createdAt",
                "updatedAt"
            ]);
        }

        // folders must match the ones scanProject() returns
        const scan = await jsb.scanProject(project);
        assert.deepEqual(list.folders, scan.folders);
    });

    test("listDocuments(): paginate", async ({ assert }: { assert: Assert }) => {
        const { documents } = await jsb.listDocuments(project, { perPage: 1 });

        assert.equal(documents.meta.page, 1);
        assert.equal(documents.meta.perPage, 1);
        assert.isAtMost(documents.data.length, 1);
        assert.equal(documents.meta.lastPage, documents.meta.total);
    });

    test("listDocuments(): sort", async ({ assert }: { assert: Assert }) => {
        const asc = await jsb.listDocuments(project, {
            sort: "createdAt",
            order: "asc"
        });

        const desc = await jsb.listDocuments(project, {
            sort: "createdAt",
            order: "desc"
        });

        assert.deepEqual(
            asc.documents.data.map((doc) => doc.id),
            desc.documents.data.map((doc) => doc.id).reverse()
        );
    });

    test("listDocuments(): rejects an unknown sort field", async ({ assert }: { assert: Assert }) => {
        try {
            await jsb.listDocuments(project, { sort: "nope" as any });
            assert.fail("Expected an unknown sort field to be rejected");
        } catch (e) {
            assert.equal((e as JSB_Error).code, "sort.invalid");
        }
    });

    test("scanProject(): rejects an unknown project", async ({ assert }: { assert: Assert }) => {
        try {
            await jsb.scanProject("not-a-real-project");
            assert.fail("Expected an unknown project to be rejected");
        } catch (e) {
            assert.equal((e as JSB_Error).name, "JSB_Error");
        }
    });

    test("createFolderIfNotExists", async ({ assert }: { assert: Assert }) => {
        const folder = await jsb.createFolderIfNotExists({
            name: "folder",
            project
        });

        assert.isObject(folder);
        assert.onlyProperties(folder, [
            "id",
            "name",
            "path",
            "project",
            "createdAt",
            "updatedAt",
            "exists"
        ]);

        // check folder name matches
        assert.equal(folder.name, "folder");
        assert.equal(folder.project, project);
    });
});
