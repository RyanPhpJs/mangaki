type UUID = `${string}-${string}-${string}-${string}`;

export type MangaRequest = Partial<{
    limit: number;
    offset: number;
    title: string;
    authorOrArtist: UUID;
    authors: UUID[];
    artists: UUID[];
    year: string | number;
    includedTags: UUID[];
    includedTagsMode: "AND" | "OR";
    excludedTags: UUID[];
    excludedTagsMode: "AND" | "OR";
    status: ("ongoing" | "completed" | "hiatus" | "cancelled")[];
    originalLanguage: string[];
    excludedOriginalLanguage: string[];
    availableTranslatedLanguage: string[];
    publicationDemographic: (
        | "shounen"
        | "shoujo"
        | "josei"
        | "seinen"
        | "none"
    )[];
    ids: UUID[];
    contentRating: ("safe" | "suggestive" | "erotica" | "pornographic")[];
    createdAtSince: string;
    updatedAtSince: string;
    order: Record<
        | "title"
        | "year"
        | "createdAt"
        | "updatedAt"
        | "latestUploadedChapter"
        | "followedCount"
        | "relevance"
        | "rating",
        OrderValue
    >;
    includes: (
        | "manga"
        | "cover_art"
        | "author"
        | "artist"
        | "tag"
        | "creator"
    )[];
    hasAvailableChapters: "0" | "1" | "true" | "false";
    group: UUID;
}>;
type OrderValue = "asc" | "desc";
