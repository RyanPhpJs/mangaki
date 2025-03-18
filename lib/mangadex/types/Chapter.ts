type UUID = `${string}-${string}-${string}-${string}`;

export type ChapterRequest = Partial<{
    limit: number;
    offset: number;
    title: string;
    groups: UUID[];
    uploader: UUID | UUID[];
    manga: UUID;
    chapter: string | string[];
    contentRating: ("safe" | "suggestive" | "erotica")[];
    includeFutureUpdates: "0" | "1";
    includeEmptyPages: 0 | 1;
    includeFuturePublishAt: 0 | 1;
    includeExternalUrl: 0 | 1;
    createdAtSince: string;
    updatedAtSince: string;
    publishAtSince: string;
    order: Record<
        "volume" | "createdAt" | "updatedAt" | "publishAt" | "chapter",
        OrderValue
    >;
    includes: ("manga" | "scanlation_group" | "user")[];
}>;
type OrderValue = "asc" | "desc";
