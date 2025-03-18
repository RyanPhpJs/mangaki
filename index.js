import express from "express";
import fs from "fs";
import path from "path";
import mangadex from "./app/src/mangadex";

import { fileURLToPath } from "url";
import { dirname } from "path";
import { ZodError } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use((req, res, next) => {
    res.notFound = () => {
        res.status(404).send({
            message: "Not Found",
        });
    };
    next();
});

// Caminho para a pasta de páginas do Next.js
const PAGES_DIR = path.join(__dirname, "app/pages");

const routes = {
    has: [],
    out: [],
};

function createRoute(fn) {
    /**
     * @param {import("express").Response} res
     */
    return async (req, res) => {
        const params = req.params;
        const body = req.body;
        const query = req.query;
        const headers = req.headers;

        try {
            await fn({
                params,
                body,
                query,
                headers,
                res,
                req,
                json: (content) => {
                    res.json(content);
                },
                file: (content, type) => {
                    res.type(type);
                    res.send(content);
                },
            });
        } catch (err) {
            if (res.headersSent) {
                // conteudo ja enviado, porem um erro aconteceu
                res.end();
                console.error(err.message);
            } else {
                if (err instanceof ZodError) {
                    return res.status(400).send({
                        message: "Bad arguments",
                        stack: err.errors,
                    });
                }
                res.status(500).send({
                    message: "Um erro interno ocorreu",
                });
                console.error(err.message);
            }
        }
    };
}

/**
 *
 * @param {string} dir
 * @param {string} baseRoute
 */
async function loadRoutes(dir, baseRoute = "") {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Processa subdiretórios recursivamente
            await loadRoutes(fullPath, `${baseRoute}/${file}`);
        } else {
            const routeName = file.replace(".js", "");
            let has = false;
            // Converte os parâmetros dinâmicos e catch-all:
            // - [id] vira :id
            // - [...slug] vira :slug*
            const routePath = `${baseRoute}/${routeName}`
                .replace(/\[(\.\.\.\w+|\w+)\]/g, (match, p1) => {
                    has = true;
                    if (p1.startsWith("...")) {
                        return ":" + p1.slice(3) + "*";
                    }
                    return ":" + p1;
                })
                .replace("/index", "");
            const resultImported = await import(fullPath);
            if (resultImported.action) {
                routes[has ? "has" : "out"].push([
                    "post",
                    routePath,
                    createRoute(resultImported.action),
                ]);
            }
            if (resultImported.loader) {
                routes[has ? "has" : "out"].push([
                    "get",
                    routePath,
                    createRoute(resultImported.loader),
                ]);
            }

            console.log(`Rota carregada: ${routePath || "/"}`);
        }
    }
}
// Carrega as rotas da pasta app/pages
loadRoutes(PAGES_DIR)
    .then(async () => {
        for (const [method, ...args] of routes.out) {
            app[method](...args);
        }
        for (const [method, ...args] of routes.has) {
            app[method](...args);
        }
        await mangadex.start();
        app.listen(PORT, () => {
            console.log(`Servidor rodando em http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Houve um erro ao iniciar o servidor");
        console.error(err);
    });
