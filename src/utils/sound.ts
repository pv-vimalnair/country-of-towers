import { Audio } from "expo-av";

let sounds: Record<string, Audio.Sound> = {};

async function loadSound(name: string, file: any) {
  const { sound } = await Audio.Sound.createAsync(file, { volume: 0.5 });
  sounds[name] = sound;
}

export async function initSounds() {
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
}

export async function playSound(name: string) {
  try {
    const sound = sounds[name];
    if (sound) {
      await sound.replayAsync();
    } else {
      console.log(`[SOUND] ${name}`);
    }
  } catch (e) {
    /* silent fail */
  }
}
