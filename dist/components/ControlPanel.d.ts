import { GameMeta } from '@/types/socketData.js';
import type { Socket } from 'socket.io-client';
/**
 * ゲームの設定管理およびリアルタイム更新を行う。
 * 新規ゲームの作成、既存ゲームのパラメータ（プレイヤー数、初期手札、トークン）、
 * およびゲーム内コンポーネント（ダイスやボード等）の動的な追加・削除を管理する。
 * @param {Object} props - コンポーネントのプロパティ
 * @param {Socket} props.socket - サーバー通信用の Socket.io クライアントインスタンス
 * @param {GameMeta[]} props.gameMeta - サーバーから取得した全ゲームのメタデータ配列
 * @param {boolean} props.isOpen - パネルの開閉状態
 * @param {function} props.onToggle - パネルの開閉状態を切り替えるコールバック関数
 */
export declare const ControlPanel: ({ socket, gameMeta, isOpen, onToggle, }: {
    socket: Socket;
    gameMeta: GameMeta[];
    isOpen: boolean;
    onToggle: () => void;
}) => import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ControlPanel.d.ts.map