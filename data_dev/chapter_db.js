import { createReadStream, createWriteStream } from "fs";
import { createInterface } from "readline";
import { inspect } from "util";
import db from "../db";
import { encode } from "../app/src/id";

function getChapterData(chapter) {
    const text = String(chapter || "")
        .toLowerCase()
        .trim();
    const index = Number(text);
    if (text === "oneshot") {
        return {
            flags: "oneshot",
            index: 0,
        };
    }
    if (text === "extra") {
        return {
            flags: "extra",
            index: 0,
        };
    }
    if (text === "?" || isNaN(index)) {
        return {
            flags: "uknown",
            index: 0,
        };
    }
    return {
        flags: null,
        index: index,
    };
} //3
const MAX = 20000;

const rl = createInterface({
    input: createReadStream("data_dev/chapter_result2.jsonl"),
});
let i = 0;
let skipRemaing = 2200000;
const relationsMany = [];
const chapterData = [];
const scanRelation = [];

async function insertData() {
    let test = {};
    for (const z of relationsMany) {
        test[z] = z;
    }
    const r = Object.values(test);
    if (r.length)
        await db.scan.createMany({
            data: r,
            skipDuplicates: true,
        });
    test = {};
    const rows = await db.chapter.createMany({
        data: chapterData,
        skipDuplicates: true,
    });
    if (scanRelation.length > 0)
        await db.chapterScan.createMany({
            data: scanRelation,
            skipDuplicates: true,
        });

    relationsMany.splice(0, relationsMany.length);
    scanRelation.splice(0, scanRelation.length);
    chapterData.splice(0, chapterData.length);
    console.clear();
    console.log(
        "+" + rows.count + " capitulos inseridos (" + i + "/2.370.000)"
    );
}
for await (const line of rl) {
    i++;
    if (skipRemaing > 0) {
        skipRemaing--;
        continue;
    }

    /**
     * @type {import("../lib/mangadex/types/Schema").ChapterSchema}
     */
    const json = JSON.parse(line);
    const chapterId = encode(json.id);
    let mangaId = null;

    for (const $item of json.relationships.filter((e) =>
        ["scanlation_group", "manga"].includes(e.type)
    )) {
        /**
         * @type {import("../lib/mangadex/types/Schema").ScanlationGroupSchema}
         */
        const item = $item;
        if (item.type === "scanlation_group") {
            const scanId = item.id;

            if (item.attributes)
                relationsMany.push({
                    id: scanId,
                    name: item.attributes.name,
                    contact_email: item.attributes.contactEmail,
                    description: "",
                    discord: item.attributes.discord,
                    twitter: item.attributes.twitter,
                    focused_language: item.attributes.focusedLanguage || [],
                    official: item.attributes.official,
                    verified: item.attributes.verified,
                });
            else
                relationsMany.push({
                    id: scanId,
                });

            scanRelation.push({
                chapter_id: chapterId,
                scan_id: scanId,
            });
        }
        if (item.type === "manga") {
            mangaId = encode(item.id);
        }
    }

    if (json.attributes && mangaId) {
        const cpData = getChapterData(json.attributes.chapter);
        if (!json.attributes.translatedLanguage) {
            console.log(json);
        }
        chapterData.push({
            id: chapterId,
            manga_id: mangaId,
            volume:
                json.attributes.volume === "-"
                    ? ""
                    : json.attributes.volume || "",
            chapther: cpData.index,
            flags: cpData.flags,
            title: json.attributes.title || "",
            language: (json.attributes.translatedLanguage || "").toUpperCase(),
            pages: isNaN(Number(json.attributes.pages))
                ? Number(json.attributes.pages)
                : 0,
            publishAt: json.attributes.publishAt,
            external_url: json.attributes.externalUrl,
        });
    }

    if (chapterData.length >= MAX) {
        await insertData();
    }
}

await insertData();
