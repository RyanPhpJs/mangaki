import { BaseClient } from "./client";
import { encode } from "../id";

export class Manga extends BaseClient {
    /**
     *
     * @param {*} client
     * @param {import("mangadex-wrapper").Manga} rawData
     */
    constructor(client, rawData) {
        super(client);
        this.id = encode(rawData.id);
        const titles = [rawData.title, ...rawData.altTitles].flatMap((e) => {
            const ret = [];
            for (const [k, v] of Object.entries(e)) {
                ret.push({
                    language: k,
                    title: v,
                });
            }
            return ret;
        });
        this.title = titles.shift().title;
        this.altTitles = titles;
        this.contentRating = rawData.contentRating;
        this.createdAt = rawData.createdAt;
        this.tags = {};
        for (const e of rawData.tags) {
            this.tags[e.id] =
                e.attributes.name?.en ?? Object.values(e.attribute.name)[0];
        }
        this.genre = [];
        this.format = [];
        this.content = [];
        this.theme = [];

        for (const tag of rawData.tags) {
            switch (tag.attributes.group) {
                case "genre":
                    this.genre.push(tag.id);
                    break;
                case "format":
                    this.format.push(tag.id);
                    break;
                case "content":
                    this.content.push(tag.id);
                    break;
                case "theme":
                    this.theme.push(tag.id);
                    break;
            }
        }

        this.lastChapter = rawData.lastChapter;
        this.lastVolume = rawData.lastVolume;
        this.language = rawData.originalLanguage;
        this.status = rawData.status;
        this.updatedAt = rawData.updatedAt;
        this.year = rawData.year;
        this.cover_art = rawData.relationships.find(
            (e) => e.type === "cover_art"
        )?.attributes?.fileName;
        //this.relations = rawData.relationships;
    }
}
