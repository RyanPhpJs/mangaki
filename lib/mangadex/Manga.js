import { Base } from "./Base";

export class Manga extends Base {
    /**
     *
     * @param {import("./types/Manga").MangaRequest} params
     * @returns {Promise<import("./types/Schema").MangaSchema[]>}
     */
    async search(params) {
        return await this.client.api.get("/manga", params);
    }
}
