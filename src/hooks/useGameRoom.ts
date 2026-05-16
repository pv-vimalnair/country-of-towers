import { useEffect, useState, useRef, useCallback } from "react";
import { Room } from "colyseus.js";
import { client } from "../network/client";

type RoomStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";

interface UseGameRoomOptions {
  roomId?: string; // If provided, join specific room; otherwise auto-queue
  username?: string;
  token?: string;
}

export function useGameRoom(options: UseGameRoomOptions = {}) {
  const [room, setRoom] = useState<Room | null>(null);
  const [status, setStatus] = useState<RoomStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const roomRef = useRef<Room | null>(null);

  // Connect to a specific match room
  const connect = useCallback(async (roomId: string, username: string, token?: string) => {
    try {
      setStatus("connecting");
      setError(null);
      const r = await client.joinById(roomId, { username, token });
      roomRef.current = r;
      setRoom(r);
      setStatus("connected");
      return r;
    } catch (e: any) {
      setStatus("error");
      setError(e.message || "Failed to join room");
      return null;
    }
  }, []);

  // Join the matchmaking queue and get assigned a room
  const joinQueue = useCallback(async (username: string, token?: string) => {
    try {
      setStatus("connecting");
      setError(null);
      // First join or create via matchmaking
      const r = await client.joinOrCreate("country_of_towers", { username, token });
      roomRef.current = r;
      setRoom(r);
      setStatus("connected");
      return r;
    } catch (e: any) {
      setStatus("error");
      setError(e.message || "Matchmaking failed");
      return null;
    }
  }, []);

  // Leave current room
  const leave = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.leave();
      roomRef.current = null;
      setRoom(null);
      setStatus("idle");
    }
  }, []);

  const playCard = (cardIndex: number) =>
    roomRef.current?.send("playCard", { cardIndex });
  const discardCard = (cardIndex: number) =>
    roomRef.current?.send("discard", { cardIndex });

  // Handle disconnection
  useEffect(() => {
    const r = roomRef.current;
    if (!r) return;

    const onLeave = () => {
      setStatus("disconnected");
      setRoom(null);
    };

    r.onLeave.once(onLeave);
    return () => {
      r.onLeave.remove(onLeave);
    };
  }, [room]);

  return { room, status, error, connect, joinQueue, leave, playCard, discardCard };
}
