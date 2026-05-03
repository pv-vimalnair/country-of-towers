// Country of Towers — Colyseus Game Server
import http from "http";
import express from "express";
import cors from "cors";
import { Server, matchMaker } from "colyseus";
import { monitor } from "@colyseus/monitor";
import { GameRoom } from "./rooms/GameRoom";

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

app.use("/colyseus", monitor());

// Register game rooms
gameServer.define("country_of_towers", GameRoom);

httpServer.listen(PORT, () => {
  console.log(`🏰 Country of Towers Server running on ws://localhost:${PORT}`);
});

export { gameServer };
