interface QueueEntry {
  userId: string;
  username: string;
  elo: number;
  joinedAt: number;
  matchedRoom?: string;
}

const queue = new Map<string, QueueEntry>();
const matched = new Map<string, QueueEntry>();

const ELO_BASE_RANGE = 50;
const ELO_EXPAND_RATE = 25;
const ELO_EXPAND_INTERVAL_MS = 5000;

export function joinQueue(userId: string, username: string, elo: number): QueueEntry {
  const entry: QueueEntry = { userId, username, elo, joinedAt: Date.now() };
  queue.set(userId, entry);
  tryMatch(userId);
  return entry;
}

export function leaveQueue(userId: string): boolean {
  return queue.delete(userId);
}

export function getQueueStatus(userId: string): { inQueue: boolean; waitTime: number; matchedRoom?: string } | null {
  const entry = queue.get(userId);
  if (entry) {
    return { inQueue: true, waitTime: Date.now() - entry.joinedAt, matchedRoom: entry.matchedRoom };
  }
  const matchedEntry = matched.get(userId);
  if (matchedEntry) {
    return { inQueue: false, waitTime: 0, matchedRoom: matchedEntry.matchedRoom };
  }
  return null;
}

export function clearMatch(userId: string): void {
  matched.delete(userId);
}

/** Reset queue state — for tests only. */
export function __resetQueue(): void {
  queue.clear();
  matched.clear();
}

function getEloRange(entry: QueueEntry): number {
  const elapsed = Date.now() - entry.joinedAt;
  return ELO_BASE_RANGE + Math.floor(elapsed / ELO_EXPAND_INTERVAL_MS) * ELO_EXPAND_RATE;
}

function tryMatch(newUserId: string) {
  const newEntry = queue.get(newUserId);
  if (!newEntry) return;

  const eloRange = getEloRange(newEntry);

  for (const [otherId, other] of queue) {
    if (otherId === newUserId) continue;
    if (Math.abs(other.elo - newEntry.elo) <= eloRange) {
      // Match found — assign room ID synchronously, then async create room
      const roomId = `match_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      newEntry.matchedRoom = roomId;
      other.matchedRoom = roomId;
      matched.set(newUserId, newEntry);
      matched.set(otherId, other);
      queue.delete(newUserId);
      queue.delete(otherId);

      // Async: actually create the Colyseus room (best effort)
      createMatchRoom(newEntry, other, roomId).catch(() => {});
      return;
    }
  }
}

async function createMatchRoom(p1: QueueEntry, p2: QueueEntry, roomId: string) {
  try {
    const { matchMaker } = await import('colyseus');
    const room = await matchMaker.createRoom('country_of_towers', {
      roomId,
      p1: { userId: p1.userId, username: p1.username, elo: p1.elo },
      p2: { userId: p2.userId, username: p2.username, elo: p2.elo },
    });
    // Update with actual room ID if different
    if (room.roomId !== roomId) {
      p1.matchedRoom = room.roomId;
      p2.matchedRoom = room.roomId;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to create match room:', err);
  }
}

// Periodic re-check for matches (expanding ELO range over time)
const matchmakingInterval = setInterval(() => {
  for (const [userId] of queue) {
    tryMatch(userId);
  }
}, ELO_EXPAND_INTERVAL_MS);

// Allow tests to clean up the interval
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
  matchmakingInterval.unref();
}
