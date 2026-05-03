// GameState — Colyseus Schema for Country of Towers
import { Schema, type, MapSchema } from "@colyseus/schema";

export class PlayerState extends Schema {
  @type("number") tower: number = 50;
  @type("number") wall: number = 10;
  @type("number") ore: number = 0;
  @type("number") mana: number = 0;
  @type("number") troops: number = 0;
  @type("number") mine: number = 1;
  @type("number") monastery: number = 1;
  @type("number") barracks: number = 1;
  @type(["string"]) hand: string[] = [];
  @type("boolean") disconnected: boolean = false;
  @type("string") username: string = "";
  @type("number") elo: number = 1000;
}

export class GameRoomState extends Schema {
  @type("number") turnNumber: number = 0;
  @type("string") currentPlayerId: string = "";
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type("number") turnStartTime: number = 0;
  @type("number") phase: number = 0;  // 0=collect, 1=play/discard, 2=draw
  @type(["string"]) deck: string[] = [];
  @type("string") winnerId: string = "";
}
