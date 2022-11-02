require("ts-node").register();

const { configure } = require("japa");

configure({
    files: ["tests/*.spec.js", "tests/*/**/*.spec.js"]
});
