import { resolveCard } from '../resolve';
import { GameRoomState, PlayerState } from '../../rooms/schema/GameState';

function createState(overrides?: {
  p1?: Partial<PlayerState>;
  p2?: Partial<PlayerState>;
}): GameRoomState {
  const state = new GameRoomState();
  const p1 = new PlayerState();
  const p2 = new PlayerState();
  Object.assign(p1, overrides?.p1);
  Object.assign(p2, overrides?.p2);
  state.players.set('p1', p1);
  state.players.set('p2', p2);
  return state;
}

describe('Card resolution', () => {
  test('Catapult: +6 Wall, 10 tower damage to opponent', () => {
    const state = createState({ p1: { wall: 10 }, p2: { wall: 10, tower: 50 } });
    const { state: s } = resolveCard('catapult', state, 'p1');
    expect(s.players.get('p1')!.wall).toBe(16);
    expect(s.players.get('p2')!.tower).toBe(40);
  });

  test('Dragon Eye: +20 Tower', () => {
    const state = createState({ p1: { tower: 50 } });
    const { state: s } = resolveCard('dragon_eye', state, 'p1');
    expect(s.players.get('p1')!.tower).toBe(70);
  });

  test('Lucky Coin: +2 Ore, +2 Mana', () => {
    const state = createState({ p1: { ore: 0, mana: 0 } });
    const { state: s } = resolveCard('lucky_coin', state, 'p1');
    expect(s.players.get('p1')!.ore).toBe(2);
    expect(s.players.get('p1')!.mana).toBe(2);
  });

  test('Quartz: +1 Tower', () => {
    const state = createState({ p1: { tower: 50 } });
    const { state: s } = resolveCard('quartz', state, 'p1');
    expect(s.players.get('p1')!.tower).toBe(51);
  });

  test('Lightning: player tower > opponent wall → 8 tower damage', () => {
    const state = createState({ p1: { tower: 50 }, p2: { wall: 10, tower: 50 } });
    const { state: s } = resolveCard('lightning', state, 'p1');
    expect(s.players.get('p2')!.tower).toBe(42);
  });

  test('Shift: swap walls', () => {
    const state = createState({ p1: { wall: 10 }, p2: { wall: 5 } });
    const { state: s } = resolveCard('shift', state, 'p1');
    expect(s.players.get('p1')!.wall).toBe(5);
    expect(s.players.get('p2')!.wall).toBe(10);
  });

  test('Earthquake: both players lose 1 mine', () => {
    const state = createState({ p1: { mine: 3 }, p2: { mine: 3 } });
    const { state: s } = resolveCard('earthquake', state, 'p1');
    expect(s.players.get('p1')!.mine).toBe(2);
    expect(s.players.get('p2')!.mine).toBe(2);
  });

  test('Goblin Army: 6 to enemy tower, 3 self damage', () => {
    const state = createState({ p1: { tower: 50 }, p2: { tower: 50 } });
    const { state: s } = resolveCard('goblin_army', state, 'p1');
    expect(s.players.get('p2')!.tower).toBe(44);
    expect(s.players.get('p1')!.tower).toBe(47);
  });

  test('Jewelry: tower < opponent → +2 tower', () => {
    const state = createState({ p1: { tower: 40 }, p2: { tower: 50 } });
    const { state: s } = resolveCard('jewelry', state, 'p1');
    expect(s.players.get('p1')!.tower).toBe(42);
  });

  test('Jewelry: tower >= opponent → +1 tower', () => {
    const state = createState({ p1: { tower: 55 }, p2: { tower: 50 } });
    const { state: s } = resolveCard('jewelry', state, 'p1');
    expect(s.players.get('p1')!.tower).toBe(56);
  });

  test('Foundation: wall > 0 → +3 wall', () => {
    const state = createState({ p1: { wall: 5 } });
    const { state: s } = resolveCard('foundation', state, 'p1');
    expect(s.players.get('p1')!.wall).toBe(8);
  });

  test('Foundation: wall === 0 → +5 wall', () => {
    const state = createState({ p1: { wall: 0 } });
    const { state: s } = resolveCard('foundation', state, 'p1');
    expect(s.players.get('p1')!.wall).toBe(5);
  });
});
