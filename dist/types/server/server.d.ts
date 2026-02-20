import express from "express";
import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
/**
 * サーバー設定の型定義
 */
export interface GameServerOptions {
    port?: number;
    libDistPath?: string;
    clientDistPath?: string;
    corsOrigins?: string[];
    gamePresets?: Record<string, any>;
    checkGameEnd?: ((gameState: any) => boolean) | null;
    onGameEnd?: ((results: any) => void) | null;
    initialDecks?: any[];
    cardEffects?: Record<string, any>;
    initialTokenStore?: Record<string, any>;
    initialHand?: Record<string, any>;
    initialTokens?: Record<string, any>;
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
    private initialDecks;
    private cardEffects;
    private initialTokenStore;
    private initialHand;
    private initialTokens;
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
    private initSocketLogic;
    start(): void;
}
//# sourceMappingURL=server.d.ts.map