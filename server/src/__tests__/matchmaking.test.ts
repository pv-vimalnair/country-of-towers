import {
  joinQueue,
  leaveQueue,
  getQueueStatus,
  __resetQueue,
} from '../matchmaking';

jest.mock('colyseus', () => ({
  matchMaker: {
    createRoom: jest.fn().mockResolvedValue({ roomId: 'test_room_123' }),
  },
}));

describe('Matchmaking queue', () => {
  beforeEach(() => {
    __resetQueue();
  });

  test('joinQueue: adds player to queue', () => {
    const entry = joinQueue('u_1', 'Alice', 1000);
    expect(entry.userId).toBe('u_1');
    expect(entry.username).toBe('Alice');
    expect(entry.elo).toBe(1000);
    expect(entry.joinedAt).toBeLessThanOrEqual(Date.now());
  });

  test('getQueueStatus: returns in-queue status', () => {
    joinQueue('u_2', 'Bob', 1050);
    const status = getQueueStatus('u_2');
    expect(status).not.toBeNull();
    expect(status!.inQueue).toBe(true);
    expect(status!.waitTime).toBeGreaterThanOrEqual(0);
  });

  test('getQueueStatus: returns null for unknown user', () => {
    const status = getQueueStatus('u_unknown');
    expect(status).toBeNull();
  });

  test('leaveQueue: removes player from queue', () => {
    joinQueue('u_3', 'Charlie', 1100);
    const removed = leaveQueue('u_3');
    expect(removed).toBe(true);
    const status = getQueueStatus('u_3');
    expect(status).toBeNull();
  });

  test('leaveQueue: returns false for non-existent user', () => {
    const removed = leaveQueue('u_nonexistent');
    expect(removed).toBe(false);
  });

  test('joinQueue: two nearby ELO players match immediately', () => {
    joinQueue('u_p1', 'Player1', 1000);
    joinQueue('u_p2', 'Player2', 1010);
    const s1 = getQueueStatus('u_p1');
    const s2 = getQueueStatus('u_p2');
    expect(s1?.matchedRoom || s2?.matchedRoom).toBeTruthy();
  });

  test('joinQueue: far apart ELO players stay unmatched initially', () => {
    joinQueue('u_far1', 'Far1', 1000);
    joinQueue('u_far2', 'Far2', 2000);
    const s1 = getQueueStatus('u_far1');
    const s2 = getQueueStatus('u_far2');
    expect(s1?.inQueue).toBe(true);
    expect(s2?.inQueue).toBe(true);
    expect(s1?.matchedRoom).toBeUndefined();
    expect(s2?.matchedRoom).toBeUndefined();
  });
});
