import { Base } from "./Base";

export class Chapter extends Base {
    /**
     *
     * @param {import("./types/Chapter").ChapterRequest} params
     * @returns {Promise<import("./types/Schema").ChapterSchema[]>}
     */
    async search(params) {
        return await this.client.api.get("/chapter", params);
    }
}
