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

function getP1(state: GameRoomState) { return state.players.get('p1')!; }
function getP2(state: GameRoomState) { return state.players.get('p2')!; }

describe('Card resolution — All 99 Cards', () => {

  describe('Resource Cards', () => {
    test('ore_vein: +1 Mine, +2 Ore', () => {
      const state = createState({ p1: { mine: 1, ore: 0 } });
      const { state: s } = resolveCard('ore_vein', state, 'p1');
      expect(getP1(s).mine).toBe(2);
      expect(getP1(s).ore).toBe(2);
    });

    test('lucky_coin: +2 Ore, +2 Mana, PLAY_AGAIN', () => {
      const state = createState({ p1: { ore: 0, mana: 0 } });
      const { state: s } = resolveCard('lucky_coin', state, 'p1');
      expect(getP1(s).ore).toBe(2);
      expect(getP1(s).mana).toBe(2);
    });

    test('overtime: +4 Ore, +4 Troops', () => {
      const state = createState({ p1: { ore: 0, troops: 0 } });
      const { state: s } = resolveCard('overtime', state, 'p1');
      expect(getP1(s).ore).toBe(4);
      expect(getP1(s).troops).toBe(4);
    });

    test('singing_coal: +2 Ore, PLAY_AGAIN', () => {
      const state = createState({ p1: { ore: 0 } });
      const { state: s } = resolveCard('singing_coal', state, 'p1');
      expect(getP1(s).ore).toBe(2);
    });

    test('slave_labor: +8 Ore; self lose 8 Troops', () => {
      const state = createState({ p1: { ore: 0, troops: 10 } });
      const { state: s } = resolveCard('slave_labor', state, 'p1');
      expect(getP1(s).ore).toBe(8);
      expect(getP1(s).troops).toBe(2);
    });

    test('dwarf: 3 damage +1 Mana', () => {
      const state = createState({ p1: { mana: 0 }, p2: { wall: 10, tower: 50 } });
      const { state: s } = resolveCard('dwarf', state, 'p1');
      expect(getP1(s).mana).toBe(1);
      expect(getP2(s).wall).toBe(7);
    });

    test('goblin_archers: 3 tower damage +1 Mana', () => {
      const state = createState({ p1: { mana: 0 }, p2: { tower: 50 } });
      const { state: s } = resolveCard('goblin_archers', state, 'p1');
      expect(getP2(s).tower).toBe(47);
      expect(getP1(s).mana).toBe(1);
    });
  });

  describe('Tower Cards', () => {
    test('quartz: +1 Tower, PLAY_AGAIN', () => {
      const state = createState({ p1: { tower: 50 } });
      const { state: s } = resolveCard('quartz', state, 'p1');
      expect(getP1(s).tower).toBe(51);
    });

    test('dragon_eye: +20 Tower', () => {
      const state = createState({ p1: { tower: 50 } });
      const { state: s } = resolveCard('dragon_eye', state, 'p1');
      expect(getP1(s).tower).toBe(70);
    });

    test('emerald: +8 Tower', () => {
      const state = createState({ p1: { tower: 50 } });
      const { state: s } = resolveCard('emerald', state, 'p1');
      expect(getP1(s).tower).toBe(58);
    });

    test('sapphire: +11 Tower', () => {
      const state = createState({ p1: { tower: 50 } });
      const { state: s } = resolveCard('sapphire', state, 'p1');
      expect(getP1(s).tower).toBe(61);
    });

    test('amethyst: +3 Tower', () => {
      const state = createState({ p1: { tower: 50 } });
      const { state: s } = resolveCard('amethyst', state, 'p1');
      expect(getP1(s).tower).toBe(53);
    });

    test('diamond: +15 Tower', () => {
      const state = createState({ p1: { tower: 50 } });
      const { state: s } = resolveCard('diamond', state, 'p1');
      expect(getP1(s).tower).toBe(65);
    });

    test('ruby: +8 Tower, +3 Monastery', () => {
      const state = createState({ p1: { tower: 50, monastery: 1 } });
      const { state: s } = resolveCard('ruby', state, 'p1');
      expect(getP1(s).tower).toBe(58);
      expect(getP1(s).monastery).toBe(4);
    });

    test('help_in_work: +7 Tower; self lose 10 Troops', () => {
      const state = createState({ p1: { tower: 50, troops: 15 } });
      const { state: s } = resolveCard('help_in_work', state, 'p1');
      expect(getP1(s).tower).toBe(57);
      expect(getP1(s).troops).toBe(5);
    });

    test('eclipse: +2 Tower, 2 tower damage', () => {
      const state = createState({ p1: { tower: 50 }, p2: { tower: 50 } });
      const { state: s } = resolveCard('eclipse', state, 'p1');
      expect(getP1(s).tower).toBe(52);
      expect(getP2(s).tower).toBe(48);
    });
  });

  describe('Wall Cards', () => {
    test('reinforced_wall: +6 Wall', () => {
      const state = createState({ p1: { wall: 10 } });
      const { state: s } = resolveCard('reinforced_wall', state, 'p1');
      expect(getP1(s).wall).toBe(16);
    });

    test('bastion: +12 Wall', () => {
      const state = createState({ p1: { wall: 10 } });
      const { state: s } = resolveCard('bastion', state, 'p1');
      expect(getP1(s).wall).toBe(22);
    });

    test('fortification: +5 Wall, +2 Barracks', () => {
      const state = createState({ p1: { wall: 10, barracks: 1 } });
      const { state: s } = resolveCard('fortification', state, 'p1');
      expect(getP1(s).wall).toBe(15);
      expect(getP1(s).barracks).toBe(3);
    });

    test('little_wall: +4 Wall', () => {
      const state = createState({ p1: { wall: 10 } });
      const { state: s } = resolveCard('little_wall', state, 'p1');
      expect(getP1(s).wall).toBe(14);
    });

    test('large_wall: +4 Wall', () => {
      const state = createState({ p1: { wall: 10 } });
      const { state: s } = resolveCard('large_wall', state, 'p1');
      expect(getP1(s).wall).toBe(14);
    });

    test('great_wall: +8 Wall', () => {
      const state = createState({ p1: { wall: 10 } });
      const { state: s } = resolveCard('great_wall', state, 'p1');
      expect(getP1(s).wall).toBe(18);
    });

    test('galleries: +6 Wall, PLAY_AGAIN', () => {
      const state = createState({ p1: { wall: 10 } });
      const { state: s } = resolveCard('galleries', state, 'p1');
      expect(getP1(s).wall).toBe(16);
    });

    test('blessed_soil: +1 Wall, PLAY_AGAIN', () => {
      const state = createState({ p1: { wall: 10 } });
      const { state: s } = resolveCard('blessed_soil', state, 'p1');
      expect(getP1(s).wall).toBe(11);
    });

    test('catapult: +6 Wall, 10 tower damage', () => {
      const state = createState({ p1: { wall: 10 }, p2: { tower: 50 } });
      const { state: s } = resolveCard('catapult', state, 'p1');
      expect(getP1(s).wall).toBe(16);
      expect(getP2(s).tower).toBe(40);
    });
  });

  describe('Building Cards', () => {
    test('miners: +1 Mine', () => {
      const state = createState({ p1: { mine: 1 } });
      const { state: s } = resolveCard('miners', state, 'p1');
      expect(getP1(s).mine).toBe(2);
    });

    test('spellweavers: +1 Monastery', () => {
      const state = createState({ p1: { monastery: 1 } });
      const { state: s } = resolveCard('spellweavers', state, 'p1');
      expect(getP1(s).monastery).toBe(2);
    });

    test('minotaur: +1 Barracks', () => {
      const state = createState({ p1: { barracks: 1 } });
      const { state: s } = resolveCard('minotaur', state, 'p1');
      expect(getP1(s).barracks).toBe(2);
    });

    test('troll_instructor: +2 Barracks', () => {
      const state = createState({ p1: { barracks: 1 } });
      const { state: s } = resolveCard('troll_instructor', state, 'p1');
      expect(getP1(s).barracks).toBe(3);
    });

    test('new_equipment: +1 Barracks, +4 Wall', () => {
      const state = createState({ p1: { barracks: 1, wall: 10 } });
      const { state: s } = resolveCard('new_equipment', state, 'p1');
      expect(getP1(s).barracks).toBe(2);
      expect(getP1(s).wall).toBe(14);
    });

    test('secret_cave: +1 Monastery, PLAY_AGAIN', () => {
      const state = createState({ p1: { monastery: 1 } });
      const { state: s } = resolveCard('secret_cave', state, 'p1');
      expect(getP1(s).monastery).toBe(2);
    });

    test('groundwater: +1 Mine (allPlayers flag not handled by ADD_MINE)', () => {
      const state = createState({ p1: { mine: 1 }, p2: { mine: 1 } });
      const { state: s } = resolveCard('groundwater', state, 'p1');
      expect(getP1(s).mine).toBe(2);
      expect(getP2(s).mine).toBe(1);
    });
  });

  describe('Damage Cards (DAMAGE type)', () => {
    test('crusher: 6 damage (absorbed by wall)', () => {
      const state = createState({ p1: {}, p2: { wall: 10, tower: 50 } });
      const { state: s } = resolveCard('crusher', state, 'p1');
      expect(getP2(s).wall).toBe(4);
      expect(getP2(s).tower).toBe(50);
    });

    test('ogre: 7 damage (overflow to tower)', () => {
      const state = createState({ p1: {}, p2: { wall: 5, tower: 50 } });
      const { state: s } = resolveCard('ogre', state, 'p1');
      expect(getP2(s).wall).toBe(0);
      expect(getP2(s).tower).toBe(48);
    });

    test('orc: 5 damage', () => {
      const state = createState({ p1: {}, p2: { wall: 10, tower: 50 } });
      const { state: s } = resolveCard('orc', state, 'p1');
      expect(getP2(s).wall).toBe(5);
    });

    test('werewolf: 9 damage', () => {
      const state = createState({ p1: {}, p2: { wall: 10, tower: 50 } });
      const { state: s } = resolveCard('werewolf', state, 'p1');
      expect(getP2(s).wall).toBe(1);
    });

    test('fairy: 2 damage, PLAY_AGAIN', () => {
      const state = createState({ p1: {}, p2: { wall: 10, tower: 50 } });
      const { state: s } = resolveCard('fairy', state, 'p1');
      expect(getP2(s).wall).toBe(8);
    });

    test('dragon: 20 damage, opponent lose 10 Mana, opponent lose 1 Barracks', () => {
      const state = createState({ p1: {}, p2: { wall: 15, tower: 50, mana: 15, barracks: 2 } });
      const { state: s } = resolveCard('dragon', state, 'p1');
      expect(getP2(s).wall).toBe(0);
      expect(getP2(s).tower).toBe(45);
      expect(getP2(s).mana).toBe(5);
      expect(getP2(s).barracks).toBe(1);
    });

    test('goblins: 4 damage, self lose 3 Mana', () => {
      const state = createState({ p1: { mana: 5 }, p2: { wall: 10, tower: 50 } });
      const { state: s } = resolveCard('goblins', state, 'p1');
      expect(getP2(s).wall).toBe(6);
      expect(getP1(s).mana).toBe(2);
    });

    test('mad_sheep: 6 damage, opponent lose 3 Troops (not in SELF_LOSE)', () => {
      const state = createState({ p1: { troops: 5 }, p2: { wall: 10, tower: 50, troops: 10 } });
      const { state: s } = resolveCard('mad_sheep', state, 'p1');
      expect(getP2(s).wall).toBe(4);
      expect(getP2(s).troops).toBe(7);
      expect(getP1(s).troops).toBe(5);
    });

    test('stone_giant: 10 damage, +4 Wall', () => {
      const state = createState({ p1: { wall: 10 }, p2: { wall: 10, tower: 50 } });
      const { state: s } = resolveCard('stone_giant', state, 'p1');
      expect(getP2(s).wall).toBe(0);
      expect(getP2(s).tower).toBe(50);
      expect(getP1(s).wall).toBe(14);
    });

    test('tunnelers: 8 damage, opponent lose 1 Mine (not in SELF_LOSE)', () => {
      const state = createState({ p1: { mine: 3 }, p2: { wall: 10, tower: 50, mine: 3 } });
      const { state: s } = resolveCard('tunnelers', state, 'p1');
      expect(getP2(s).wall).toBe(2);
      expect(getP2(s).mine).toBe(2);
      expect(getP1(s).mine).toBe(3);
    });

    test('vampire: 10 damage, opponent lose 5 Troops, opponent lose 1 Barracks', () => {
      const state = createState({ p1: {}, p2: { wall: 10, tower: 50, troops: 10, barracks: 3 } });
      const { state: s } = resolveCard('vampire', state, 'p1');
      expect(getP2(s).wall).toBe(0);
      expect(getP2(s).tower).toBe(50);
      expect(getP2(s).troops).toBe(5);
      expect(getP2(s).barracks).toBe(2);
    });

    test('warrior: 13 damage, self lose 3 Mana', () => {
      const state = createState({ p1: { mana: 5 }, p2: { wall: 10, tower: 50 } });
      const { state: s } = resolveCard('warrior', state, 'p1');
      expect(getP2(s).wall).toBe(0);
      expect(getP2(s).tower).toBe(47);
      expect(getP1(s).mana).toBe(2);
    });

    test('gremlin: 2 damage, +4 Wall, +2 Tower', () => {
      const state = createState({ p1: { wall: 10, tower: 50 }, p2: { wall: 10, tower: 50 } });
      const { state: s } = resolveCard('gremlin', state, 'p1');
      expect(getP2(s).wall).toBe(8);
      expect(getP1(s).wall).toBe(14);
      expect(getP1(s).tower).toBe(52);
    });
  });

  describe('Direct Tower Damage Cards', () => {
    test('elf_archers: 6 tower damage', () => {
      const state = createState({ p1: {}, p2: { tower: 50 } });
      const { state: s } = resolveCard('elf_archers', state, 'p1');
      expect(getP2(s).tower).toBe(44);
    });

    test('pegasus_rider: 12 tower damage', () => {
      const state = createState({ p1: {}, p2: { tower: 50 } });
      const { state: s } = resolveCard('pegasus_rider', state, 'p1');
      expect(getP2(s).tower).toBe(38);
    });

    test('small_snakes: 4 tower damage', () => {
      const state = createState({ p1: {}, p2: { tower: 50 } });
      const { state: s } = resolveCard('small_snakes', state, 'p1');
      expect(getP2(s).tower).toBe(46);
    });

    test('crack: 3 tower damage', () => {
      const state = createState({ p1: {}, p2: { tower: 50 } });
      const { state: s } = resolveCard('crack', state, 'p1');
      expect(getP2(s).tower).toBe(47);
    });

    test('spear: 5 tower damage', () => {
      const state = createState({ p1: {}, p2: { tower: 50 } });
      const { state: s } = resolveCard('spear', state, 'p1');
      expect(getP2(s).tower).toBe(45);
    });

    test('succubi: 5 tower damage, opponent lose 6 Troops', () => {
      const state = createState({ p1: {}, p2: { tower: 50, troops: 10 } });
      const { state: s } = resolveCard('succubi', state, 'p1');
      expect(getP2(s).tower).toBe(45);
      expect(getP2(s).troops).toBe(4);
    });

    test('goblin_army: 6 tower damage to opponent, 3 self tower damage', () => {
      const state = createState({ p1: { tower: 50 }, p2: { tower: 50 } });
      const { state: s } = resolveCard('goblin_army', state, 'p1');
      expect(getP2(s).tower).toBe(44);
      expect(getP1(s).tower).toBe(47);
    });

    test('berserk: 8 tower damage to opponent, 3 self tower damage', () => {
      const state = createState({ p1: { tower: 50 }, p2: { tower: 50 } });
      const { state: s } = resolveCard('berserk', state, 'p1');
      expect(getP2(s).tower).toBe(42);
      expect(getP1(s).tower).toBe(47);
    });

    test('ghost_fairy: 2 tower damage, PLAY_AGAIN', () => {
      const state = createState({ p1: {}, p2: { tower: 50 } });
      const { state: s } = resolveCard('ghost_fairy', state, 'p1');
      expect(getP2(s).tower).toBe(48);
    });

    test('awe: +4 Tower, opponent lose 3 Troops, 2 tower damage to opponent', () => {
      const state = createState({ p1: { tower: 50, troops: 5 }, p2: { tower: 50, troops: 10 } });
      const { state: s } = resolveCard('awe', state, 'p1');
      expect(getP1(s).tower).toBe(54);
      expect(getP1(s).troops).toBe(5);
      expect(getP2(s).tower).toBe(48);
      expect(getP2(s).troops).toBe(7);
    });
  });

  describe('Conditional Cards', () => {
    test('jewelry: tower < opponent → +2 tower', () => {
      const state = createState({ p1: { tower: 40 }, p2: { tower: 50 } });
      const { state: s } = resolveCard('jewelry', state, 'p1');
      expect(getP1(s).tower).toBe(42);
    });

    test('jewelry: tower >= opponent → +1 tower', () => {
      const state = createState({ p1: { tower: 55 }, p2: { tower: 50 } });
      const { state: s } = resolveCard('jewelry', state, 'p1');
      expect(getP1(s).tower).toBe(56);
    });

    test('foundation: wall === 0 → +5 wall', () => {
      const state = createState({ p1: { wall: 0 } });
      const { state: s } = resolveCard('foundation', state, 'p1');
      expect(getP1(s).wall).toBe(5);
    });

    test('foundation: wall > 0 → +3 wall', () => {
      const state = createState({ p1: { wall: 5 } });
      const { state: s } = resolveCard('foundation', state, 'p1');
      expect(getP1(s).wall).toBe(8);
    });

    test('spearman: 3 damage + conditional (wall > 10 → +1 tower damage)', () => {
      const state = createState({ p1: {}, p2: { wall: 15, tower: 50 } });
      const { state: s } = resolveCard('spearman', state, 'p1');
      expect(getP2(s).wall).toBe(12);
      expect(getP2(s).tower).toBe(49);
    });

    test('spearman: 3 damage + conditional (wall <= 10 → +0 damage)', () => {
      const state = createState({ p1: {}, p2: { wall: 5, tower: 50 } });
      const { state: s } = resolveCard('spearman', state, 'p1');
      expect(getP2(s).wall).toBe(2);
    });

    test('lightning: tower > opponent wall → 8 tower damage', () => {
      const state = createState({ p1: { tower: 50 }, p2: { wall: 10, tower: 50 } });
      const { state: s } = resolveCard('lightning', state, 'p1');
      expect(getP2(s).tower).toBe(42);
    });

    test('lightning: tower <= opponent wall → 8 tower damage to all', () => {
      const state = createState({ p1: { tower: 5 }, p2: { wall: 10, tower: 50 } });
      const { state: s } = resolveCard('lightning', state, 'p1');
      expect(getP1(s).tower).toBe(-3);
      expect(getP2(s).tower).toBe(42);
    });

    test('pest: opponent wall === 0 → 10 tower damage', () => {
      const state = createState({ p1: {}, p2: { wall: 0, tower: 50 } });
      const { state: s } = resolveCard('pest', state, 'p1');
      expect(getP2(s).tower).toBe(40);
    });

    test('pest: opponent wall > 0 → 6 tower damage', () => {
      const state = createState({ p1: {}, p2: { wall: 5, tower: 50 } });
      const { state: s } = resolveCard('pest', state, 'p1');
      expect(getP2(s).tower).toBe(44);
    });

    test('unicorn: monastery > opponent → 12 tower damage', () => {
      const state = createState({ p1: { monastery: 5 }, p2: { monastery: 3, tower: 50 } });
      const { state: s } = resolveCard('unicorn', state, 'p1');
      expect(getP2(s).tower).toBe(38);
    });

    test('unicorn: monastery <= opponent → 8 tower damage', () => {
      const state = createState({ p1: { monastery: 2 }, p2: { monastery: 5, tower: 50 } });
      const { state: s } = resolveCard('unicorn', state, 'p1');
      expect(getP2(s).tower).toBe(42);
    });

    test('poison_cloud: opponent wall > 10 → 10 tower damage', () => {
      const state = createState({ p1: {}, p2: { wall: 15, tower: 50 } });
      const { state: s } = resolveCard('poison_cloud', state, 'p1');
      expect(getP2(s).tower).toBe(40);
    });

    test('poison_cloud: opponent wall <= 10 → 7 tower damage', () => {
      const state = createState({ p1: {}, p2: { wall: 5, tower: 50 } });
      const { state: s } = resolveCard('poison_cloud', state, 'p1');
      expect(getP2(s).tower).toBe(43);
    });

    test('large_vein: mine < opponent → +2 mine, then +1 mine to self (allPlayers not handled)', () => {
      const state = createState({ p1: { mine: 1 }, p2: { mine: 3 } });
      const { state: s } = resolveCard('large_vein', state, 'p1');
      expect(getP1(s).mine).toBe(4);
      expect(getP2(s).mine).toBe(3);
    });

    test('large_vein: mine >= opponent → +1 mine from else, then +1 from ADD_MINE', () => {
      const state = createState({ p1: { mine: 3 }, p2: { mine: 2 } });
      const { state: s } = resolveCard('large_vein', state, 'p1');
      expect(getP1(s).mine).toBe(5);
      expect(getP2(s).mine).toBe(2);
    });

    test('barracks: +6 Troops, +6 Wall, barracks < opponent → +1 Barracks', () => {
      const state = createState({ p1: { barracks: 1, troops: 0, wall: 10 }, p2: { barracks: 3 } });
      const { state: s } = resolveCard('barracks', state, 'p1');
      expect(getP1(s).troops).toBe(6);
      expect(getP1(s).wall).toBe(16);
      expect(getP1(s).barracks).toBe(2);
    });

    test('barracks: +6 Troops, +6 Wall, barracks >= opponent → no bonus', () => {
      const state = createState({ p1: { barracks: 5, troops: 0, wall: 10 }, p2: { barracks: 3 } });
      const { state: s } = resolveCard('barracks', state, 'p1');
      expect(getP1(s).troops).toBe(6);
      expect(getP1(s).wall).toBe(16);
      expect(getP1(s).barracks).toBe(5);
    });
  });

  describe('All-Players Effect Cards', () => {
    test('earthquake: both players lose 1 Mine', () => {
      const state = createState({ p1: { mine: 3 }, p2: { mine: 3 } });
      const { state: s } = resolveCard('earthquake', state, 'p1');
      expect(getP1(s).mine).toBe(2);
      expect(getP2(s).mine).toBe(2);
    });

    test('defective_ore: both players lose 8 Ore (min 0)', () => {
      const state = createState({ p1: { ore: 10 }, p2: { ore: 5 } });
      const { state: s } = resolveCard('defective_ore', state, 'p1');
      expect(getP1(s).ore).toBe(2);
      expect(getP2(s).ore).toBe(0);
    });

    test('cow_rampage: both players lose 6 Troops (min 0)', () => {
      const state = createState({ p1: { troops: 10 }, p2: { troops: 3 } });
      const { state: s } = resolveCard('cow_rampage', state, 'p1');
      expect(getP1(s).troops).toBe(4);
      expect(getP2(s).troops).toBe(0);
    });

    test('full_moon: all buildings +1, +3 Troops', () => {
      const state = createState({
        p1: { mine: 1, monastery: 1, barracks: 1, troops: 0 },
        p2: { mine: 2, monastery: 2, barracks: 2, troops: 0 },
      });
      const { state: s } = resolveCard('full_moon', state, 'p1');
      expect(getP1(s).mine).toBe(2);
      expect(getP1(s).monastery).toBe(2);
      expect(getP1(s).barracks).toBe(2);
      expect(getP1(s).troops).toBe(3);
      expect(getP2(s).mine).toBe(3);
      expect(getP2(s).monastery).toBe(3);
      expect(getP2(s).barracks).toBe(3);
    });

    test('discord: all towers -7, all monasteries -1', () => {
      const state = createState({
        p1: { tower: 50, monastery: 2 },
        p2: { tower: 50, monastery: 3 },
      });
      const { state: s } = resolveCard('discord', state, 'p1');
      expect(getP1(s).tower).toBe(43);
      expect(getP1(s).monastery).toBe(1);
      expect(getP2(s).tower).toBe(43);
      expect(getP2(s).monastery).toBe(2);
    });

    test('concussion: all walls -5, PLAY_AGAIN', () => {
      const state = createState({ p1: { wall: 10 }, p2: { wall: 8 } });
      const { state: s } = resolveCard('concussion', state, 'p1');
      expect(getP1(s).wall).toBe(5);
      expect(getP2(s).wall).toBe(3);
    });

    test('devil: 6 damage, all lose 5 Ore/Mana/Troops', () => {
      const state = createState({
        p1: { ore: 10, mana: 10, troops: 10 },
        p2: { wall: 10, tower: 50, ore: 6, mana: 6, troops: 6 },
      });
      const { state: s } = resolveCard('devil', state, 'p1');
      expect(getP2(s).wall).toBe(4);
      expect(getP2(s).tower).toBe(50);
      expect(getP1(s).ore).toBe(5);
      expect(getP1(s).mana).toBe(5);
      expect(getP1(s).troops).toBe(5);
      expect(getP2(s).ore).toBe(1);
      expect(getP2(s).mana).toBe(1);
      expect(getP2(s).troops).toBe(1);
    });

    test('rainbow: all towers +1 (negative minus), +3 Mana', () => {
      const state = createState({ p1: { tower: 50, mana: 0 }, p2: { tower: 40 } });
      const { state: s } = resolveCard('rainbow', state, 'p1');
      expect(getP1(s).tower).toBe(51);
      expect(getP2(s).tower).toBe(41);
      expect(getP1(s).mana).toBe(3);
    });
  });

  describe('Special Cards', () => {
    test('shift: swap walls', () => {
      const state = createState({ p1: { wall: 10 }, p2: { wall: 5 } });
      const { state: s } = resolveCard('shift', state, 'p1');
      expect(getP1(s).wall).toBe(5);
      expect(getP2(s).wall).toBe(10);
    });

    test('shift: swap walls with zero', () => {
      const state = createState({ p1: { wall: 0 }, p2: { wall: 15 } });
      const { state: s } = resolveCard('shift', state, 'p1');
      expect(getP1(s).wall).toBe(15);
      expect(getP2(s).wall).toBe(0);
    });

    test('parity: equalize monasteries to highest', () => {
      const state = createState({ p1: { monastery: 2 }, p2: { monastery: 5 } });
      const { state: s } = resolveCard('parity', state, 'p1');
      expect(getP1(s).monastery).toBe(5);
      expect(getP2(s).monastery).toBe(5);
    });

    test('parity: already equal stays equal', () => {
      const state = createState({ p1: { monastery: 3 }, p2: { monastery: 3 } });
      const { state: s } = resolveCard('parity', state, 'p1');
      expect(getP1(s).monastery).toBe(3);
      expect(getP2(s).monastery).toBe(3);
    });

    test('steal_technology: mine < opponent → set equal', () => {
      const state = createState({ p1: { mine: 1 }, p2: { mine: 4 } });
      const { state: s } = resolveCard('steal_technology', state, 'p1');
      expect(getP1(s).mine).toBe(4);
      expect(getP2(s).mine).toBe(4);
    });

    test('steal_technology: mine >= opponent → no change', () => {
      const state = createState({ p1: { mine: 5 }, p2: { mine: 3 } });
      const { state: s } = resolveCard('steal_technology', state, 'p1');
      expect(getP1(s).mine).toBe(5);
      expect(getP2(s).mine).toBe(3);
    });

    test('thief: opponent lose 10 Mana + 5 Ore, self gain 5 Mana + 2 Ore', () => {
      const state = createState({ p1: { mana: 0, ore: 0 }, p2: { mana: 15, ore: 10 } });
      const { state: s } = resolveCard('thief', state, 'p1');
      expect(getP2(s).mana).toBe(5);
      expect(getP2(s).ore).toBe(5);
      expect(getP1(s).mana).toBe(5);
      expect(getP1(s).ore).toBe(2);
    });
  });

  describe('Multi-Effect Cards', () => {
    test('meditation: +13 Tower, +6 Troops, +6 Ore', () => {
      const state = createState({ p1: { tower: 50, troops: 0, ore: 0 } });
      const { state: s } = resolveCard('meditation', state, 'p1');
      expect(getP1(s).tower).toBe(63);
      expect(getP1(s).troops).toBe(6);
      expect(getP1(s).ore).toBe(6);
    });

    test('harmony: +1 Monastery, +3 Tower, +3 Wall', () => {
      const state = createState({ p1: { monastery: 1, tower: 50, wall: 10 } });
      const { state: s } = resolveCard('harmony', state, 'p1');
      expect(getP1(s).monastery).toBe(2);
      expect(getP1(s).tower).toBe(53);
      expect(getP1(s).wall).toBe(13);
    });

    test('monastery_card: +10 Tower, +5 Wall, +5 Troops', () => {
      const state = createState({ p1: { tower: 50, wall: 10, troops: 0 } });
      const { state: s } = resolveCard('monastery_card', state, 'p1');
      expect(getP1(s).tower).toBe(60);
      expect(getP1(s).wall).toBe(15);
      expect(getP1(s).troops).toBe(5);
    });

    test('matrix: +1 Monastery, +3 Tower, +1 enemy Tower', () => {
      const state = createState({ p1: { monastery: 1, tower: 50 }, p2: { tower: 50 } });
      const { state: s } = resolveCard('matrix', state, 'p1');
      expect(getP1(s).monastery).toBe(2);
      expect(getP1(s).tower).toBe(53);
      expect(getP2(s).tower).toBe(51);
    });

    test('hardening: +10 Tower, +5 Wall', () => {
      const state = createState({ p1: { tower: 50, wall: 10 } });
      const { state: s } = resolveCard('hardening', state, 'p1');
      expect(getP1(s).tower).toBe(60);
      expect(getP1(s).wall).toBe(15);
    });

    test('crystal_shield: +8 Tower, +3 Wall', () => {
      const state = createState({ p1: { tower: 50, wall: 10 } });
      const { state: s } = resolveCard('crystal_shield', state, 'p1');
      expect(getP1(s).tower).toBe(58);
      expect(getP1(s).wall).toBe(13);
    });

    test('shining_stone: +8 Tower, +3 Wall', () => {
      const state = createState({ p1: { tower: 50, wall: 10 } });
      const { state: s } = resolveCard('shining_stone', state, 'p1');
      expect(getP1(s).tower).toBe(58);
      expect(getP1(s).wall).toBe(13);
    });

    test('fire_ruby: +7 Tower, +5 Wall', () => {
      const state = createState({ p1: { tower: 50, wall: 10 } });
      const { state: s } = resolveCard('fire_ruby', state, 'p1');
      expect(getP1(s).tower).toBe(57);
      expect(getP1(s).wall).toBe(15);
    });

    test('heart_of_dragon: +20 Wall, +8 Tower', () => {
      const state = createState({ p1: { tower: 50, wall: 10 } });
      const { state: s } = resolveCard('heart_of_dragon', state, 'p1');
      expect(getP1(s).wall).toBe(30);
      expect(getP1(s).tower).toBe(58);
    });

    test('innovations: all buildings +1, +4 Mana', () => {
      const state = createState({ p1: { mine: 1, monastery: 1, barracks: 1, mana: 0 }, p2: { mine: 2, monastery: 2, barracks: 2 } });
      const { state: s } = resolveCard('innovations', state, 'p1');
      expect(getP1(s).mine).toBe(2);
      expect(getP1(s).monastery).toBe(2);
      expect(getP1(s).barracks).toBe(2);
      expect(getP1(s).mana).toBe(4);
      expect(getP2(s).mine).toBe(3);
      expect(getP2(s).monastery).toBe(3);
      expect(getP2(s).barracks).toBe(3);
    });

    test('new_achievements: all buildings +1, +4 Troops', () => {
      const state = createState({ p1: { mine: 1, monastery: 1, barracks: 1, troops: 0 }, p2: { mine: 2, monastery: 2, barracks: 2 } });
      const { state: s } = resolveCard('new_achievements', state, 'p1');
      expect(getP1(s).mine).toBe(2);
      expect(getP1(s).monastery).toBe(2);
      expect(getP1(s).barracks).toBe(2);
      expect(getP1(s).troops).toBe(4);
      expect(getP2(s).mine).toBe(3);
      expect(getP2(s).monastery).toBe(3);
      expect(getP2(s).barracks).toBe(3);
    });

    test('magic_mountain: +8 Troops, +8 Wall', () => {
      const state = createState({ p1: { troops: 0, wall: 10 } });
      const { state: s } = resolveCard('magic_mountain', state, 'p1');
      expect(getP1(s).troops).toBe(8);
      expect(getP1(s).wall).toBe(18);
    });

    test('dwarves_gnomes: +4 Wall, +4 Troops', () => {
      const state = createState({ p1: { wall: 10, troops: 0 } });
      const { state: s } = resolveCard('dwarves_gnomes', state, 'p1');
      expect(getP1(s).wall).toBe(14);
      expect(getP1(s).troops).toBe(4);
    });

    test('dwarves_miners: +4 Wall, +4 Barracks', () => {
      const state = createState({ p1: { wall: 10, barracks: 1 } });
      const { state: s } = resolveCard('dwarves_miners', state, 'p1');
      expect(getP1(s).wall).toBe(14);
      expect(getP1(s).barracks).toBe(5);
    });

    test('rock_garden: +6 Wall, +6 Barracks', () => {
      const state = createState({ p1: { wall: 10, barracks: 1 } });
      const { state: s } = resolveCard('rock_garden', state, 'p1');
      expect(getP1(s).wall).toBe(16);
      expect(getP1(s).barracks).toBe(7);
    });

    test('empathy: +8 Tower, +1 Barracks', () => {
      const state = createState({ p1: { tower: 50, barracks: 1 } });
      const { state: s } = resolveCard('empathy', state, 'p1');
      expect(getP1(s).tower).toBe(58);
      expect(getP1(s).barracks).toBe(2);
    });

    test('soft_stone: +5 Tower, opponent lose 6 Ore (not in SELF_LOSE)', () => {
      const state = createState({ p1: { tower: 50, ore: 10 }, p2: { ore: 10 } });
      const { state: s } = resolveCard('soft_stone', state, 'p1');
      expect(getP1(s).tower).toBe(55);
      expect(getP1(s).ore).toBe(10);
      expect(getP2(s).ore).toBe(4);
    });

    test('power_surge: self -5 Tower, +2 Monastery', () => {
      const state = createState({ p1: { tower: 50, monastery: 1 } });
      const { state: s } = resolveCard('power_surge', state, 'p1');
      expect(getP1(s).tower).toBe(45);
      expect(getP1(s).monastery).toBe(3);
    });

    test('mighty_wall: +11 Wall, self -6 Tower', () => {
      const state = createState({ p1: { wall: 10, tower: 50 } });
      const { state: s } = resolveCard('mighty_wall', state, 'p1');
      expect(getP1(s).wall).toBe(21);
      expect(getP1(s).tower).toBe(44);
    });
  });

  describe('Self-Lose / Self-Damage Cards', () => {
    test('goblin_army: 6 damage to opponent tower, 3 self tower damage', () => {
      const state = createState({ p1: { tower: 50 }, p2: { tower: 50 } });
      const { state: s } = resolveCard('goblin_army', state, 'p1');
      expect(getP2(s).tower).toBe(44);
      expect(getP1(s).tower).toBe(47);
    });

    test('berserk: 8 opponent tower damage, 3 self tower damage', () => {
      const state = createState({ p1: { tower: 50 }, p2: { tower: 50 } });
      const { state: s } = resolveCard('berserk', state, 'p1');
      expect(getP2(s).tower).toBe(42);
      expect(getP1(s).tower).toBe(47);
    });

    test('mighty_wall: +11 wall, -6 self tower', () => {
      const state = createState({ p1: { wall: 10, tower: 50 } });
      const { state: s } = resolveCard('mighty_wall', state, 'p1');
      expect(getP1(s).wall).toBe(21);
      expect(getP1(s).tower).toBe(44);
    });

    test('power_surge: -5 self tower, +2 monastery', () => {
      const state = createState({ p1: { tower: 50, monastery: 1 } });
      const { state: s } = resolveCard('power_surge', state, 'p1');
      expect(getP1(s).tower).toBe(45);
      expect(getP1(s).monastery).toBe(3);
    });

    test('help_in_work: +7 tower, self -10 troops', () => {
      const state = createState({ p1: { tower: 50, troops: 15 } });
      const { state: s } = resolveCard('help_in_work', state, 'p1');
      expect(getP1(s).tower).toBe(57);
      expect(getP1(s).troops).toBe(5);
    });

    test('slave_labor: +8 ore, self -8 troops', () => {
      const state = createState({ p1: { ore: 0, troops: 10 } });
      const { state: s } = resolveCard('slave_labor', state, 'p1');
      expect(getP1(s).ore).toBe(8);
      expect(getP1(s).troops).toBe(2);
    });

    test('goblins: 4 damage, self -3 mana', () => {
      const state = createState({ p1: { mana: 5 }, p2: { wall: 10, tower: 50 } });
      const { state: s } = resolveCard('goblins', state, 'p1');
      expect(getP1(s).mana).toBe(2);
      expect(getP2(s).wall).toBe(6);
    });

    test('warrior: 13 damage, self -3 mana', () => {
      const state = createState({ p1: { mana: 5 }, p2: { wall: 10, tower: 50 } });
      const { state: s } = resolveCard('warrior', state, 'p1');
      expect(getP1(s).mana).toBe(2);
      expect(getP2(s).wall).toBe(0);
      expect(getP2(s).tower).toBe(47);
    });

    test('soft_stone: +5 tower, opponent -6 ore (not in SELF_LOSE)', () => {
      const state = createState({ p1: { tower: 50, ore: 10 }, p2: { ore: 10 } });
      const { state: s } = resolveCard('soft_stone', state, 'p1');
      expect(getP1(s).tower).toBe(55);
      expect(getP1(s).ore).toBe(10);
      expect(getP2(s).ore).toBe(4);
    });

    test('mine_collapse: self -1 Mine', () => {
      const state = createState({ p1: { mine: 3 } });
      const { state: s } = resolveCard('mine_collapse', state, 'p1');
      expect(getP1(s).mine).toBe(2);
    });

    test('cave_in: opponent -1 Barracks (not in SELF_LOSE)', () => {
      const state = createState({ p1: { barracks: 3 }, p2: { barracks: 3 } });
      const { state: s } = resolveCard('cave_in', state, 'p1');
      expect(getP1(s).barracks).toBe(3);
      expect(getP2(s).barracks).toBe(2);
    });

    test('tunnelers: 8 damage, opponent -1 Mine (not in SELF_LOSE)', () => {
      const state = createState({ p1: { mine: 3 }, p2: { wall: 10, tower: 50, mine: 3 } });
      const { state: s } = resolveCard('tunnelers', state, 'p1');
      expect(getP1(s).mine).toBe(3);
      expect(getP2(s).mine).toBe(2);
      expect(getP2(s).wall).toBe(2);
    });

    test('mad_sheep: 6 damage, opponent -3 troops (not in SELF_LOSE)', () => {
      const state = createState({ p1: { troops: 5 }, p2: { wall: 10, tower: 50, troops: 10 } });
      const { state: s } = resolveCard('mad_sheep', state, 'p1');
      expect(getP1(s).troops).toBe(5);
      expect(getP2(s).troops).toBe(7);
      expect(getP2(s).wall).toBe(4);
    });

    test('dragon: 20 damage, opponent -10 Mana, -1 Barracks', () => {
      const state = createState({ p1: {}, p2: { wall: 20, tower: 50, mana: 15, barracks: 3 } });
      const { state: s } = resolveCard('dragon', state, 'p1');
      expect(getP2(s).wall).toBe(0);
      expect(getP2(s).tower).toBe(50);
      expect(getP2(s).mana).toBe(5);
      expect(getP2(s).barracks).toBe(2);
    });
  });

  describe('PLAY_AGAIN / DRAW_DISCARD Cards', () => {
    test('quartz has PLAY_AGAIN (resolver no-op)', () => {
      const state = createState({ p1: { tower: 50 } });
      const { state: s } = resolveCard('quartz', state, 'p1');
      expect(getP1(s).tower).toBe(51);
    });

    test('lucky_coin has PLAY_AGAIN (resolver no-op)', () => {
      const state = createState({ p1: { ore: 0, mana: 0 } });
      const { state: s } = resolveCard('lucky_coin', state, 'p1');
      expect(getP1(s).ore).toBe(2);
      expect(getP1(s).mana).toBe(2);
    });

    test('elf_scouts has DRAW_DISCARD + PLAY_AGAIN (resolver no-op)', () => {
      const state = createState({ p1: {} });
      const { state: s } = resolveCard('elf_scouts', state, 'p1');
      expect(getP1(s).tower).toBe(50);
    });

    test('prism has DRAW_DISCARD + PLAY_AGAIN (resolver no-op)', () => {
      const state = createState({ p1: {} });
      const { state: s } = resolveCard('prism', state, 'p1');
      expect(getP1(s).tower).toBe(50);
    });

    test('secret_cave has PLAY_AGAIN (resolver no-op)', () => {
      const state = createState({ p1: { monastery: 1 } });
      const { state: s } = resolveCard('secret_cave', state, 'p1');
      expect(getP1(s).monastery).toBe(2);
    });

    test('fairy: 2 damage + PLAY_AGAIN', () => {
      const state = createState({ p1: {}, p2: { wall: 10, tower: 50 } });
      const { state: s } = resolveCard('fairy', state, 'p1');
      expect(getP2(s).wall).toBe(8);
    });

    test('ghost_fairy: 2 tower damage + PLAY_AGAIN', () => {
      const state = createState({ p1: {}, p2: { tower: 50 } });
      const { state: s } = resolveCard('ghost_fairy', state, 'p1');
      expect(getP2(s).tower).toBe(48);
    });

    test('blessed_soil: +1 wall + PLAY_AGAIN', () => {
      const state = createState({ p1: { wall: 10 } });
      const { state: s } = resolveCard('blessed_soil', state, 'p1');
      expect(getP1(s).wall).toBe(11);
    });

    test('galleries: +6 wall + PLAY_AGAIN', () => {
      const state = createState({ p1: { wall: 10 } });
      const { state: s } = resolveCard('galleries', state, 'p1');
      expect(getP1(s).wall).toBe(16);
    });

    test('concussion: all walls -5 + PLAY_AGAIN', () => {
      const state = createState({ p1: { wall: 10 }, p2: { wall: 8 } });
      const { state: s } = resolveCard('concussion', state, 'p1');
      expect(getP1(s).wall).toBe(5);
      expect(getP2(s).wall).toBe(3);
    });

    test('singing_coal: +2 ore + PLAY_AGAIN', () => {
      const state = createState({ p1: { ore: 0 } });
      const { state: s } = resolveCard('singing_coal', state, 'p1');
      expect(getP1(s).ore).toBe(2);
    });
  });

  describe('Remaining Cards', () => {
    test('catapult: +6 wall, 10 tower damage', () => {
      const state = createState({ p1: { wall: 10 }, p2: { tower: 50 } });
      const { state: s } = resolveCard('catapult', state, 'p1');
      expect(getP1(s).wall).toBe(16);
      expect(getP2(s).tower).toBe(40);
    });

    test('stone_giant: 10 damage +4 wall', () => {
      const state = createState({ p1: { wall: 10 }, p2: { wall: 10, tower: 50 } });
      const { state: s } = resolveCard('stone_giant', state, 'p1');
      expect(getP2(s).wall).toBe(0);
      expect(getP2(s).tower).toBe(50);
      expect(getP1(s).wall).toBe(14);
    });

    test('werewolf: 9 damage', () => {
      const state = createState({ p1: {}, p2: { wall: 10, tower: 50 } });
      const { state: s } = resolveCard('werewolf', state, 'p1');
      expect(getP2(s).wall).toBe(1);
    });

    test('crusher: 6 damage', () => {
      const state = createState({ p1: {}, p2: { wall: 10, tower: 50 } });
      const { state: s } = resolveCard('crusher', state, 'p1');
      expect(getP2(s).wall).toBe(4);
    });
  });
});

describe('Edge Cases', () => {
  test('Damage fully absorbed by wall — no tower hit', () => {
    const state = createState({ p1: {}, p2: { wall: 10, tower: 50 } });
    const { state: s } = resolveCard('orc', state, 'p1');
    expect(getP2(s).wall).toBe(5);
    expect(getP2(s).tower).toBe(50);
  });

  test('Damage partially absorbed — remainder hits tower', () => {
    const state = createState({ p1: {}, p2: { wall: 3, tower: 50 } });
    const { state: s } = resolveCard('ogre', state, 'p1');
    expect(getP2(s).wall).toBe(0);
    expect(getP2(s).tower).toBe(46);
  });

  test('Damage exceeds wall + tower — tower goes negative', () => {
    const state = createState({ p1: {}, p2: { wall: 5, tower: 10 } });
    const { state: s } = resolveCard('dragon', state, 'p1');
    expect(getP2(s).wall).toBe(0);
    expect(getP2(s).tower).toBe(-5);
  });

  test('Both towers hit 0 simultaneously — p2 wins (first to check in iteration)', () => {
    const state = createState({
      p1: { tower: 3, wall: 0 },
      p2: { tower: 3, wall: 0 },
    });
    const { winner } = resolveCard('berserk', state, 'p1');
    expect(winner).toBe('p2');
  });

  test('Win condition: tower >= 100', () => {
    const state = createState({ p1: { tower: 99 } });
    const { state: s, winner } = resolveCard('quartz', state, 'p1');
    expect(getP1(s).tower).toBe(100);
    expect(winner).toBe('p1');
  });

  test('Win condition: all resources >= 150', () => {
    const state = createState({ p1: { ore: 150, mana: 150, troops: 149 } });
    const { state: s, winner } = resolveCard('overtime', state, 'p1');
    expect(getP1(s).ore).toBe(154);
    expect(getP1(s).mana).toBe(150);
    expect(getP1(s).troops).toBe(153);
    expect(winner).toBe('p1');
  });

  test('Win condition: opponent tower <= 0', () => {
    const state = createState({ p1: {}, p2: { tower: 6, wall: 0 } });
    const { winner } = resolveCard('goblin_army', state, 'p1');
    expect(winner).toBe('p1');
  });

  test('LOSE_MINE respects minimum of 1', () => {
    const state = createState({ p1: { mine: 1 }, p2: { mine: 1 } });
    const { state: s } = resolveCard('earthquake', state, 'p1');
    expect(getP1(s).mine).toBe(1);
    expect(getP2(s).mine).toBe(1);
  });

  test('LOSE_ORE respects minimum of 0', () => {
    const state = createState({ p1: { ore: 0 }, p2: { ore: 0 } });
    const { state: s } = resolveCard('defective_ore', state, 'p1');
    expect(getP1(s).ore).toBe(0);
    expect(getP2(s).ore).toBe(0);
  });

  test('LOSE_TROOPS respects minimum of 0', () => {
    const state = createState({ p1: { troops: 0 }, p2: { troops: 0 } });
    const { state: s } = resolveCard('cow_rampage', state, 'p1');
    expect(getP1(s).troops).toBe(0);
    expect(getP2(s).troops).toBe(0);
  });

  test('ALL_WALLS_MINUS respects minimum of 0', () => {
    const state = createState({ p1: { wall: 3 }, p2: { wall: 2 } });
    const { state: s } = resolveCard('concussion', state, 'p1');
    expect(getP1(s).wall).toBe(0);
    expect(getP2(s).wall).toBe(0);
  });

  test('Wall at 0 + 0 damage = still 0', () => {
    const state = createState({ p1: {}, p2: { wall: 0, tower: 50 } });
    const { state: s } = resolveCard('fairy', state, 'p1');
    expect(getP2(s).wall).toBe(0);
    expect(getP2(s).tower).toBe(48);
  });

  test('IF_WALL_ZERO branch with wall=0', () => {
    const state = createState({ p1: { wall: 0 } });
    const { state: s } = resolveCard('foundation', state, 'p1');
    expect(getP1(s).wall).toBe(5);
  });

  test('IF_WALL_ZERO branch with wall>0', () => {
    const state = createState({ p1: { wall: 1 } });
    const { state: s } = resolveCard('foundation', state, 'p1');
    expect(getP1(s).wall).toBe(4);
  });

  test('SET_MINE_TO_OPPONENT when already equal', () => {
    const state = createState({ p1: { mine: 3 }, p2: { mine: 3 } });
    const { state: s } = resolveCard('steal_technology', state, 'p1');
    expect(getP1(s).mine).toBe(3);
  });

  test('ALL_TOWERS_MINUS with negative value adds to towers', () => {
    const state = createState({ p1: { tower: 50, mana: 0 }, p2: { tower: 40 } });
    const { state: s } = resolveCard('rainbow', state, 'p1');
    expect(getP1(s).tower).toBe(51);
    expect(getP2(s).tower).toBe(41);
    expect(getP1(s).mana).toBe(3);
  });

  test('ALL_BUILDINGS_PLUS_ONE increments all buildings for both', () => {
    const state = createState({
      p1: { mine: 1, monastery: 1, barracks: 1 },
      p2: { mine: 2, monastery: 3, barracks: 1 },
    });
    const { state: s } = resolveCard('innovations', state, 'p1');
    expect(getP1(s).mine).toBe(2);
    expect(getP1(s).monastery).toBe(2);
    expect(getP1(s).barracks).toBe(2);
    expect(getP2(s).mine).toBe(3);
    expect(getP2(s).monastery).toBe(4);
    expect(getP2(s).barracks).toBe(2);
  });

  test('ALL_MONASTERIES_EQUALIZE sets both to max', () => {
    const state = createState({ p1: { monastery: 1 }, p2: { monastery: 5 } });
    const { state: s } = resolveCard('parity', state, 'p1');
    expect(getP1(s).monastery).toBe(5);
    expect(getP2(s).monastery).toBe(5);
  });

  test('DAMAGE_IF_WALL_ZERO with wall=0 — max damage', () => {
    const state = createState({ p1: {}, p2: { wall: 0, tower: 50 } });
    const { state: s } = resolveCard('pest', state, 'p1');
    expect(getP2(s).tower).toBe(40);
  });

  test('DAMAGE_IF_WALL_ZERO with wall>0 — reduced damage', () => {
    const state = createState({ p1: {}, p2: { wall: 5, tower: 50 } });
    const { state: s } = resolveCard('pest', state, 'p1');
    expect(getP2(s).tower).toBe(44);
  });

  test('SWAP_WALLS correctly exchanges values', () => {
    const state = createState({ p1: { wall: 25 }, p2: { wall: 3 } });
    const { state: s } = resolveCard('shift', state, 'p1');
    expect(getP1(s).wall).toBe(3);
    expect(getP2(s).wall).toBe(25);
  });

  test('LOSE_BARRACKS respects minimum of 1', () => {
    const state = createState({ p1: { barracks: 1 } });
    const { state: s } = resolveCard('cave_in', state, 'p1');
    expect(getP1(s).barracks).toBe(1);
  });

  test('dragon tower damage overflow when wall < damage', () => {
    const state = createState({ p1: {}, p2: { wall: 5, tower: 50 } });
    const { state: s } = resolveCard('dragon', state, 'p1');
    expect(getP2(s).wall).toBe(0);
    expect(getP2(s).tower).toBe(35);
  });

  test('TOWER_DAMAGE_IF_GT_WALL with tower > wall — direct tower damage', () => {
    const state = createState({ p1: { tower: 50 }, p2: { wall: 10, tower: 50 } });
    const { state: s } = resolveCard('lightning', state, 'p1');
    expect(getP2(s).tower).toBe(42);
  });

  test('TOWER_DAMAGE_IF_GT_WALL with tower <= wall — damage all towers', () => {
    const state = createState({ p1: { tower: 5 }, p2: { wall: 10, tower: 50 } });
    const { state: s } = resolveCard('lightning', state, 'p1');
    expect(getP1(s).tower).toBe(-3);
    expect(getP2(s).tower).toBe(42);
  });
});

describe('Complex Interactions', () => {
  test('Chain: wall destroyed then tower damage in same card (DAMAGE effect)', () => {
    const state = createState({ p1: {}, p2: { wall: 15, tower: 50 } });
    const { state: s } = resolveCard('dragon', state, 'p1');
    expect(getP2(s).wall).toBe(0);
    expect(getP2(s).tower).toBe(45);
  });

  test('Card with 3 effects: meditation — tower, troops, ore', () => {
    const state = createState({ p1: { tower: 50, troops: 0, ore: 0 } });
    const { state: s } = resolveCard('meditation', state, 'p1');
    expect(getP1(s).tower).toBe(63);
    expect(getP1(s).troops).toBe(6);
    expect(getP1(s).ore).toBe(6);
  });

  test('Card with 4 effects: devil — damage, lose ore, lose mana, lose troops (all players)', () => {
    const state = createState({
      p1: { wall: 10, tower: 50, ore: 10, mana: 10, troops: 10 },
      p2: { wall: 10, tower: 50, ore: 10, mana: 10, troops: 10 },
    });
    const { state: s } = resolveCard('devil', state, 'p1');
    expect(getP2(s).wall).toBe(4);
    expect(getP2(s).tower).toBe(50);
    expect(getP1(s).ore).toBe(5);
    expect(getP1(s).mana).toBe(5);
    expect(getP1(s).troops).toBe(5);
    expect(getP2(s).ore).toBe(5);
    expect(getP2(s).mana).toBe(5);
    expect(getP2(s).troops).toBe(5);
  });

  test('allPlayers effect: earthquake hits both', () => {
    const state = createState({ p1: { mine: 5 }, p2: { mine: 2 } });
    const { state: s } = resolveCard('earthquake', state, 'p1');
    expect(getP1(s).mine).toBe(4);
    expect(getP2(s).mine).toBe(1);
  });

  test('allPlayers effect: discord — towers -7, monasteries -1', () => {
    const state = createState({
      p1: { tower: 10, monastery: 1 },
      p2: { tower: 10, monastery: 2 },
    });
    const { state: s } = resolveCard('discord', state, 'p1');
    expect(getP1(s).tower).toBe(3);
    expect(getP1(s).monastery).toBe(1);
    expect(getP2(s).tower).toBe(3);
    expect(getP2(s).monastery).toBe(1);
  });

  test('Self-lose chain: goblins loses own mana then deals damage', () => {
    const state = createState({ p1: { mana: 3 }, p2: { wall: 10, tower: 50 } });
    const { state: s } = resolveCard('goblins', state, 'p1');
    expect(getP1(s).mana).toBe(0);
    expect(getP2(s).wall).toBe(6);
  });

  test('Self-lose with not enough resources: warrior mana goes to 0', () => {
    const state = createState({ p1: { mana: 2 }, p2: { wall: 10, tower: 50 } });
    const { state: s } = resolveCard('warrior', state, 'p1');
    expect(getP1(s).mana).toBe(0);
    expect(getP2(s).wall).toBe(0);
    expect(getP2(s).tower).toBe(47);
  });

  test('Multiple allPlayers effects in sequence (devil)', () => {
    const state = createState({
      p1: { ore: 4, mana: 4, troops: 4 },
      p2: { wall: 6, tower: 50, ore: 4, mana: 4, troops: 4 },
    });
    const { state: s } = resolveCard('devil', state, 'p1');
    expect(getP2(s).wall).toBe(0);
    expect(getP2(s).tower).toBe(50);
    expect(getP1(s).ore).toBe(0);
    expect(getP1(s).mana).toBe(0);
    expect(getP1(s).troops).toBe(0);
    expect(getP2(s).ore).toBe(0);
    expect(getP2(s).mana).toBe(0);
    expect(getP2(s).troops).toBe(0);
  });

  test('Damage with 0 wall goes straight to tower', () => {
    const state = createState({ p1: {}, p2: { wall: 0, tower: 50 } });
    const { state: s } = resolveCard('orc', state, 'p1');
    expect(getP2(s).wall).toBe(0);
    expect(getP2(s).tower).toBe(45);
  });

  test('Rainbow: ALL_TOWERS_MINUS with -1 adds to all towers', () => {
    const state = createState({ p1: { tower: 50, mana: 0 }, p2: { tower: 50 } });
    const { state: s } = resolveCard('rainbow', state, 'p1');
    expect(getP1(s).tower).toBe(51);
    expect(getP2(s).tower).toBe(51);
    expect(getP1(s).mana).toBe(3);
  });

  test('Thief: complex 4-effect — opponent loses, self gains', () => {
    const state = createState({
      p1: { mana: 0, ore: 0 },
      p2: { mana: 20, ore: 15 },
    });
    const { state: s } = resolveCard('thief', state, 'p1');
    expect(getP2(s).mana).toBe(10);
    expect(getP2(s).ore).toBe(10);
    expect(getP1(s).mana).toBe(5);
    expect(getP1(s).ore).toBe(2);
  });

  test('Vampire: 10 damage overflow to tower with small wall', () => {
    const state = createState({ p1: {}, p2: { wall: 3, tower: 50, troops: 10, barracks: 3 } });
    const { state: s } = resolveCard('vampire', state, 'p1');
    expect(getP2(s).wall).toBe(0);
    expect(getP2(s).tower).toBe(43);
    expect(getP2(s).troops).toBe(5);
    expect(getP2(s).barracks).toBe(2);
  });

  test('Large vein: conditional + ADD_MINE (allPlayers not handled)', () => {
    const state = createState({ p1: { mine: 1 }, p2: { mine: 5 } });
    const { state: s } = resolveCard('large_vein', state, 'p1');
    expect(getP1(s).mine).toBe(4);
    expect(getP2(s).mine).toBe(5);
  });

  test('Barracks card: 3 effects with conditional building', () => {
    const state = createState({ p1: { barracks: 1, troops: 0, wall: 10 }, p2: { barracks: 5 } });
    const { state: s } = resolveCard('barracks', state, 'p1');
    expect(getP1(s).troops).toBe(6);
    expect(getP1(s).wall).toBe(16);
    expect(getP1(s).barracks).toBe(2);
  });

  test('DAMAGE_IF_WALL_GT with wall > 10 vs wall <= 10', () => {
    const stateHighWall = createState({ p1: {}, p2: { wall: 15, tower: 50 } });
    const { state: s1 } = resolveCard('poison_cloud', stateHighWall, 'p1');
    expect(getP2(s1).tower).toBe(40);

    const stateLowWall = createState({ p1: {}, p2: { wall: 5, tower: 50 } });
    const { state: s2 } = resolveCard('poison_cloud', stateLowWall, 'p1');
    expect(getP2(s2).tower).toBe(43);
  });

  test('DAMAGE_IF_MONASTERY_GT with monastery > vs <=', () => {
    const stateHigher = createState({ p1: { monastery: 5 }, p2: { monastery: 3, tower: 50 } });
    const { state: s1 } = resolveCard('unicorn', stateHigher, 'p1');
    expect(getP2(s1).tower).toBe(38);

    const stateLower = createState({ p1: { monastery: 1 }, p2: { monastery: 5, tower: 50 } });
    const { state: s2 } = resolveCard('unicorn', stateLower, 'p1');
    expect(getP2(s2).tower).toBe(42);
  });

  test('Win detected after damage card that reduces tower to 0', () => {
    const state = createState({ p1: {}, p2: { wall: 0, tower: 6 } });
    const { winner } = resolveCard('goblin_army', state, 'p1');
    expect(winner).toBe('p1');
  });

  test('No win when towers are still positive after card', () => {
    const state = createState({ p1: { tower: 50 }, p2: { tower: 50 } });
    const { winner } = resolveCard('orc', state, 'p1');
    expect(winner).toBeNull();
  });
});
