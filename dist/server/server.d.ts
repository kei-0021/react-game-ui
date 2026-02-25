import { RoomParam } from '@/types/server.js';
import express from 'express';
import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { LogCategory } from './server-utils.js';
/**
 * サーバー設定の型定義
 */
export type GameServerOptions = {
    port?: number;
    libDistPath?: string;
    clientDistPath?: string;
    corsOrigins?: string[];
    onServerStart?: (url: string) => void;
    gamePresets: Record<string, RoomParam>;
    customEvents?: any;
    initialLogCategories?: Record<LogCategory, boolean> | null;
};
export declare class GameServer {
    private port;
    private libDistPath;
    private clientDistPath;
    private corsOrigins;
    private onServerStart?;
    private gamePresets;
    private customEvents;
    private initialLogCategories;
    app: express.Application;
    httpServer: HttpServer;
    io: SocketIOServer;
    constructor(options: GameServerOptions);
    private setupStaticRoutes;
    /**
     * ゲームロジックの初期化
     * 各プリセット情報をそのまま渡すことで、ルームごとに独立した効果を適用可能にする
     */
    private initSocketLogic;
    start(): void;
}
//# sourceMappingURL=server.d.ts.map