import { RoomParam } from '@/types/server.js';
import { Token } from '@/types/token.js';
import express from 'express';
import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
/**
 * サーバー設定の型定義
 */
export interface GameServerOptions {
    port?: number;
    libDistPath?: string;
    clientDistPath?: string;
    corsOrigins?: string[];
    gamePresets?: Record<string, RoomParam>;
    checkGameEnd?: ((gameState: any) => boolean) | null;
    onGameEnd?: ((results: any) => void) | null;
    initialDecks?: any[];
    initialTokenStores?: Record<string, any>;
    initialHand?: Record<string, any>;
    initialTokens?: Record<string, Token[]>;
    initialResources?: any[];
    initialBoard?: any[][];
    cellEffects?: Record<string, any>;
    customEvents?: any;
    initialLogCategories?: Record<string, boolean> | null;
    onServerStart?: (url: string) => void;
}
export declare class GameServer {
    private port;
    private libDistPath;
    private clientDistPath;
    private corsOrigins;
    private onServerStart?;
    private gamePresets;
    private checkGameEnd;
    private onGameEnd;
    private initialResources;
    private initialBoard;
    private cellEffects;
    private customEvents;
    private initialLogCategories;
    app: express.Application;
    httpServer: HttpServer;
    io: SocketIOServer;
    constructor(options?: GameServerOptions);
    private setupStaticRoutes;
    /**
     * ゲームロジックの初期化
     * 各プリセット情報をそのまま渡すことで、ルームごとに独立した効果を適用可能にする
     */
    private initSocketLogic;
    start(): void;
}
//# sourceMappingURL=server.d.ts.map