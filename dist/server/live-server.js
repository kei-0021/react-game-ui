import { registerLiveListeners } from './listener/live-listener.js';
import { server_log } from './log/logger.js';
import { createState } from './logic/create-state.js';
import { syncState } from './logic/sync-state.js';
import { updateState } from './logic/update-state.js';
import { RoomManager } from './room-manager.js';
import { GameServer } from './server.js';
export class LiveGameServer {
    core;
    constructor(options) {
        // 基盤となる Core をインスタンス化
        this.core = new GameServer(options);
        // Core の通信路（io）に Live 用の窓口を増設する
        this.setupLiveListers();
    }
    setupLiveListers() {
        this.core.io.on('connection', (socket) => {
            // 編集・検証用のリスナーを差し込む
            registerLiveListeners(socket, this.core.gameParams);
        });
    }
    // Core の起動メソッドを委譲
    start() {
        this.core.start();
    }
    /**
     * 指定したGameIdのパラメータを安全に更新し通知する
     */
    updateGameParam(gameId, param) {
        if (!this.core.gameParams[gameId]) {
            console.warn(`[Server] 未登録のGameIdです: ${gameId}`);
        }
        // 削除時は param が undefined で渡ってくる
        if (param === undefined) {
            delete this.core.gameParams[gameId];
            server_log('game', gameId, null, `Removed: ${gameId}`);
            return;
        }
        // GameParam・RoomStateの更新
        this.core.gameParams[gameId] = param;
        this.core.getActiveRooms().forEach((state, roomId) => {
            if (state.gameId === gameId) {
                const newState = createState(roomId, { ...param, gameId });
                updateState(state, newState);
                // プレイヤーがいない場合は、同期する必要がないためスキップ
                if (!state.players || state.players.length === 0) {
                    return;
                }
                // プレイヤーがいる場合のみ同期を実行
                const roomManager = new RoomManager(this.core.io, param, state);
                this.core.io.emit('game:component', {
                    state: newState,
                    components: param.components,
                });
                // コンポーネントの同期が終わってからStateを更新する
                syncState(state, roomManager, this.core.io);
            }
        });
        // クライアントにゲーム一覧を送信
        const gameList = Object.keys(this.core.gameParams).map((id) => ({
            gameId: id,
            gameIcon: this.core.gameParams[id].gameIcon,
            maxPlayers: this.core.gameParams[id].maxPlayers,
            initialHand: this.core.gameParams[id].initialHand,
            initialDecks: this.core.gameParams[id].initialDecks,
            initialTokens: this.core.gameParams[id].initialTokens,
            draggables: this.core.gameParams[id].draggables,
            components: this.core.gameParams[id].components,
        }));
        this.core.io.emit('lobby:game-list', {
            games: gameList,
        });
    }
}
