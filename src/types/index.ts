// Country of Towers — Shared Types
// Used by both client and server

export type CardColor = "red" | "blue" | "green";

export interface CardCost {
  ore?: number;
  mana?: number;
  troops?: number;
}

export type EffectType =
  // Resource effects
  | "ADD_ORE" | "ADD_MANA" | "ADD_TROOPS"
  | "LOSE_ORE" | "LOSE_TROOPS"
  // Building effects
  | "ADD_MINE" | "ADD_MONASTERY" | "ADD_BARRACKS"
  | "LOSE_MINE" | "LOSE_MONASTERY" | "LOSE_BARRACKS"
  | "SET_MINE_TO_OPPONENT"
  | "ALL_MONASTERIES_EQUALIZE"
  | "ALL_BUILDINGS_PLUS_ONE"
  // Wall & Tower
  | "ADD_WALL" | "ADD_TOWER"
  | "ALL_WALLS_MINUS" | "ALL_TOWERS_MINUS"
  | "SWAP_WALLS"
  | "ENEMY_TOWER_MINUS" | "TOWER_MINUS_SELF"
  // Damage
  | "DAMAGE" | "DAMAGE_TOWER" | "DAMAGE_TOWER_SELF"
  | "TOWER_DAMAGE_IF_GT_WALL"
  | "DAMAGE_IF_WALL_ZERO" | "DAMAGE_IF_MONASTERY_GT"
  | "DAMAGE_IF_WALL_GT"
  // Conditionals
  | "IF_MINE_LT_OPPONENT" | "IF_BARRACKS_LT_OPPONENT"
  | "IF_TOWER_LT_OPPONENT" | "IF_WALL_ZERO"
  // Special
  | "PLAY_AGAIN" | "DRAW_DISCARD"
  // Combo
  | "MULTI";

export interface Effect {
  type: EffectType;
  value?: number;
  resource?: "ore" | "mana" | "troops";
  building?: "mine" | "monastery" | "barracks";
  thenAdd?: number;
  elseValue?: number;
  allPlayers?: boolean;
  effects?: Effect[];
  then?: Effect[];
  else?: Effect[];
}

export interface Card {
  id: string;
  color: CardColor;
  name: string;
  cost: CardCost;
  effects: Effect[];
  description: string;
}

export type Cards = Record<string, Card>;

// Game state types
export interface PlayerState {
  tower: number;
  wall: number;
  ore: number;
  mana: number;
  troops: number;
  mine: number;
  monastery: number;
  barracks: number;
  hand: string[];
  username: string;
  disconnected: boolean;
}

export interface GameState {
  turnNumber: number;
  currentPlayerId: string;
  players: Record<string, PlayerState>;
  turnStartTime: number;
  phase: number;
  deck: string[];
  winnerId?: string;
}
