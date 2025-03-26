import { createReadStream, createWriteStream } from "fs";
import { createInterface } from "readline";
import { inspect } from "util";
import db from "../db";
import { encode } from "../app/src/id";

const $stream = createWriteStream("data_dev/manga_ids.jsonl", {
    //flags: "a",
}); // 1
const MAX = 2000000;

const rl = createInterface({
    input: createReadStream("data_dev/chapter_result2.jsonl"),
});
let i = 0;
let skipRemaing = 0;
const chapterData = [];
const memoryIds = new Set();

async function findData() {
    const withSet = new Set(chapterData);
    const results = await db.manga.findMany({
        where: {
            id: {
                in: [...withSet.values()],
            },
        },
        select: {
            id: true,
        },
    });
    for (const field of results) {
        withSet.delete(field.id);
    }
    let zz = 0;
    // só sobrara os ids que não existem na db
    for (const id of withSet.values()) {
        if (!memoryIds.has(id)) {
            $stream.write(id + "\n");
            zz++;
            memoryIds.add(id);
        }
    }
    console.log(`${zz} ids não encontrado no banco de dados`);

    chapterData.splice(0, chapterData.length);
}
for await (const line of rl) {
    i++;
    if (i % 20000 === 0) {
        console.log(i + "/2.38bi");
    }
    if (skipRemaing > 0) {
        skipRemaing--;
        continue;
    }

    /**
     * @type {import("../lib/mangadex/types/Schema").ChapterSchema}
     */
    const json = JSON.parse(line);
    let mangaId = null;

    for (const $item of json.relationships.filter((e) =>
        ["manga"].includes(e.type)
    )) {
        /**
         * @type {import("../lib/mangadex/types/Schema").ScanlationGroupSchema}
         */
        const item = $item;
        if (item.type === "manga") {
            mangaId = encode(item.id);
        }
    }

    if (json.attributes && mangaId) {
        chapterData.push(mangaId);
    }

    if (chapterData.length >= MAX) {
        await findData();
    }
}

await findData();
