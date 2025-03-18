export class Base {
    /**
     *
     * @param {import("./Client").Client} client
     */
    constructor(client) {
        this.client = client;
    }
    toJSON() {
        const { client, ...args } = this;
        return args;
    }
}
