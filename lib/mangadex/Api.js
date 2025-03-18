import { stringify } from "qs";

const sleep = (ms) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
};

export class API {
    constructor(client, baseUrl) {
        this.baseUrl = baseUrl;
        this.client = client;
        this.rateLimitRequest = 0;
        this.timeReset = null;
    }

    prepareUri(url, query = null) {
        return `${this.baseUrl}${url}${query ? "?" + stringify(query) : ""}`;
    }

    /**
     *
     * @param {*} input
     * @param {*} init
     * @param {*} attemp
     * @returns {ReturnType<typeof fetch>}
     */
    async #executeFetch(input, init, attemp) {
        if (this.rateLimitRequest === 0) {
            this.timeReset = setTimeout(() => {
                this.rateLimitRequest = 0;
            }, 1000);
        }
        this.rateLimitRequest++;
        if (this.rateLimitRequest > 4) {
            console.log("Pego pelo rate limit");
            await sleep(1100);
        }
        const res = await fetch(input, init);
        if (res.status === 429) {
            console.log("Pego pelo rate limit");
            await sleep(2000);
        }
        if (res.status === 400) {
            console.log({ input, init });
            console.log("Tentativa falhou");
            attemp++;
            if (attemp > 10) {
                return res;
            }
            await sleep(5000);
            if (attemp === 5) return res;
            return this.#executeFetch(input, init, attemp);
        }

        if (!res.ok) {
            console.log({ input, init });
        }

        return res;
    }

    async request(url, method, { query, body } = {}) {
        const init = {
            method: method,
        };
        init.headers = new Headers(init.headers);

        // Verifica se o User-Agent já está definido
        if (!init.headers.has("User-Agent")) {
            init.headers.set(
                "User-Agent",
                "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36"
            );
        }
        if (method !== "GET") {
            init.headers.set(
                "Content-Type",
                "application/x-www-form-urlencoded"
            );
            init.body = stringify(body);
        }
        const input = this.prepareUri(url, query);
        const res = await this.#executeFetch(input, init, 0);
        if (!res.ok) {
            throw new Error("Error in call API");
        }
        const data = await res.json();
        return data.data;
    }

    get(url, query = null) {
        return this.request(url, "GET", { query });
    }

    post(url, query = null) {
        return this.request(url, "POST", { query });
    }
}
