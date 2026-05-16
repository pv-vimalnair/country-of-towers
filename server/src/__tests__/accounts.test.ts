import {
  register,
  login,
  verifyToken,
  getUserById,
  updateStats,
  updateElo,
  getAllUsers,
} from '../accounts';

describe('Account system', () => {
  beforeEach(() => {
    // Reset the module state by re-registering
    // The in-memory Map is module-level, so we use unique emails per test
  });

  test('register: creates a new user with token', () => {
    const result = register('Alice', 'alice@test.com', 'password123');
    expect(result).not.toBeNull();
    expect(result!.token).toBeDefined();
    expect(result!.user.username).toBe('Alice');
    expect(result!.user.email).toBe('alice@test.com');
    expect(result!.user.elo).toBe(1000);
    expect(result!.user.wins).toBe(0);
    expect(result!.user.losses).toBe(0);
    expect(result!.user.id).toMatch(/^u_/);
  });

  test('register: returns null for duplicate email', () => {
    register('Alice', 'dup@test.com', 'password123');
    const result = register('Alice2', 'dup@test.com', 'different');
    expect(result).toBeNull();
  });

  test('login: succeeds with valid credentials', () => {
    register('Bob', 'bob@test.com', 'secret');
    const result = login('bob@test.com', 'secret');
    expect(result).not.toBeNull();
    expect(result!.user.username).toBe('Bob');
    expect(result!.token).toBeDefined();
  });

  test('login: fails with wrong password', () => {
    register('Charlie', 'charlie@test.com', 'correct');
    const result = login('charlie@test.com', 'wrong');
    expect(result).toBeNull();
  });

  test('login: fails with unknown email', () => {
    const result = login('nobody@test.com', 'password');
    expect(result).toBeNull();
  });

  test('verifyToken: validates a good token', () => {
    const reg = register('Dave', 'dave@test.com', 'password');
    expect(reg).not.toBeNull();
    const verified = verifyToken(reg!.token);
    expect(verified).not.toBeNull();
    expect(verified!.id).toBe(reg!.user.id);
    expect(verified!.email).toBe('dave@test.com');
  });

  test('verifyToken: rejects a bad token', () => {
    const verified = verifyToken('invalid.token.here');
    expect(verified).toBeNull();
  });

  test('getUserById: finds a registered user', () => {
    const reg = register('Eve', 'eve@test.com', 'password');
    const found = getUserById(reg!.user.id);
    expect(found).not.toBeNull();
    expect(found!.username).toBe('Eve');
  });

  test('getUserById: returns null for unknown id', () => {
    const found = getUserById('u_nonexistent');
    expect(found).toBeNull();
  });

  test('updateStats: increments wins and ELO on win', () => {
    const reg = register('Winner', 'winner@test.com', 'password');
    updateStats(reg!.user.id, true, ['catapult', 'dragon_eye']);
    const user = getUserById(reg!.user.id);
    expect(user!.wins).toBe(1);
    expect(user!.losses).toBe(0);
    expect(user!.elo).toBe(1016);
    expect(user!.cardsPlayed).toContain('catapult');
    expect(user!.cardsPlayed).toContain('dragon_eye');
  });

  test('updateStats: increments losses and ELO on loss', () => {
    const reg = register('Loser', 'loser@test.com', 'password');
    updateStats(reg!.user.id, false, ['quartz']);
    const user = getUserById(reg!.user.id);
    expect(user!.wins).toBe(0);
    expect(user!.losses).toBe(1);
    expect(user!.elo).toBe(984);
  });

  test('updateElo: changes user ELO', () => {
    const reg = register('Player', 'player@test.com', 'password');
    updateElo(reg!.user.id, 1200);
    const user = getUserById(reg!.user.id);
    expect(user!.elo).toBe(1200);
  });

  test('getAllUsers: returns all registered users', () => {
    register('UserA', 'usera@test.com', 'password');
    register('UserB', 'userb@test.com', 'password');
    const all = getAllUsers();
    expect(all.length).toBeGreaterThanOrEqual(2);
    expect(all.every(u => !('passwordHash' in u))).toBe(true);
  });
});
