// Country of Towers — Colyseus Game Server
import http from "http";
import express from "express";
import cors from "cors";
import { Server, matchMaker } from "colyseus";
import { monitor } from "@colyseus/monitor";
import { GameRoom } from "./rooms/GameRoom";
import { register, login } from "./accounts";
import { authMiddleware } from "./middleware/auth";
import { joinQueue, leaveQueue, getQueueStatus } from "./matchmaking";
import leaderboardRouter from "./routes/leaderboard";

const PORT = Number(process.env.PORT) || 2567;

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);
const gameServer = new Server({
  // @ts-ignore - Colyseus accepts { server } at runtime despite type def
  server: httpServer,
});

app.get("/", (_req, res) => {
  res.json({
    name: "Country of Towers Server",
    status: "running",
    players: matchMaker.stats.local.ccu,
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    rooms: matchMaker.stats.local.ccu,
    memory: process.memoryUsage().heapUsed,
  });
});

// Auth routes
app.post("/api/auth/register", (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing username, email, or password" });
  }
  const result = register(username, email, password);
  if (!result) {
    return res.status(409).json({ error: "Email already registered" });
  }
  res.json({ token: result.token, user: result.user });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }
  const result = login(email, password);
  if (!result) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  res.json({ token: result.token, user: result.user });
});

app.get("/api/auth/me", authMiddleware, (req, res) => {
  res.json({ user: (req as any).user });
});

// Matchmaking routes
app.post("/api/matchmaking/join", authMiddleware, (req, res) => {
  const user = (req as any).user;
  const entry = joinQueue(user.id, user.username, user.elo);
  res.json({
    inQueue: true,
    waitTime: 0,
    matchedRoom: entry.matchedRoom,
  });
});

app.post("/api/matchmaking/leave", authMiddleware, (req, res) => {
  const user = (req as any).user;
  const removed = leaveQueue(user.id);
  res.json({ removed });
});

app.get("/api/matchmaking/status", authMiddleware, (req, res) => {
  const user = (req as any).user;
  const status = getQueueStatus(user.id);
  if (!status) {
    return res.json({ inQueue: false, waitTime: 0 });
  }
  res.json(status);
});

// Leaderboard
app.use("/api", leaderboardRouter);

app.use("/colyseus", monitor());

// Register game rooms
gameServer.define("country_of_towers", GameRoom);

httpServer.listen(PORT, () => {
  console.log(`🏰 Country of Towers Server running on ws://localhost:${PORT}`);
});

export { gameServer };
