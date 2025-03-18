import mangadex from "../../src/mangadex";
import z from "zod";
import { decode } from "../../src/id";
import db from "../../../db";

const Query = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(10).max(30).default(20),

    title: z.string().optional(),
    authors: z.array(z.string()).optional(),
    artists: z.array(z.string()).optional(),
    year: z.coerce.number().int().min(1900).max(2100).optional(),
    tags: z.array(z.string()).optional(),
    excludeTags: z.array(z.string()).optional(),
    status: z
        .array(z.enum(["ongoing", "hiatus", "completed", "cancelled"]))
        .optional(),
    originalLanguage: z.array(z.string()).optional(),
    language: z.array(z.string()).optional(),
    publicDemographic: z
        .array(z.enum(["shounen", "shoujo", "josei", "seinen", "none"]))
        .optional(),
    rating: z.array(z.enum(["safe", "suggestive", "erotica"])).optional(),
});

const where = {
    contains: (x) => ({
        contains: x,
    }),
    someIn: (f, x) => ({
        some: {
            [f]: {
                in: x,
            },
        },
    }),
    arrayContains: (x) => ({
        array_contains: x,
    }),
    has: (a) => ({
        in: Array.isArray(a) ? a : [a],
    }),
};

export async function loader({ query, json }) {
    const q = Query.parse(query);

    const queryConsult = {};
    if (q.title) queryConsult.title = where.contains(q.title);
    if (q.authors && q.authors.length > 0)
        queryConsult.authors = where.someIn("author_id", q.authors);
    if (q.artists && q.artists.length > 0)
        queryConsult.artist = where.someIn("artist_id", q.artists);
    if (q.year) queryConsult.year = q.year;
    if (q.tags && q.tags.length > 0)
        queryConsult.tags = where.arrayContains(q.tags);
    if (q.excludeTags && q.excludeTags.length > 0) {
        queryConsult.NOT = {
            OR: q.excludeTags.map((e) => ({
                tags: where.arrayContains([e]),
            })),
        };
    }
    if (q.status && q.status.length > 0)
        queryConsult.status = where.has(q.status);
    if (q.originalLanguage && q.originalLanguage.length > 0)
        queryConsult.originalLanguage = where.has(q.originalLanguage);
    if (q.publicDemographic && q.publicDemographic.length > 0)
        queryConsult.publicDemographic = where.has(q.publicDemographic);
    if (q.rating && q.rating.length > 0)
        queryConsult.rating = where.has(q.rating);

    const result = await db.manga.findMany({
        where: queryConsult,
        take: q.limit + 1,
        skip: (q.page - 1) * q.limit,
    });

    return json(result);
    //    const result2 = await mangadex.manga.find({
    //      title: query.title,
    //      includes: ["cover_art"],
    //    });
    //    json(result);
}
