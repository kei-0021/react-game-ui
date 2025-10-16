import { TokenId } from "./definition.js";
export type Token = {
    id: TokenId;
    name: string;
    imageSrc: string;
    description?: string;
    color?: string;
};
