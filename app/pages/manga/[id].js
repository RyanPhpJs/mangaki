import db from "../../../db";

export async function loader({ params, json, res }) {
    const response = await db.manga.findFirst({
        where: {
            id: params.id,
        },
    });

    if (!response) return res.notFound();
    json(response);
}
