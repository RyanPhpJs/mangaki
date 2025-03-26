import { z, ZodObject } from "zod";
import { RouteArgs } from "./route";

type JsonAccept =
    | string
    | number
    | boolean
    | JsonAccept[]
    | { [k: string]: JsonAccept };

const Default = z.object({});

export class LoaderArgs<BodyParams extends ZodObject<any>> extends RouteArgs {
    // @ts-ignore
    data: z.TypeOf<BodyParams>;
}
export type LoaderFunction<BodyParams extends ZodObject<any> = typeof Default> =
    (args: LoaderArgs<BodyParams>) => any;
