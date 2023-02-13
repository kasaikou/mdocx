import { app } from "electron";
import { execSync } from "child_process";
import path from "path";

const resourcePath = app.isPackaged ? process.resourcesPath : ".";
const pythonPath = path.join(resourcePath, ".venv/bin/python");

async function main() {
    console.log(`is packaged: ${app.isPackaged}`);
    console.log(`resource path: ${resourcePath}`);
    const buffer = await execSync(`${pythonPath} --version`);
    console.log(`Python version:`, buffer.toString());
}

main().catch((e) => {
    console.log(e);
    app.exit(1);

}).finally(() => {
    app.exit(0);

});
