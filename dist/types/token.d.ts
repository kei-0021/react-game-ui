import { TokenId } from './definition.js';
/**
 * トークンのデータ構造
 * @property {TokenId} id - 一意な識別子
 * @property {string} name - トークン名
 * @property {string} [imageSrc] - トークンの画像URL（省略時は名前を表示）
 * @property {string} [description] - トークンの説明文
 * @property {number} count - 現在の保持数
 * @property {string} [color] - UI表示用のカラーコード
 */
export type Token = {
    id: TokenId;
    name: string;
    imageSrc?: string;
    description?: string;
    count: number;
    color?: string;
};
//# sourceMappingURL=token.d.ts.map