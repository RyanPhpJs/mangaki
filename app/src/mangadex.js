import base from "./mangadex_client/base";
import { MangaManager } from "./mangadex_client/managers/manga";
import { TagManager } from "./mangadex_client/managers/tag";

export default new (class Mangadex {
    constructor() {
        this.api = base;
        this.manga = new MangaManager(this);
        this.tags = new TagManager(this);
        this._interval = null;
        this.intervals = [];

        this.intervals.push(async () => {
            await this.tags.refresh();
        });
    }

    async start() {
        /**
         * @private
         */
        this._interval = setInterval(async () => {
            for (const i of this.intervals) {
                await i();
            }
        }, 1000 * 60 * 15);
        for (const i of this.intervals) {
            await i();
        }
    }

    end() {
        clearInterval(this._interval);
        this._interval = null;
    }
})();
