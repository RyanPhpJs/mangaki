import { ZodObject } from "zod";

const cwd = process.cwd();

function translateZodIssues(issue) {
    //return issues.map((issue) => {
    let message;

    switch (issue.code) {
        case "invalid_type": {
            // Se o valor estiver ausente (undefined ou null) e o campo for obrigatório,
            // o Zod costuma retornar "invalid_type" com received: undefined.
            if (issue.received === "undefined") {
                message = "O valor é obrigatório";
            } else {
                // Se houver um tipo esperado, usa-o; caso contrário, usa uma mensagem padrão.
                const expectedType = issue.expected || "valor correto";
                message = `O valor informado deve ser do tipo ${expectedType}`;
            }
            break;
        }
        case "too_small": {
            // Esse código pode ocorrer para strings, números ou arrays.
            if (issue.type === "string") {
                // Exemplo: "Deve ter no mínimo 10 caracteres"
                message = `Deve ter no mínimo ${issue.minimum} caracteres`;
            } else if (issue.type === "number") {
                // Exemplo: "Deve ser no mínimo 10"
                message = `Deve ser no mínimo ${issue.minimum}`;
            } else if (issue.type === "array") {
                // Exemplo: "Deve conter no mínimo 2 itens"
                message = `Deve conter no mínimo ${issue.minimum} itens`;
            } else {
                message = `Valor muito pequeno; mínimo esperado: ${issue.minimum}`;
            }
            break;
        }
        case "too_big": {
            // Semelhante ao too_small, mas para tamanho máximo.
            if (issue.type === "string") {
                message = `Deve ter no máximo ${issue.maximum} caracteres`;
            } else if (issue.type === "number") {
                message = `Deve ser no máximo ${issue.maximum}`;
            } else if (issue.type === "array") {
                message = `Deve conter no máximo ${issue.maximum} itens`;
            } else {
                message = `Valor muito grande; máximo esperado: ${issue.maximum}`;
            }
            break;
        }
        case "invalid_string": {
            // Pode ocorrer quando a string não corresponde ao padrão esperado.
            message = "O valor informado deve ser uma string";
            break;
        }
        case "unrecognized_keys": {
            // Indica que foram enviados campos não definidos no esquema.
            message = `Chave(s) não reconhecida(s): ${
                issue.keys ? issue.keys.join(", ") : ""
            }`;
            break;
        }
        case "invalid_enum_value": {
            message = "Valor não corresponde a nenhum dos valores permitidos";
            break;
        }
        case "custom": {
            // Para erros personalizados, usa a mensagem fornecida ou uma padrão.
            message = issue.message || "Valor inválido";
            break;
        }
        default: {
            // Caso não haja mapeamento específico, mantém a mensagem original.
            message = issue.message;
        }
    }

    // Retorna o objeto erro com a mensagem traduzida
    return {
        ...issue,
        message,
    };
    //});
}

export class RouteArgs {
    #request;
    #response;
    /**
     *
     * @param {import("express").Request} request
     * @param {import("express").Response} response
     * @param {Object} param2
     * @param {*} param2.query
     * @param {*} param2.body
     * @param {ZodObject} param2.zodSchema
     */
    constructor(request, response, { zodSchema }) {
        this.#request = request;
        this.#response = response;
        this.options = {
            canWrite: true,
        };

        const data =
            this.#request.method === "GET"
                ? this.#request.query
                : this.#response.body;
        const res = zodSchema.safeParse(data);

        this.form = {
            bad: (content) => {
                this.sendStatus(400);
                this.form.error(
                    "Os campos não foram preenchidos corretamente",
                    content
                );
            },
            error: (msg, insues) => {
                this.json({
                    success: false,
                    data: {
                        message: msg,
                    },
                    errors: insues,
                });
            },
        };

        if (!res.success) {
            this.form.bad(res.error.issues.map(translateZodIssues));
            this.continue = false;
            return;
        }

        this.continue = true;

        this.data = res.data;

        this.headers = this.#request.headers;
        this.query = this.#request.query;
        this.body = this.#request.body;
        this.params = this.#request.params;
    } //

    sendStatus(code) {
        this.#response.status(code);
    }

    success(res = {}) {
        this.json({
            success: true,
            data: res,
        });
    }

    error(err = "Houve um erro inesperado", status = 500) {
        this.sendStatus(status);
        this.json({
            success: false,
            data: {
                message: err,
            },
        });
    }

    sendHeader(key, value) {
        this.#response.setHeader(key, value);
        return this;
    }

    sendBadRequest(message) {
        this.error(message);
    }

    /**
     * verifica se pode escrever na resposta, caso não ele lança um erro
     */
    initWritter() {
        if (this.options.canWrite) {
            return true;
        }
        throw new Error("NOT_CAN_WRITE");
    }
    endWritter() {
        if (!this.#response.headersSent) {
            this.#response.status(204);
            this.#response.end();
        }
        this.options.canWrite = false;
    }

    json(data) {
        this.initWritter();
        this.#response.json(data);
        this.endWritter();
    }

    type(type) {
        this.#response.type(type);
    }

    file(file) {
        this.initWritter();
        this.#response.sendFile(file, {
            root: process.cwd(),
            dotfiles: "deny",
        });
    }

    send(text) {
        this.initWritter();
        this.#response.send(text);
    }
}

export function createRoute(fn, schema) {
    /**
     * @param {import("express").Response} res
     */
    return async (req, res) => {
        const route = new RouteArgs(req, res, { zodSchema: schema });
        if (!route.continue) return;
        try {
            await fn(route);
        } catch (err) {
            if (res.headersSent) {
                // conteudo ja enviado, porem um erro aconteceu
                res.end();
                console.error(err.message);
            } else {
                if (err instanceof ZodError) {
                    return route.form.bad(err.issues.map(translateZodIssues));
                }
                route.sendStatus(500);
                route.error("Houve um erro interno");
                console.error(err.message);
            }
        }
    };
}
