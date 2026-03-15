import { useEffect, useRef } from "react";
import { Howl } from "howler";

import { soundDefinitions, type SoundName } from "./sounds";

export function useSound(enabled: boolean) {
  const soundsRef = useRef<Partial<Record<SoundName, Howl | null>>>({});

  useEffect(() => {
    return () => {
      for (const sound of Object.values(soundsRef.current)) {
        sound?.unload();
      }
    };
  }, []);

  function getSound(name: SoundName) {
    if (name in soundsRef.current) {
      return soundsRef.current[name] ?? null;
    }

    const definition = soundDefinitions[name];

    if (!definition.src?.length) {
      soundsRef.current[name] = null;

      return null;
    }

    let sound: Howl | null = null;

    sound = new Howl({
      src: definition.src,
      volume: definition.volume,
      onplayerror: () => {
        sound?.once("unlock", () => {
          sound?.play();
        });
      },
    });

    soundsRef.current[name] = sound;

    return sound;
  }

  function playSound(name: SoundName) {
    if (!enabled) {
      return;
    }

    try {
      getSound(name)?.play();
    } catch {
      // Swallow playback failures so UI interactions never crash the app.
    }
  }

  return { playSound };
}
