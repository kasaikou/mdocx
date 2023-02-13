import { app } from "electron";
import { execSync } from "child_process";
import path from "path";

const debugMode = app.isPackaged || process.env.NODE_ENV === "development";
const resourcePath = app.isPackaged ? process.resourcesPath : ".";
const pythonPath = path.join(resourcePath, ".venv/bin/python");

async function main() {
    if (debugMode) {
        console.log("THIS IS DEBUG MODE")
        console.log(`resource path: ${resourcePath}`);
        console.log(`Python version:`, await execSync(`${pythonPath} --version`).toString());
    }

}

main().catch((e) => {
    console.log(e);
    app.exit(1);

}).finally(() => {
    app.exit(0);

});
