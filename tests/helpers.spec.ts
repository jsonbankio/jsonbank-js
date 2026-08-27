import { test } from "@japa/runner";
import type { Assert } from "@japa/assert";
import { $json, $var, parse_jsb_query } from "../src/JsonBankQuery";

test("jsb_Query()", ({ assert }: { assert: Assert }) => {
    const [query] = parse_jsb_query({
        apply: "get",
        args: "name"
    });

    assert.deepEqual(query, "get-name");
});

test("jsb_Query(): with array of string Args", ({ assert }: { assert: Assert }) => {
    const [query] = parse_jsb_query({
        apply: "mapPick",
        args: ["name", "phone"]
    });

    assert.deepEqual(query, "mapPick-name-phone");
});

test("jsb_Query(): with var Args", ({ assert }: { assert: Assert }) => {
    const [query, additionalQueries] = parse_jsb_query({
        apply: "mapPick",
        args: $var("name-iso3","keys"),
    });

    assert.equal(query, "mapPick-var(keys)");
    assert.deepEqual(additionalQueries, { keys: "name-iso3" });
});

test("jsb_Query(): with json Args", ({ assert }: { assert: Assert }) => {
    const [query, additionalQueries] = parse_jsb_query({
        apply: "mapPick",
        args: $json(["name", "iso3"], "keys"),
    });

    assert.equal(query, "mapPick-json(keys)");
    assert.deepEqual(additionalQueries, { keys: JSON.stringify(["name", "iso3"]) });
});


// get-name -- get(name)
