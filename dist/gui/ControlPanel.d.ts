import { GameParam } from '@/index.js';
import type { Socket } from 'socket.io-client';
/**
 * ゲームの設定管理およびリアルタイム更新を行う。
 * 新規ゲームの作成、既存ゲームのパラメータ（プレイヤー数、初期手札、トークン）、
 * およびゲーム内コンポーネント（ダイスやボード等）の動的な追加・削除を管理する。
 * @param {Socket} props.socket - サーバー通信用の Socket.io クライアントインスタンス
 * @param {GameParam[]} props.GameParam - サーバーから取得した全ゲーム情報の配列
 * @param {containerRef}
 * @param {boolean} props.isOpen - パネルの開閉状態
 * @param {function} props.onToggle - パネルの開閉状態を切り替えるコールバック関数
 */
export declare const ControlPanel: ({ socket, GameParam, containerRef, isOpen, onToggle, }: {
    socket: Socket;
    GameParam: GameParam[];
    containerRef: React.RefObject<HTMLElement | null>;
    isOpen: boolean;
    onToggle: () => void;
}) => import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ControlPanel.d.ts.map