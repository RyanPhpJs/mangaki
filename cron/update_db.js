import db from "../db";
import { Client } from "../lib/mangadex/Client";
import { decode, encode } from "../app/src/id";
const MAX = isNaN(Number(args[0])) ? Number(args[0]) : 5;
const client = new Client();

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

// pegar os ultimos 500 mangas adicionado
// pegar os ultimos 500 mangas atualizados
// pegar os ultimos 500 capitulos adicionados
// pegar os ultimos 500 capitulos atualizados

function parseMangas(res) {
    const result = {
        mangas: [],
        authors: [],
        relations: [],
    };
    for (const json of res) {
        const mangaId = encode(json.id);
        const titles = getLanguageDetails(json.attributes.title);
        const altTitles = json.attributes.altTitles.flatMap((e) =>
            getLanguage(e)
        );
        for (const item of json.relationships.filter((e) =>
            ["author", "artist"].includes(e.type)
        )) {
            if (item.attributes) {
                result.authors.push({
                    id: encode(item.id),
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
                if (json.attributes) {
                    result.relations.push({
                        manga_id: mangaId,
                        member_id: encode(item.id),
                    });
                }
            }
        }
        if (json.attributes)
            result.mangas.push({
                id: mangaId,
                cover_art: json.relationships.find(
                    (e) => e.type === "cover_art"
                )?.attributes?.fileName,
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
                publicDemographic:
                    json.attributes.publicationDemographic || "none",
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
    return result;
}

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

function splitArrayIntoChunks(arr, chunkSize) {
    let result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        result.push(arr.slice(i, i + chunkSize));
    }
    return result;
}

/**
 * Primeira etapa é pegar os capitulos adicionados e atualizados
 * selecionando pelos mangas atualizados recentemente ele exibe tambem os adicionados recentemente
 * ja que por padrão updatedAt é createdAt
 */
async function getMangas(ids = null) {
    const result = {
        mangas: [],
        authors: [],
        relations: [],
    };
    if (ids === null) {
        for (let i = 0; i < MAX; i++) {
            const res = await client.manga.search({
                limit: 100,
                offset: 100 * i,
                order: {
                    updatedAt: "desc",
                },
                includes: ["cover_art", "artist", "author"],
            });
            const item = parseMangas(res);
            result.authors.push(...item.authors);
            result.mangas.push(...item.mangas);
            result.relations.push(...item.relations);
        }
        return result;
    }

    const list = splitArrayIntoChunks(
        ids.map((e) => decode(e)),
        80
    );
    for (const id of list) {
        const res = await client.manga.search({
            limit: 80,
            ids: id,
            order: {
                updatedAt: "desc",
            },
            includes: ["cover_art", "artist", "author"],
        });
        const item = parseMangas(res);
        result.authors.push(...item.authors);
        result.mangas.push(...item.mangas);
        result.relations.push(...item.relations);
    }

    return result;
}
/**
 * A segunda etapa é selecionar os capitulos
 */
async function getChapters() {
    const result = {
        chapters: [],
        scanlations: [],
        relations: [],
        mangas: [],
    };

    for (let i = 0; i < MAX; i++) {
        const res = await client.chapther.search({
            limit: 100,
            offset: 100 * i,
            order: {
                updatedAt: "desc",
            },
            includes: ["scanlation_group"], //,
        });
        for (const json of res) {
            const chapterId = encode(json.id);
            let mangaId = null;

            for (const item of json.relationships.filter((e) =>
                ["scanlation_group", "manga"].includes(e.type)
            )) {
                if (item.type === "scanlation_group") {
                    const scanId = item.id;

                    if (item.attributes)
                        result.scanlations.push({
                            id: scanId,
                            name: item.attributes.name,
                            contact_email: item.attributes.contactEmail,
                            description: "",
                            discord: item.attributes.discord,
                            twitter: item.attributes.twitter,
                            focused_language:
                                item.attributes.focusedLanguage || [],
                            official: item.attributes.official,
                            verified: item.attributes.verified,
                        });
                    else
                        result.scanlations.push({
                            id: scanId,
                        });

                    result.relations.push({
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

                result.chapters.push({
                    id: chapterId,
                    manga_id: mangaId,
                    volume:
                        json.attributes.volume === "-"
                            ? ""
                            : json.attributes.volume || "",
                    chapther: cpData.index,
                    flags: cpData.flags,
                    title: json.attributes.title || "",
                    language: (
                        json.attributes.translatedLanguage || ""
                    ).toUpperCase(),
                    pages: isNaN(Number(json.attributes.pages))
                        ? Number(json.attributes.pages)
                        : 0,
                    publishAt: json.attributes.publishAt,
                    external_url: json.attributes.externalUrl,
                });
            }
        }
    }
    const mangas = new Set();
    for (const r of result.chapters) {
        mangas.add(r.manga_id);
    }
    result.mangas.push(...mangas.values());
    return result;
}

async function findNotFoundManga(list) {
    const withSet = new Set(list);
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
    console.log(`${withSet.size} ids não encontrado no banco de dados`);
    return withSet;
}

/**
 *
 * @param {"manga"|"mangaMember"|"mangaRelation"|"chapter"|"chapterScan"|"scan"} name
 * @param {*} values
 * @param {string} log
 */
async function insert(name, values, log = "") {
    const res = await db[name].createMany({
        data: values,
        skipDuplicates: true,
    });
    console.log(log.replace("{count}", res.count));
    return res;
}

/**
 * Os capitulos cujo se referem a um manga não existente é um problema
 * Devido a isso deve-se verificar quais ~mangas  não existem para a inserção
 * não adianta usar include[mangas], devido ao fato de que o manga utiliza cover_art, na qual não é incluida
 */
console.log("Buscando mangas");
const res = await getMangas();
console.log("Inserindo mangas");
await insert("manga", res.mangas, "Inserido {count} mangas");
await insert("mangaMember", res.authors, "Inserido {count} members");
await insert("mangaRelation", res.relations, "Inserido {count} relações");

// Capitulos
console.log("Inserindo capitulos");
const cp = await getChapters();
const notFoundMangasIds = await findNotFoundManga(cp.mangas);
const nf = await getMangas([...notFoundMangasIds.values()]);

await insert("manga", nf.mangas, "Inserido {count} mangas");
await insert("mangaMember", nf.authors, "Inserido {count} members");
await insert("mangaRelation", nf.relations, "Inserido {count} relações");

console.log("Mangas inexistentes inseridos");
await insert("scan", cp.scanlations, "Inserido {count} scan_groups");
await insert("chapter", cp.chapters, "Inserido {count} capitulos");
await insert("chapterScan", cp.relations, "Inserido {count} relações");

console.log("Capitulos inseridos");
