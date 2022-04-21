import test from "japa";
import JsonBank from "../src/JsonBank";

test.group("JsonBank: Not Authenticated", (group) => {
    let jsb: JsonBank;

    group.before(() => {
        jsb = new JsonBank();
    });

    test.failing("authenticate(): Should not be able to authenticate", async () => {
        await jsb.authenticate();
    });

    test("isAuthenticated(): Should not be authenticated", async (assert) => {
        await assert.isFalse(jsb.isAuthenticated());
    });

    test("getContent(): Get public content by Id", async (assert) => {
        const content = await jsb.getContent("EJcYPj4Sn2xSaeY3wvVxsMQJy54LvBq0");
        // test with .json extension
        const content2 = await jsb.getContent(
            "EJcYPj4Sn2xSaeY3wvVxsMQJy54LvBq0.json"
        );

        assert.deepEqual(content, {
            name: "Js SDK Test File",
            author: "jsonbank"
        });

        assert.deepEqual(content, content2);
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

    test("getGithubContent(): Get content from github", async (assert) => {
        const pkg = await jsb.getGithubContent(
            "jsonbankio/jsonbank-js/package.json"
        );

        assert.isObject(pkg);
        assert.equal(pkg.name, "jsonbank");
        assert.equal(pkg.author, "jsonbankio");
    });
});
