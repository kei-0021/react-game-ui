import { RoomState } from '@/types/server.js';

export function updateState(oldState: RoomState, newState: RoomState): void {
  // players を退避
  const currentPlayers = oldState.players || [];

  // oldState のプロパティを一度すべて削除して、newState の内容をコピーする
  // これにより、参照（oldState）を維持したまま中身を完全に最新にする
  Object.keys(oldState).forEach((key) => {
    delete (oldState as any)[key];
  });

  Object.assign(oldState, newState);

  // 退避していた players を戻す
  oldState.players = currentPlayers;
}
