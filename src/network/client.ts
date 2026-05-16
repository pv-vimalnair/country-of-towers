import { Client } from "colyseus.js";

const DEFAULT_ENDPOINT = process.env.COLYSEUS_ENDPOINT || "ws://localhost:2567";

export const client = new Client(DEFAULT_ENDPOINT);

// Allow runtime endpoint switching for dev/testing
export function setEndpoint(url: string) {
  (client as any).endpoint = url;
}
