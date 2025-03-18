import { BaseClient } from "../client";
import { Manga } from "../manga";

export class MangaManager extends BaseClient {
    /**
     *
     * @param {} queryOptions
     */
    async find(queryOptions) {
        const results = await this.client.api.fetchManga(queryOptions);
        return results.map((e) => this.#create(e));
    }

    #create(manga) {
        return new Manga(this, manga);
    }
}
