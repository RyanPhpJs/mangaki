import { BaseClient } from "../client";

export class TagManager extends BaseClient {
    db = new Map();
    async refresh() {
        const res = await fetch("https://api.mangadex.org/manga/tag");
        const json = await res.json();
        if (json.result === "ok") {
            for (const item of json.data) {
                this.db.set(item.id, {
                    id: item.id,
                    group: item.attributes.group,
                    name:
                        item.attributes.name?.en ??
                        Object.values(item.attribute.name)[0],
                });
            }
        }
    }
    gets(ids) {
        
    }
}
