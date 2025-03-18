export class BaseClient {
    /**
     *
     * @param {import("../mangadex")['default']} client
     */
    constructor(client) {
        this.client = client;
    }

    toJSON() {
        const { client, ...other } = this;
        return other;
    }
}
