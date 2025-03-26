import "extensionless/register";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Executando cron system");

const MyArgs = process.argv.slice(2);
const cmdName = MyArgs[0];
globalThis.args = MyArgs.slice(1);
process.chdir(__dirname);

if (cmdName == "update") {
    console.log("> Executando update system");
    await import("./cron/update_db");
} else if (cmdName === "help") {
} else {
    console.log("Not Found Command");
}
