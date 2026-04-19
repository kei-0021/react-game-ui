import { GameId } from '@/types/definition.js';
import { GameParam } from '@/types/gameParam.js';
import { GameServer, GameServerOptions } from './server.js';
export declare class LiveGameServer {
    core: GameServer;
    constructor(options: GameServerOptions);
    private setupLiveListers;
    start(): void;
    /**
     * 指定したGameIdのパラメータを安全に更新し通知する
     */
    updateGameParam(gameId: GameId, param: GameParam): void;
}
//# sourceMappingURL=live-server.d.ts.map