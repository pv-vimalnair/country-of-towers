import { useEffect, useState } from "react";
import { Room } from "colyseus.js";
import { client } from "../network/client";

let globalRoom: Room | null = null;
let globalPromise: Promise<Room> | null = null;

export function useGameRoom() {
  const [room, setRoom] = useState<Room | null>(globalRoom);
  const [connected, setConnected] = useState(!!globalRoom);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (globalRoom) {
      setRoom(globalRoom);
      setConnected(true);
      return;
    }
    if (!globalPromise) {
      globalPromise = client.joinOrCreate("country_of_towers");
    }
    globalPromise
      .then((r) => {
        globalRoom = r;
        setRoom(r);
        setConnected(true);
        setError(null);
      })
      .catch((e) => {
        console.error("Connection failed:", e);
        setError("Server unreachable");
      });
  }, []);

  const playCard = (cardIndex: number) =>
    globalRoom?.send("playCard", { cardIndex });
  const discardCard = (cardIndex: number) =>
    globalRoom?.send("discard", { cardIndex });

  return { room, connected, error, playCard, discardCard };
}
