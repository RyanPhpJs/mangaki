import { createReadStream } from "fs";
import { createInterface } from "readline";
import { inspect } from "util";
import db from "../db";
import { encode, decode } from "../app/src/id";
import { Client } from "../lib/mangadex/Client";

function getLanguageDetails(languageObj) {
    const keys = Object.keys(languageObj);
    let primaryKey;

    // Prioridade: 'pt-br' > 'en' > primeiro elemento disponível
    if (languageObj.hasOwnProperty("pt-br")) {
        primaryKey = "pt-br";
    } else if (languageObj.hasOwnProperty("en")) {
        primaryKey = "en";
    } else if (keys.length > 0) {
        primaryKey = keys[0];
    }

    if (!primaryKey) {
        return { primaryLanguage: null, otherLanguages: [] };
    }

    const primaryLanguage = {
        language: primaryKey,
        value: languageObj[primaryKey],
    };
    const otherLanguages = keys
        .filter((key) => key !== primaryKey)
        .map((key) => ({ language: key, value: languageObj[key] }));

    return { primaryLanguage, otherLanguages };
}

function getLanguage(obj) {
    const t = getLanguageDetails(obj);
    return t.primaryLanguage ? [t.primaryLanguage, ...t.otherLanguages] : [];
}

const rl = createInterface({
    input: createReadStream("data_dev/manga_ids.jsonl"),
});
let i = 0;
let skipRemaing = 0;
const relationsMany = [];
const mangaDatas = [];
console.log("Iniciado");
async function insertData() {
    let count = 0;
    for (const data of mangaDatas) {
        if (
            !(await db.manga.findFirst({
                where: {
                    id: data.id,
                },
            }))
        ) {
            const res = await db.manga.create({
                data: data,
            });
            console.log("Inserido " + res.id);
            count++;
        }
    }
    await db.mangaRelation.createMany({
        data: relationsMany,
        skipDuplicates: true,
    });
    relationsMany.splice(0, relationsMany.length);
    mangaDatas.splice(0, mangaDatas.length);
    console.clear();
    console.log("+" + count + " Mangas inseridos (" + i + "/83013)");
}
/**
 * @template {any} K
 * @param {K} arr
 * @param {Number} chunkSize
 * @returns {K[]}
 */
function splitArrayIntoChunks(arr, chunkSize) {
    let result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        result.push(arr.slice(i, i + chunkSize));
    }
    return result;
}
const Ids = [];
for await (const line of rl) {
    Ids.push(decode(line));
}
//const searchIds = splitArrayIntoChunks(Ids, 80);
const result = [];
const client = new Client();
//for (const searchId of Ids) {
const response = await client.manga.search({
    ids: Ids,
    limit: 100,
    includes: ["cover_art", "author", "artist"],
});
console.log(response.length);
//}
for (const json of response) {
    const mangaId = encode(json.id);

    for (const item of json.relationships.filter((e) =>
        ["author", "artist"].includes(e.type)
    )) {
        if (item.attributes)
            relationsMany.push({
                id: encode(item.id),
                manga_id: mangaId,
                type: item.type,
                name: item.attributes.name,
                imageUrl: item.attributes.imageUrl,
                biography: item.attributes.biography || {},
                twitter: item.attributes.twitter,
                pixiv: item.attributes.pixiv,
                melonBook: item.attributes.melonBook,
                fanBox: item.attributes.fanBox,
                booth: item.attributes.booth,
                nicoVideo: item.attributes.nicoVideo,
                skeb: item.attributes.skeb,
                fantia: item.attributes.fantia,
                tumblr: item.attributes.tumblr,
                youtube: item.attributes.youtube,
                weibo: item.attributes.weibo,
                naver: item.attributes.naver,
                namicomi: item.attributes.namicomi,
                website: item.attributes.website,
            });
    }

    if (json.attributes) {
        const titles = getLanguageDetails(json.attributes.title);
        const altTitles = json.attributes.altTitles.flatMap((e) =>
            getLanguage(e)
        );

        mangaDatas.push({
            id: mangaId,
            cover_art: json.relationships.find((e) => e.type === "cover_art")
                ?.attributes?.fileName,
            status: json.attributes.status,
            title: titles.primaryLanguage.value,
            altTitles: [...titles.otherLanguages, ...altTitles],
            originalLanguage: json.attributes.originalLanguage,
            avaliableLanguage: json.attributes.availableTranslatedLanguages,
            cpReset: json.attributes.chapterNumbersResetOnNewVolume,
            description: json.attributes.description,
            isLocked: json.attributes.isLocked,
            rating:
                json.attributes.contentRating === "safe"
                    ? "SAFE"
                    : json.attributes.contentRating === "suggestive"
                    ? "SUGESTIVE"
                    : "EROTICA",
            year: Math.max(
                1900,
                isNaN(json.attributes.year) ? 0 : json.attributes.year
            ),
            publicDemographic: json.attributes.publicationDemographic || "none",
            tags: json.attributes.tags.map((e) => e.id),
            anilist_id: json.attributes.links?.al,
            animeplanet_id: json.attributes.links?.ap,
            bookwalker_url: json.attributes.links?.bw,
            kitsu_id: json.attributes.links?.kt,
            mangaupdate_id: json.attributes.links?.mu,
            amazon_url: json.attributes.links?.amz,
            ebookjp_url: json.attributes.links?.ebj,
            mal_id: json.attributes.links?.mal,
            raw_url: json.attributes.links?.raw,
        });
    }

    if (mangaDatas.length >= 5000) {
        await insertData();
    }
}

await insertData();
