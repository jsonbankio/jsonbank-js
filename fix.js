const fs = require("fs");

const file = __dirname + "/constants.ts";
const toDo = process.argv[2] || "prod";

let ConstantFile = fs.readFileSync(file, { encoding: "utf8" });

if (toDo === "prod") {
    console.log(`Replaced http://localhost:2221 ====> https://api.jsonbank.io`);

    ConstantFile = ConstantFile.replace(
        "http://localhost:2221",
        "https://api.jsonbank.io"
    );
} else if (toDo === "dev") {
    console.log(
        `Replaced https://api.jsonbank.io ===> http://http://localhost:2221`
    );

    ConstantFile = ConstantFile.replace(
        "https://api.jsonbank.io",
        "http://localhost:2221"
    );
}

fs.writeFileSync(file, ConstantFile);
