import { GameRoomState } from '../rooms/schema/GameState';

export function checkWin(state: GameRoomState): string | null {
  for (const [id, p] of state.players) {
    const opponentId = getOpponentId(state, id);
    if (p.tower <= 0) return opponentId;
    if (p.tower >= 100) return id;
    if (p.ore >= 150 && p.mana >= 150 && p.troops >= 150) return id;
  }
  return null;
}

function getOpponentId(state: GameRoomState, playerId: string): string {
  for (const id of state.players.keys()) {
    if (id !== playerId) return id;
  }
  return playerId;
}
