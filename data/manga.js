import db from "../db";
import { Client } from "../lib/mangadex/Client";
import { createWriteStream, createReadStream } from "fs";
import { createInterface } from "readline";
const sleep = (ms) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
};
const MAX_PAGE = 80;
const LIMIT = 100;
const START_INDEX = 0;

const stream = createWriteStream("data/manga_result.jsonl", {
    flags: "a",
});
let i = START_INDEX;

const readStream = createReadStream("data/manga_result.jsonl");
const proc = createInterface({
    input: readStream,
});
let lastLine = "";
for await (const line of proc) {
    if (line) {
        lastLine = line;
        i++;
    }
}//
try {
    readStream.end();
} catch (err) {}
const LastItem = JSON.parse(lastLine || "{}");

async function main() {
    console.log("Buscando");
    const client = new Client();
    let page = Math.max(Math.floor(START_INDEX / LIMIT) - 1, 1);
    let createdAtSince = new Date(LastItem.attributes.createdAt)
        .toISOString()
        .slice(0, 19);

    while (true) {
        const result = await client.manga.search({
            limit: LIMIT,
            offset: page * LIMIT,
            order: {
                createdAt: "asc",
            },
            createdAtSince: createdAtSince,
            includes: ["cover_art", "artist", "author"], //,
        });
        if (result.length === 0) {
            break;
        }
        for (const r of result) {
            i++;
            stream.write(JSON.stringify(r) + "\n");
        }
        console.log(`Salvando ${i}/83800`);
        page++;

        if (page >= MAX_PAGE) {
            page = 0;
            const last = result.pop();

            createdAtSince = new Date(last.attributes.createdAt)
                .toISOString()
                .slice(0, 19);
            console.log("Atualizado createdAtSince para " + createdAtSince);
        }
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
