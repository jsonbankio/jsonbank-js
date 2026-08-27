import { test } from "@japa/runner";
import type { Assert } from "@japa/assert";
import JsonBankNode from "../src/JsonBankNode";
import env from "./env";
import { $json, $raw, $var, jsb_query_filters } from "../src/JsonBankQuery";

test.group("Jsb Query", (group) => {
    const jsb = new JsonBankNode({ host: env.JSB_HOST });
    const { get, map, mapPick, slice, filter, at } = jsb_query_filters();

    test("getContent()", async ({ assert }: { assert: Assert }) => {
        const content = await jsb.getContent("jsonbank/tests/countries.json", [
            get("countries"),
            map("name"),
            slice(0, 3)
        ]);

        assert.deepEqual(content, ["Afghanistan", "Albania", "Algeria"]);
    });

    test("var()", async ({ assert }: { assert: Assert }) => {
        const content = await jsb.getContent("jsonbank/tests/countries.json", [
            get("countries"),
            mapPick($var("name,capital"))
        ]);

        assert.isArray(content);
        assert.isAbove(content.length, 0);
        assert.deepEqual(content[0], {
            name: "Afghanistan",
            capital: "Kabul"
        });
    });

    test("raw()", async ({ assert }: { assert: Assert }) => {
        const content = await jsb.getContent("jsonbank/tests/countries.json", [
            at($raw("countries[4].name")),
        ]);

        assert.isArray(content);
        assert.deepEqual(content, ["Australia"]);
    });

    test("json()", async ({ assert }: { assert: Assert }) => {
        const content = await jsb.getContent("jsonbank/tests/countries.json", [
            get("countries"),

            filter($json({ currency: "EUR" })),
            map("name")
        ]);

        assert.deepEqual(content, [
            "Austria",
            "Belgium",
            "Finland",
            "France",
            "Germany",
            "Greece",
            "Ireland",
            "Italy",
            "Netherlands",
            "Portugal",
            "Spain"
        ]);
    });
});
