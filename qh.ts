import {
    $json,
    jsb_queries,
    jsb_query_filters,
} from "./src/JsonBankQuery";

const { find, slice, get,map } = jsb_query_filters();


console.log(
    decodeURIComponent(
        jsb_queries(
            get("countries"),
            find($json({region: "Europe"})),
        )
    )
);

console.log();
console.log(
    decodeURIComponent(
        jsb_queries(
            get("countries"),
            map("name"),
            slice(0, 3)
        )
    )
);

