import { GameRoomState, PlayerState } from '../rooms/schema/GameState';
import cards from '../data/cards.json';

export interface CardEffect {
  type: string;
  value?: number;
  resource?: string;
  building?: string;
  allPlayers?: boolean;
  then?: CardEffect[];
  else?: CardEffect[];
  thenAdd?: number;
  thenAddBuilding?: number;
  elseValue?: number;
  effects?: CardEffect[];
}

export function resolveCard(cardId: string, state: GameRoomState, playerId: string): { state: GameRoomState; winner: string | null } {
  const card = (cards as Record<string, any>)[cardId];
  if (!card) return { state, winner: null };

  const player = state.players.get(playerId);
  if (!player) return { state, winner: null };

  // Resolve each effect in order
  for (const effect of card.effects) {
    applyEffect(effect, state, playerId, cardId);
  }

  return { state, winner: checkWin(state) };
}

function applyEffect(effect: CardEffect, state: GameRoomState, playerId: string, cardId: string) {
  const p = state.players.get(playerId)!;
  const opponent = getOpponent(state, playerId);

  switch (effect.type) {
    case 'ADD_ORE': p.ore += effect.value || 0; break;
    case 'ADD_MANA': p.mana += effect.value || 0; break;
    case 'ADD_TROOPS': p.troops += effect.value || 0; break;
    case 'LOSE_ORE': {
      const target = getLoseTarget(effect, cardId, p, opponent);
      if (effect.allPlayers) state.players.forEach(pl => pl.ore = Math.max(0, pl.ore - (effect.value || 0)));
      else target.ore = Math.max(0, target.ore - (effect.value || 0));
      break;
    }
    case 'LOSE_MANA': {
      const target = getLoseTarget(effect, cardId, p, opponent);
      if (effect.allPlayers) state.players.forEach(pl => pl.mana = Math.max(0, pl.mana - (effect.value || 0)));
      else target.mana = Math.max(0, target.mana - (effect.value || 0));
      break;
    }
    case 'LOSE_TROOPS': {
      const target = getLoseTarget(effect, cardId, p, opponent);
      if (effect.allPlayers) state.players.forEach(pl => pl.troops = Math.max(0, pl.troops - (effect.value || 0)));
      else target.troops = Math.max(0, target.troops - (effect.value || 0));
      break;
    }
    case 'ADD_WALL': p.wall += effect.value || 0; break;
    case 'ADD_TOWER': p.tower += effect.value || 0; break;
    case 'DAMAGE': {
      const dmg = effect.value || 0;
      if (opponent.wall >= dmg) {
        opponent.wall -= dmg;
      } else {
        const overflow = dmg - opponent.wall;
        opponent.wall = 0;
        opponent.tower -= overflow;
      }
      break;
    }
    case 'DAMAGE_TOWER': opponent.tower -= effect.value || 0; break;
    case 'DAMAGE_TOWER_SELF': p.tower -= effect.value || 0; break;
    case 'TOWER_MINUS_SELF': p.tower -= effect.value || 0; break;
    case 'ENEMY_TOWER_MINUS': opponent.tower += effect.value || 0; break;
    case 'ADD_MINE': p.mine += effect.value || 0; break;
    case 'ADD_MONASTERY': p.monastery += effect.value || 0; break;
    case 'ADD_BARRACKS': p.barracks += effect.value || 0; break;
    case 'LOSE_MINE': {
      const target = getLoseTarget(effect, cardId, p, opponent);
      if (effect.allPlayers) state.players.forEach(pl => pl.mine = Math.max(1, pl.mine - (effect.value || 0)));
      else target.mine = Math.max(1, target.mine - (effect.value || 0));
      break;
    }
    case 'LOSE_MONASTERY': {
      const target = getLoseTarget(effect, cardId, p, opponent);
      if (effect.allPlayers) state.players.forEach(pl => pl.monastery = Math.max(1, pl.monastery - (effect.value || 0)));
      else target.monastery = Math.max(1, target.monastery - (effect.value || 0));
      break;
    }
    case 'LOSE_BARRACKS': {
      const target = getLoseTarget(effect, cardId, p, opponent);
      if (effect.allPlayers) state.players.forEach(pl => pl.barracks = Math.max(1, pl.barracks - (effect.value || 0)));
      else target.barracks = Math.max(1, target.barracks - (effect.value || 0));
      break;
    }
    case 'ALL_BUILDINGS_PLUS_ONE':
      state.players.forEach(pl => { pl.mine += 1; pl.monastery += 1; pl.barracks += 1; });
      break;
    case 'ALL_WALLS_MINUS':
      state.players.forEach(pl => pl.wall = Math.max(0, pl.wall - (effect.value || 0)));
      break;
    case 'ALL_TOWERS_MINUS':
      // Subtracting a negative value adds to towers (Rainbow card uses value: -1)
      state.players.forEach(pl => pl.tower -= effect.value || 0);
      break;
    case 'SWAP_WALLS': {
      const tmp = p.wall;
      p.wall = opponent.wall;
      opponent.wall = tmp;
      break;
    }
    case 'SET_MINE_TO_OPPONENT':
      if (p.mine < opponent.mine) p.mine = opponent.mine;
      break;
    case 'ALL_MONASTERIES_EQUALIZE': {
      const highest = Math.max(p.monastery, opponent.monastery);
      p.monastery = highest;
      opponent.monastery = highest;
      break;
    }
    case 'DRAW_DISCARD': // handled in GameRoom
    case 'PLAY_AGAIN': // handled in GameRoom
      break;

    // Conditional effects — Phase 2
    case 'IF_MINE_LT_OPPONENT':
      if (p.mine < opponent.mine) {
        p.mine += effect.thenAdd || 2;
      } else {
        p.mine += 1;
      }
      break;
    case 'IF_BARRACKS_LT_OPPONENT':
      if (p.barracks < opponent.barracks) {
        p.barracks += effect.thenAddBuilding || 1;
      }
      break;
    case 'IF_TOWER_LT_OPPONENT':
      if (p.tower < opponent.tower) {
        p.tower += effect.value || 2;
      } else {
        p.tower += effect.elseValue || 1;
      }
      break;
    case 'IF_WALL_ZERO':
      if (p.wall === 0) {
        for (const sub of effect.then || []) applyEffect(sub, state, playerId, cardId);
      } else {
        for (const sub of effect.else || []) applyEffect(sub, state, playerId, cardId);
      }
      break;
    case 'DAMAGE_IF_WALL_ZERO':
      if (opponent.wall === 0) {
        opponent.tower -= effect.value || 10;
      } else {
        opponent.tower -= effect.elseValue || 6;
      }
      break;
    case 'DAMAGE_IF_MONASTERY_GT':
      if (p.monastery > opponent.monastery) {
        opponent.tower -= effect.value || 12;
      } else {
        opponent.tower -= effect.elseValue || 8;
      }
      break;
    case 'DAMAGE_IF_WALL_GT':
      if (opponent.wall > 10) {
        opponent.tower -= effect.value || 10;
      } else {
        opponent.tower -= effect.elseValue || 7;
      }
      break;
    case 'DAMAGE_IF_WALL_GT_OPPONENT':
      if (p.wall > opponent.wall) {
        opponent.tower -= effect.value || 3;
      } else {
        opponent.tower -= effect.elseValue || 2;
      }
      break;
    case 'TOWER_DAMAGE_IF_GT_WALL':
      if (p.tower > opponent.wall) {
        opponent.tower -= effect.value || 8;
      } else {
        state.players.forEach(pl => pl.tower -= effect.elseValue || 8);
      }
      break;
    case 'MULTI':
      if (effect.effects) {
        for (const sub of effect.effects) {
          applyEffect(sub, state, playerId, cardId);
        }
      }
      break;
    default:
      // NO-OP for unknown effects
      break;
  }
}

/** Cards where LOSE_* effects target the player who played them instead of the opponent. */
const SELF_LOSE_CARDS: Record<string, string[]> = {
  goblins: ['LOSE_MANA'],
  help_in_work: ['LOSE_TROOPS'],
  warrior: ['LOSE_MANA'],
  slave_labor: ['LOSE_TROOPS'],
  mine_collapse: ['LOSE_MINE'],
};

function getLoseTarget(effect: CardEffect, cardId: string, p: PlayerState, opponent: PlayerState): PlayerState {
  if (SELF_LOSE_CARDS[cardId]?.includes(effect.type)) return p;
  return opponent;
}

function getOpponent(state: GameRoomState, playerId: string) {
  for (const [id, p] of state.players) {
    if (id !== playerId) return p;
  }
  return state.players.get(playerId)!;
}

function getOpponentId(state: GameRoomState, playerId: string): string {
  for (const id of state.players.keys()) {
    if (id !== playerId) return id;
  }
  return playerId;
}

function checkWin(state: GameRoomState): string | null {
  for (const [id, p] of state.players) {
    const opponentId = getOpponentId(state, id);
    if (p.tower <= 0) return opponentId;
    if (p.tower >= 100) return id;
    if (p.ore >= 150 && p.mana >= 150 && p.troops >= 150) return id;
  }
  return null;
}
