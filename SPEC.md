# Country of Towers — SPEC.md

## Architecture Overview

**Client:** Expo 54 + React Native 0.81 + TypeScript + colyseus.js + react-native-reanimated + expo-av
**Server:** Colyseus 0.17 + Express 5 + @colyseus/schema + Jest

## Key Data Structures (DO NOT MODIFY)

### Card Schema (cards.json)
- `id`, `name`, `color` (red|blue|green), `cost` {ore?, mana?, troops?}
- `effects: Effect[]` — effect.type names MUST NOT change
- `description`, `flavor`

### GameRoomState (server/src/rooms/schema/GameState.ts)
- `turnNumber`, `currentPlayerId`, `players: MapSchema<PlayerState>`, `turnStartTime`, `phase`, `deck`, `winnerId`

### PlayerState
- `tower` (50 start), `wall` (10), `ore/mana/troops` (0), `mine/monastery/barracks` (1), `hand: string[]`, `disconnected`, `username`, `elo` (1000)

### Effect Types (DO NOT RENAME — can ADD new ones)
ADD_ORE, ADD_MANA, ADD_TROOPS, LOSE_ORE, LOSE_TROOPS, ADD_MINE, ADD_MONASTERY, ADD_BARRACKS, LOSE_MINE, LOSE_MONASTERY, LOSE_BARRACKS, SET_MINE_TO_OPPONENT, ALL_MONASTERIES_EQUALIZE, ALL_BUILDINGS_PLUS_ONE, ADD_WALL, ADD_TOWER, ALL_WALLS_MINUS, ALL_TOWERS_MINUS, SWAP_WALLS, ENEMY_TOWER_MINUS, TOWER_MINUS_SELF, DAMAGE, DAMAGE_TOWER, DAMAGE_TOWER_SELF, TOWER_DAMAGE_IF_GT_WALL, DAMAGE_IF_WALL_ZERO, DAMAGE_IF_MONASTERY_GT, DAMAGE_IF_WALL_GT, DAMAGE_IF_WALL_GT_OPPONENT, IF_MINE_LT_OPPONENT, IF_BARRACKS_LT_OPPONENT, IF_TOWER_LT_OPPONENT, IF_WALL_ZERO, PLAY_AGAIN, DRAW_DISCARD, MULTI

### Win Conditions
1. Opponent tower ≤ 0 → you win
2. Your tower ≥ 100 → you win
3. All 3 resources ≥ 150 → you win

### ELO Formula
K=32, expected = 1/(1+10^((oppElo - yourElo)/400)), newElo = round(old + K * (score - expected))

## File Inventory (baseline — read before modifying)

### Client
- `App.tsx` — Root with screen router (Home, Lobby, GameBoard, MatchEnd)
- `src/screens/HomeScreen.tsx` — Main menu, sample cards, "Play Online" button
- `src/screens/LobbyScreen.tsx` — Username input, searching spinner, auto-nav on 2 players
- `src/screens/GameBoardScreen.tsx` — Full game UI with stats, hand, timer, animations
- `src/screens/MatchEndScreen.tsx` — Victory/defeat with ELO change
- `src/components/Card.tsx` — Reanimated card component with flip/lift, gradient art area
- `src/hooks/useGameRoom.ts` — Auto-joins single "country_of_towers" room globally
- `src/network/client.ts` — Colyseus client pointing to ws://localhost:2567
- `src/utils/sound.ts` — Stub (expo-av import, empty playSound)
- `src/utils/analytics.ts` — Dev console logger
- `src/utils/balance.ts` — In-memory card play tracking
- `src/utils/perf.ts` — Simple timer marks
- `src/styles/theme.ts` — Color tokens
- `src/types/index.ts` — Shared TypeScript types
- `src/data/cards.json` — 99 card definitions

### Server
- `server/src/index.ts` — Express + Colyseus server, health endpoint, monitor
- `server/src/rooms/GameRoom.ts` — Game logic: join, play, discard, timer, ELO, reconnection
- `server/src/rooms/schema/GameState.ts` — Colyseus schema definitions
- `server/src/engine/resolve.ts` — Card effect resolver (99 card effects)
- `server/src/engine/winCheck.ts` — Win condition checker
- `server/src/engine/__tests__/cards.test.ts` — 11 tests for basic + conditional cards
- `server/src/data/cards.json` — Server copy of card data

## Feature Modules

### F1: Account System
**New files:** `server/src/accounts.ts`, `server/src/middleware/auth.ts`, `src/utils/auth.ts`, `src/screens/AuthScreen.tsx`
**Modified:** `server/src/index.ts` (add auth routes), `src/App.tsx` (auth gate), `src/screens/HomeScreen.tsx` (show user info)
- Server: in-memory user store (Map), bcrypt hash, JWT sign/verify, register/login endpoints
- Client: AsyncStorage for JWT token, auth context/hook, login/register form
- Auth gate: if no token, show AuthScreen; otherwise show HomeScreen with user info

### F2: Real Matchmaking
**New files:** `server/src/matchmaking.ts`, `server/src/redis.ts`
**Modified:** `server/src/index.ts` (register matchmaker), `server/src/rooms/GameRoom.ts` (room options), `src/hooks/useGameRoom.ts` (queue flow), `src/screens/LobbyScreen.tsx` (queue UI)
- Redis sorted set for ELO queue: `ZADD matchmaking_queue <elo> <playerId>`
- Match finder: `ZRANGEBYSCORE` ±50 ELO, expanding range over time
- On match: create dedicated GameRoom, both clients join with roomId
- useGameRoom: join queue → wait for match → join specific room

### F3: Card Art
**New files:** `src/components/CardArt.tsx`, `src/data/cardArt.ts`
**Modified:** `src/components/Card.tsx` (add art area)
- 20 high-priority cards get AI-generated placeholder illustrations
- Rest use enhanced color-coded gradients with pattern overlays
- Art area: 62x100% card width, illustration or gradient placeholder

### F4: Sound Effects
**New files:** `assets/sounds/card-play.mp3`, `assets/sounds/damage.mp3`, `assets/sounds/victory.mp3`, `assets/sounds/defeat.mp3`, `assets/sounds/tick.mp3`
**Modified:** `src/utils/sound.ts` (load all sounds), `src/screens/GameBoardScreen.tsx` (trigger sounds)
- Use `expo-av` Audio.Sound.createAsync for preloading
- 5 placeholder sounds generated programmatically (Web Audio API) or placeholder beeps
- Card play: short whoosh, Damage: crunch thud, Victory: ascending chime, Defeat: descending tone, Tick: beep

### F5: Card Collection Screen
**New files:** `src/screens/CollectionScreen.tsx`
**Modified:** `src/App.tsx` (add route), `src/screens/HomeScreen.tsx` (add nav button)
- 102-card grid (3 columns), scrollable
- Grayed out = never played, Colored = played at least once
- Tap opens detail modal: full card + description + stats (times played, win rate)
- Track played cards via balance.ts or AsyncStorage

### F6: Leaderboard
**New files:** `server/src/routes/leaderboard.ts`, `src/screens/LeaderboardScreen.tsx`
**Modified:** `server/src/index.ts` (mount route), `src/App.tsx` (add route), `src/screens/HomeScreen.tsx` (add nav button)
- Server: GET /leaderboard?limit=100 — sorted by ELO desc, include rank, name, ELO, win rate
- In-memory leaderboard from account system
- Client: ranked list with crown icon for #1, player highlight

### F7: Animations Polish
**Modified:** `src/screens/GameBoardScreen.tsx`
- Wall hit: crack flash overlay (white lines on wall stat)
- Tower explosion: particles/burst on tower reaching 0
- Resource glow: green pulse on resource gain (victory condition)
- Turn transition: smoother cross-fade between players

### F8: Error States
**New files:** `src/components/ErrorOverlay.tsx`, `src/components/ReconnectToast.tsx`
**Modified:** `src/screens/GameBoardScreen.tsx`, `src/screens/LobbyScreen.tsx`, `src/hooks/useGameRoom.ts`
- Network lost overlay: semi-transparent dark + "Reconnecting..." spinner
- Server down screen: error icon + "Server unavailable" + retry button
- Queue timeout: auto-retry with exponential backoff
- Connection error toasts: brief bottom-toast with error message

### F9: Multiplayer Testing
**Modified:** `src/hooks/useGameRoom.ts`, `server/src/rooms/GameRoom.ts`, `server/src/index.ts`
- useGameRoom: accept roomId parameter, join specific room instead of global singleton
- GameRoom: onCreate accepts options (matchId), validate 2 players max
- Proper player identification via sessionId throughout

### F10: Test Expansion
**Modified:** `server/src/engine/__tests__/cards.test.ts`
- Expand from 11 to 99+ tests covering every card
- Edge cases: both towers hit 0 simultaneously, deck empties mid-game, PLAY_AGAIN chains, wall absorb vs tower overflow, all conditional branches

## Interface Contracts

### Auth API
```
POST /api/auth/register → { token, user: { id, username, email, elo } }
POST /api/auth/login    → { token, user: { id, username, email, elo } }
GET  /api/auth/me       → { user } (requires Bearer token)
```

### Matchmaking API
```
POST /api/matchmaking/join  → { queuePosition, estimatedWait }
GET  /api/matchmaking/status → { status, match?: { roomId } }
POST /api/matchmaking/cancel → { success }
WS   join specific room by roomId from match response
```

### Leaderboard API
```
GET /api/leaderboard?limit=100 → { players: [{ rank, username, elo, wins, losses, winRate }] }
```

## Build Commands
- Server: `cd server && npm run dev` (:2567)
- Client: `npm start` → Expo QR / web
- Tests: `cd server && npm test`
