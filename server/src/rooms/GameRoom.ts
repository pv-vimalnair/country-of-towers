import { Room, Client } from "colyseus";
import { GameRoomState, PlayerState } from "./schema/GameState";
import cards from "../data/cards.json";
import { resolveCard } from "../engine/resolve";
import { checkWin } from "../engine/winCheck";
import crypto from "crypto";

const TURN_TIME_LIMIT_MS = 30 * 1000;

interface PlayCardMessage {
  cardIndex: number;
}

interface DiscardMessage {
  cardIndex: number;
}

export class GameRoom extends Room<{ state: GameRoomState }> {
  maxClients = 2;

  onCreate(_options: any) {
    this.setState(new GameRoomState());

    this.onMessage("playCard", (client: Client, message: PlayCardMessage) => {
      this.handlePlayCard(client, message.cardIndex);
    });

    this.onMessage("discard", (client: Client, message: DiscardMessage) => {
      this.handleDiscard(client, message.cardIndex);
    });

    this.clock.setInterval(() => {
      this.checkTurnTimer();
    }, 1000);
  }

  onJoin(client: Client, options: any) {
    const player = new PlayerState();
    player.username = options.username || `Player ${this.clients.length}`;
    this.state.players.set(client.sessionId, player);

    if (this.state.players.size === 2) {
      const deck = Object.keys(cards);
      this.shuffle(deck);
      this.state.deck.push(...deck);

      this.state.players.forEach((p: PlayerState) => {
        for (let i = 0; i < 6; i++) {
          this.drawCard(p);
        }
      });

      const playerIds = Array.from(this.state.players.keys());
      this.state.currentPlayerId = playerIds[0];
      this.state.turnStartTime = Date.now();
      this.state.turnNumber = 1;
      this.state.phase = 0;

      // Collect resources for first player
      const firstPlayer = this.state.players.get(playerIds[0]);
      if (firstPlayer) this.collectResources(firstPlayer);
    }
  }

  onLeave(client: Client, code?: number) {
    const player = this.state.players.get(client.sessionId);
    if (player) {
      player.disconnected = true;
      this.broadcast("player_disconnected", { sessionId: client.sessionId });
    }
    if (code === 1000 || code === 1001) return; // Player left on purpose

    // Allow 60 seconds to reconnect
    this.allowReconnection(client, 60)
      .then(() => {
        if (player) {
          player.disconnected = false;
          this.broadcast("player_reconnected", { sessionId: client.sessionId });
        }
      })
      .catch(() => {
        // Reconnection failed — forfeit
        const opponent = [...this.state.players.keys()].find((id) => id !== client.sessionId);
        if (opponent) {
          this.state.winnerId = opponent;

          // Calculate ELO for forfeit
          const playerIds = Array.from(this.state.players.keys());
          const p1 = this.state.players.get(playerIds[0]);
          const p2 = this.state.players.get(playerIds[1]);
          const p1Score = opponent === playerIds[0] ? 1 : 0;
          const expected1 = 1 / (1 + Math.pow(10, ((p2?.elo || 1000) - (p1?.elo || 1000)) / 400));
          const K = 32;
          if (p1) p1.elo = Math.round(p1.elo + K * (p1Score - expected1));
          if (p2) p2.elo = Math.round(p2.elo + K * ((1 - p1Score) - (1 - expected1)));

          this.broadcast("game_over", {
            winner: opponent,
            reason: "opponent_disconnected",
            eloChanges: {
              [playerIds[0]]: p1?.elo,
              [playerIds[1]]: p2?.elo,
            },
          });
          this.lock();
        }
      });
  }

  private handlePlayCard(client: Client, cardIndex: number) {
    if (client.sessionId !== this.state.currentPlayerId) {
      client.error(4001, "Not your turn");
      return;
    }

    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    if (cardIndex < 0 || cardIndex >= player.hand.length) {
      client.error(4002, "Invalid card index");
      return;
    }

    const cardId = player.hand[cardIndex];
    const card = (cards as Record<string, any>)[cardId];
    if (!card) {
      client.error(4003, "Unknown card");
      return;
    }

    // Validate cost
    const cost = card.cost || {};
    for (const [resource, amount] of Object.entries(cost)) {
      if ((player as any)[resource] < (amount as number)) {
        client.error(4004, `Not enough ${resource}`);
        return;
      }
    }

    // Deduct resources
    for (const [resource, amount] of Object.entries(cost)) {
      (player as any)[resource] -= amount as number;
    }

    // Remove card from hand
    player.hand.splice(cardIndex, 1);

    // Resolve card effects
    resolveCard(cardId, this.state, client.sessionId);

    // Check for winner
    const winner = checkWin(this.state);
    if (winner) {
      this.state.winnerId = winner;

      // Calculate new ELOs
      const playerIds = Array.from(this.state.players.keys());
      const p1 = this.state.players.get(playerIds[0]);
      const p2 = this.state.players.get(playerIds[1]);
      const p1Score = winner === playerIds[0] ? 1 : 0;
      const expected1 = 1 / (1 + Math.pow(10, ((p2?.elo || 1000) - (p1?.elo || 1000)) / 400));
      const K = 32;
      if (p1) p1.elo = Math.round(p1.elo + K * (p1Score - expected1));
      if (p2) p2.elo = Math.round(p2.elo + K * ((1 - p1Score) - (1 - expected1)));

      this.broadcast("game_over", {
        winner,
        eloChanges: {
          [playerIds[0]]: p1?.elo,
          [playerIds[1]]: p2?.elo,
        },
      });
      this.lock();
      return;
    }

    // Check for PLAY_AGAIN effect
    const hasPlayAgain = card.effects?.some((e: any) => e.type === "PLAY_AGAIN");
    if (hasPlayAgain) {
      this.state.phase = 1;
      // Do not draw or advance turn
      return;
    }

    // Normal turn end: draw 1 and advance
    this.drawCard(player);
    this.advanceTurn();
  }

  private handleDiscard(client: Client, cardIndex: number) {
    if (client.sessionId !== this.state.currentPlayerId) {
      client.error(4001, "Not your turn");
      return;
    }

    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    if (cardIndex < 0 || cardIndex >= player.hand.length) {
      client.error(4002, "Invalid card index");
      return;
    }

    player.hand.splice(cardIndex, 1);
    this.drawCard(player);

    // Check for winner after discard (unlikely but possible via deck-out or similar)
    const winner = checkWin(this.state);
    if (winner) {
      this.state.winnerId = winner;

      // Calculate new ELOs
      const playerIds = Array.from(this.state.players.keys());
      const p1 = this.state.players.get(playerIds[0]);
      const p2 = this.state.players.get(playerIds[1]);
      const p1Score = winner === playerIds[0] ? 1 : 0;
      const expected1 = 1 / (1 + Math.pow(10, ((p2?.elo || 1000) - (p1?.elo || 1000)) / 400));
      const K = 32;
      if (p1) p1.elo = Math.round(p1.elo + K * (p1Score - expected1));
      if (p2) p2.elo = Math.round(p2.elo + K * ((1 - p1Score) - (1 - expected1)));

      this.broadcast("game_over", {
        winner,
        eloChanges: {
          [playerIds[0]]: p1?.elo,
          [playerIds[1]]: p2?.elo,
        },
      });
      this.lock();
      return;
    }

    this.advanceTurn();
  }

  private checkTurnTimer() {
    if (!this.state.currentPlayerId || this.state.winnerId) return;

    const elapsed = Date.now() - this.state.turnStartTime;
    if (elapsed >= TURN_TIME_LIMIT_MS) {
      const player = this.state.players.get(this.state.currentPlayerId);
      if (player && player.hand.length > 0) {
        const randomIndex = Math.floor(Math.random() * player.hand.length);
        player.hand.splice(randomIndex, 1);
        this.drawCard(player);
      }
      this.advanceTurn();
    }
  }

  private advanceTurn() {
    const playerIds = Array.from(this.state.players.keys());
    if (playerIds.length !== 2) return;

    const currentIndex = playerIds.indexOf(this.state.currentPlayerId);
    const nextIndex = currentIndex === 0 ? 1 : 0;
    this.state.currentPlayerId = playerIds[nextIndex];
    this.state.turnStartTime = Date.now();
    this.state.phase = 0;
    this.state.turnNumber += 1;

    const nextPlayer = this.state.players.get(playerIds[nextIndex]);
    if (nextPlayer) {
      this.collectResources(nextPlayer);
    }
  }

  private collectResources(player: PlayerState) {
    player.ore += player.mine;
    player.mana += player.monastery;
    player.troops += player.barracks;
  }

  private drawCard(player: PlayerState) {
    if (this.state.deck.length === 0) return;
    const cardId = this.state.deck.pop();
    if (cardId !== undefined) {
      player.hand.push(cardId);
    }
  }

  private shuffle(deck: string[]) {
    for (let i = deck.length - 1; i > 0; i--) {
      const buf = crypto.randomBytes(4);
      const rand = buf.readUInt32BE(0);
      const j = rand % (i + 1);
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }
}
