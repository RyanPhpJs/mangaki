import { createInterface } from "readline";
import db from "../db";
import { Client } from "../lib/mangadex/Client";
import { createReadStream, createWriteStream } from "fs";

const sleep = (ms) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}; // 59
const MAX_PAGE = 95;
const LIMIT = 100;
const START_INDEX = 0; //423700;

const stream = createWriteStream("data/chapter_result.jsonl", {
    flags: "a",
});
let i = START_INDEX;
const readStream = createReadStream("data/chapter_result.jsonl");
const proc = createInterface({
    input: readStream,
});
let lastLine = "";
for await (const line of proc) {
    if (line) {
        lastLine = line;
        i++;
    }
}
try {
    readStream.end();
} catch (err) {}
const LastItem = JSON.parse(lastLine || "{}");

async function main() {
    console.log("Buscando");
    const client = new Client();
    let page = 1;
    let createdAtSince = LastItem.attributes
        ? new Date(LastItem.attributes.createdAt).toISOString().slice(0, 19)
        : undefined;
    while (true) {
        const result = await client.chapther.search({
            limit: LIMIT,
            offset: page * LIMIT,
            order: {
                createdAt: "asc",
            },
            createdAtSince: createdAtSince,
            includes: ["scanlation_group", "manga"], //,
        });
        if (result.length === 0) {
            break;
        }
        for (const r of result) {
            i++;
            stream.write(JSON.stringify(r) + "\n");
        }
        console.log(`Salvando ${i}/2373222`);
        page++;

        if (page >= MAX_PAGE) {
            page = 0;
            const last = result.pop();

            createdAtSince = new Date(last.attributes.createdAt)
                .toISOString()
                .slice(0, 19);
            console.log("Atualizado createdAtSince para " + createdAtSince);
        }
        //await sleep(150);
    }
    stream.end();
    console.log("Finalizando ");
}

main().catch(
    /**
     * @param {import("mangadex-full-api")}
     */ (err) => {
        console.log(err);
    }
);
