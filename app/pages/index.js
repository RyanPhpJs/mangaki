export function loader({ json }) {
    json({
        message: "Servidor online",
        routes: ["/ping"],
    });
}
