import { GameParam } from '@/index.js';
import { GameId } from '@/types/component.js';
import { Server as SocketIOServer } from 'socket.io';
import { LogCategory, LogLevel } from './logger.js';
/**
 * サーバー設定の型定義
 */
export type GameServerOptions = {
    port?: number;
    libDistPath?: string;
    clientDistPath?: string;
    corsOrigins?: string[];
    gameParams: Record<GameId, GameParam>;
    customEvents?: any;
    initialLogCategories?: Partial<Record<LogCategory, boolean>> | null;
    initialLogLevel?: LogLevel | null;
};
/**
 * GameServer
 * ExpressとSocket.IOを統合し、ゲームプリセットの管理、静的ファイル配信、
 * および実行時のGameParam動的更新（ホットスワップ）を統括するコアクラス。
 * @property {number} port - サーバーがリッスンするポート番号
 * @property {string} libDistPath - /lib パスで提供されるビルド済みライブラリ資産のパス
 * @property {string} clientDistPath - ルートパスで提供されるクライアント側静的ファイルのパス
 * @property {string[]} corsOrigins - CORSを許可するオリジンのリスト
 * @property {Record<gameId, GameParam>} gameParams - 登録されている各ゲームの初期パラメータ定義
 * @property {any} customEvents - ユーザー定義のカスタムイベントハンドラ
 * @property {Partial<Record<LogCategory, boolean>> | null} initialLogCategories - ログ出力の制御設定
 * @property {LogLevel | null} initialLogLevel - ログ出力のレベル
 * @property {express.Application} app - Expressアプリケーションインスタンス
 * @property {HttpServer} httpServer - Node.js HTTPサーバーインスタンス
 * @property {SocketIOServer} io - 通信を制御するSocket.IOサーバーインスタンス
 */
export declare class GameServer {
    protected port: number;
    private libDistPath;
    private clientDistPath;
    private corsOrigins;
    gameParams: Record<GameId, GameParam>;
    private customEvents;
    private initialLogCategories;
    private initialLogLevel;
    private app;
    private httpServer;
    io: SocketIOServer;
    constructor(options: GameServerOptions);
    /**
     * 静的ファイルのルーティングを設定する。
     * ライブラリ本体（/lib）とクライアント側資産（/）の各ディレクトリが存在する場合、
     * Expressのミドルウェアを使用して公開し、ルートアクセス時の index.html 配信を制御する。
     */
    private setupStaticRoutes;
    /**
     * ゲームロジックの初期化
     * 各プリセット情報をそのまま渡すことで、ルームごとに独立した効果を適用可能にする
     */
    private initSocketLogic;
    /**
     * 指定されたポートでHTTPサーバーの待機を開始する。
     * 起動完了後、コンソールにアクセス可能なURL（http://localhost:{port}）を出力する。
     */
    start(): void;
}
//# sourceMappingURL=server.d.ts.map