import { useRef } from "react";
import { Howl } from "howler";

import { soundDefinitions, type SoundName } from "./sounds";

export function useSound(enabled: boolean) {
  const soundsRef = useRef<Record<SoundName, Howl | null> | null>(null);

  if (soundsRef.current === null) {
    soundsRef.current = Object.fromEntries(
      Object.entries(soundDefinitions).map(([name, definition]) => [
        name,
        definition.src?.length
          ? new Howl({
              src: definition.src,
              volume: definition.volume,
            })
          : null,
      ]),
    ) as Record<SoundName, Howl | null>;
  }

  function playSound(name: SoundName) {
    if (!enabled) {
      return;
    }

    soundsRef.current?.[name]?.play();
  }

  return { playSound };
}
