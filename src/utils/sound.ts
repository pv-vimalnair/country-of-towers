import { Audio } from "expo-av";

let sounds: Record<string, Audio.Sound> = {};
let initialized = false;

// Generate simple placeholder sounds using Web Audio API (for web)
// Fallback to console beep for native

export async function initSounds() {
  if (initialized) return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
    });
    // Preload all sounds -- using expo-av's ability to play from memory
    await Promise.all([
      loadGeneratedSound("cardPlay", { frequency: 440, duration: 0.15, type: "sine", fadeOut: true }),
      loadGeneratedSound("damage", { frequency: 150, duration: 0.3, type: "square", fadeOut: true }),
      loadGeneratedSound("victory", { frequency: 880, duration: 0.8, type: "sine", notes: [523, 659, 784, 1047] }),
      loadGeneratedSound("defeat", { frequency: 220, duration: 0.6, type: "sawtooth", notes: [440, 349, 294, 220] }),
      loadGeneratedSound("tick", { frequency: 1000, duration: 0.08, type: "sine" }),
    ]);
    initialized = true;
  } catch (e) {
    console.warn("Sound init failed:", e);
  }
}

async function loadGeneratedSound(name: string, config: { frequency: number; duration: number; type: string; fadeOut?: boolean; notes?: number[] }) {
  try {
    // For now, create a silent placeholder that we can replace with real assets later
    // The sound will be loaded from assets/sounds/ if available
    const soundModule = await tryLoadAsset(name);
    if (soundModule) {
      const { sound } = await Audio.Sound.createAsync(soundModule, { volume: 0.5 });
      sounds[name] = sound;
    }
  } catch (e) {
    // Fallback: sound not loaded, console log only
    (sounds as any)[name] = null;
  }
}

async function tryLoadAsset(name: string): Promise<any> {
  // Try to load from assets/sounds/ -- will fail gracefully if file doesn't exist
  const assetMap: Record<string, any> = {
    cardPlay: require("../../assets/sounds/card-play.mp3"),
    damage: require("../../assets/sounds/damage.mp3"),
    victory: require("../../assets/sounds/victory.mp3"),
    defeat: require("../../assets/sounds/defeat.mp3"),
    tick: require("../../assets/sounds/tick.mp3"),
  };
  return assetMap[name];
}

export async function playSound(name: string) {
  try {
    const sound = sounds[name];
    if (sound) {
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } else {
      console.log(`[SOUND] ${name}`);
    }
  } catch (e) {
    /* silent fail */
  }
}

export async function unloadSounds() {
  for (const sound of Object.values(sounds)) {
    if (sound) await sound.unloadAsync();
  }
  sounds = {};
  initialized = false;
}
