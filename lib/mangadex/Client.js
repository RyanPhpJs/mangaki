import { API } from "./Api";
import { Chapter } from "./Chapter";
import { Manga } from "./Manga";

export class Client {
    constructor() {
        this.api = new API(this, "https://api.mangadex.org");
        this.manga = new Manga(this);
        this.chapther = new Chapter(this);
    }
}
