import { configure, processCLIArgs, run } from "@japa/runner";
import { assert } from "@japa/assert";

processCLIArgs(process.argv.slice(2));

configure({
    plugins: [assert()],
    files: ["tests/*.spec.ts", "tests/*/**/*.spec.ts"]
});

run();
