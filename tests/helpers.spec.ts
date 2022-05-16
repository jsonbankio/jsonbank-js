import test from "japa";
import { jsb_Query } from "../src/helpers";

test("jsb_Query()", (assert) => {
    const [query] = jsb_Query({
        apply: "get",
        args: "name"
    });

    assert.deepEqual(query, "get-name");
});

test("jsb_Query(): with array of  string Args", (assert) => {
    const [query] = jsb_Query({
        apply: "mapPick",
        args: ["name", "phone"]
    });

    assert.deepEqual(query, "mapPick-name-phone");
});

test("jsb_Query(): with var Args", (assert) => {
    const [query, additionalQueries] = jsb_Query({
        apply: "mapPick",
        args: { var: "keys" },
        query: { keys: "name-iso3" }
    });

    assert.equal(query, "mapPick-var(keys)");
    assert.deepEqual(additionalQueries, { keys: "name-iso3" });
});

test("jsb_Query(): with json Args", (assert) => {
    const [query, additionalQueries] = jsb_Query({
        apply: "mapPick",
        args: { json: "keys" },
        query: { keys: ["name", "iso3"] }
    });

    assert.equal(query, "mapPick-json(keys)");
    assert.deepEqual(additionalQueries, { keys: ["name", "iso3"] });
});
