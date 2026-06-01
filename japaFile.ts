import { configure, run } from "@japa/runner";
import { assert } from "@japa/assert";

configure({
    plugins: [assert()],
    files: ["tests/*.spec.ts", "tests/*/**/*.spec.ts"]
});

run();
