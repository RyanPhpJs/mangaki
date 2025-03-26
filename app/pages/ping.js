/**
 * @type {import("../../routes").LoaderFunction<typeof schema>}
 */
export function loader(res) {
    res.success({
        message: "Pong!",
    });
}
