import { ParseMarkdown } from "./markdown";
import fs from "fs";

test("example", function () {
    const doc = ParseMarkdown(fs.readFileSync("/workspace/example/example.md", { encoding: "utf-8" }));
    fs.writeFileSync("/workspace/example/example.json", JSON.stringify(doc, null, 2));
});
