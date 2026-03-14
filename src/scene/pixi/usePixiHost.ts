import { useEffect, useRef, useState } from "react";
import { Application } from "pixi.js";

import { createPixiInitOptions } from "./pixiOptions";

export function usePixiHost() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const [readyToken, setReadyToken] = useState(0);

  useEffect(() => {
    if (import.meta.env.MODE === "test") {
      return;
    }

    let active = true;
    const app = new Application();

    async function mount() {
      if (!hostRef.current) {
        return;
      }

      await app.init(createPixiInitOptions(hostRef.current));

      if (!active || !hostRef.current) {
        app.destroy(true, { children: true });
        return;
      }

      appRef.current = app;
      hostRef.current.replaceChildren(app.canvas);
      setReadyToken((token) => token + 1);
    }

    void mount();

    return () => {
      active = false;
      appRef.current?.destroy(true, { children: true });
      appRef.current = null;
    };
  }, []);

  return { appRef, hostRef, readyToken };
}
