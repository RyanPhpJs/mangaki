import { decode } from "./app/src/id";

const args = process.argv.slice(2);

for (const id of args) {
    console.log("ID decodificado é " + decode(id));
}
