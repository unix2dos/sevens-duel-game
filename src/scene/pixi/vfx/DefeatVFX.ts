import { Container, Graphics, Ticker, ColorMatrixFilter } from "pixi.js";
import { GlitchFilter, BulgePinchFilter } from "pixi-filters";

export async function playDefeatVFX(
  stage: Container,
  width: number,
  height: number
): Promise<void> {
  const vfxContainer = new Container();
  vfxContainer.zIndex = 1000;
  stage.addChild(vfxContainer);

  const style = Math.random() < 0.5 ? "shatter" : "void";

  return new Promise((resolve) => {
    if (style === "shatter") {
      playShatteredReality(vfxContainer, width, height, resolve);
    } else {
      playVoidConsumption(vfxContainer, width, height, resolve);
    }
  });
}

function playShatteredReality(
  container: Container,
  width: number,
  height: number,
  onComplete: () => void
) {
  // 1. Desaturate the entire board
  const desaturate = new ColorMatrixFilter();
  desaturate.desaturate();

  // 2. Aggressive Glitch/CRT tear
  const glitch = new GlitchFilter({
    slices: 15,
    offset: 200,
    direction: 90,
    fillMode: 0,
    average: false,
    red: [2, 0],
    green: [-2, 0],
    blue: [0, 2],
  });

  if (container.parent) {
      const existingFilters = container.parent.filters || [];
      container.parent.filters = [...existingFilters, desaturate, glitch];
  }

  // Red vignette warning
  const vignette = new Graphics();
  vignette.rect(0, 0, width, height).fill({ color: 0xff0000, alpha: 0.25 });
  vignette.blendMode = "multiply";
  vignette.alpha = 0;
  container.addChild(vignette);

  // Distressed particles (horizontal noise)
  const particles: { s: Graphics; x: number; y: number; vx: number }[] = [];
  for (let i = 0; i < 40; i++) {
      const g = new Graphics();
      g.rect(0, 0, 10 + Math.random() * 50, 2 + Math.random() * 2).fill({ color: 0xffffff, alpha: 0.6 });
      g.blendMode = "add";
      container.addChild(g);
      particles.push({
          s: g,
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() < 0.5 ? -1 : 1) * (15 + Math.random() * 30),
      });
  }

  let time = 0;
  const DURATION = 160;

  const ticker = (t: Ticker) => {
      time += t.deltaTime;

      // Jerky glitch animation
      if (Math.random() < 0.2) {
          glitch.offset = Math.random() * 40 * (time < 60 ? 1 : 0.2); // Calm down slowly
          glitch.slices = 5 + Math.random() * 20;
          glitch.seed = Math.random();
      }

      // Slam down screen shake (heavy single jolt)
      if (time < 5 && container.parent) {
          container.parent.y = 80;
      } else if (time >= 5 && time < 10 && container.parent) {
          container.parent.y = -20;
      } else if (container.parent) {
          container.parent.y = 0;
      }

      // Red vignette blink
      vignette.alpha = Math.abs(Math.sin(time * 0.2)) * 0.8;

      // Particle noise
      for (const p of particles) {
          p.x += p.vx * t.deltaTime;
          if (p.x > width + 50) p.x = -50;
          if (p.x < -50) p.x = width + 50;
          p.s.position.set(p.x, p.y);
          
          if (time > 100) p.s.alpha -= 0.05;
      }

      if (time > DURATION) {
          Ticker.shared.remove(ticker);
          if (container.parent && container.parent.filters) {
              container.parent.filters = (container.parent.filters as any[]).filter(f => f !== desaturate && f !== glitch);
              if (container.parent.filters.length === 0) {
                  container.parent.filters = null;
              }
          }
          onComplete();
          
          const cleanup = (t2: Ticker) => {
            container.alpha -= 0.05 * t2.deltaTime;
            if (container.alpha <= 0) {
              Ticker.shared.remove(cleanup);
              container.destroy({ children: true });
            }
          };
          Ticker.shared.add(cleanup);
      }
  };

  Ticker.shared.add(ticker);
}

function playVoidConsumption(
  container: Container,
  width: number,
  height: number,
  onComplete: () => void
) {
  // Dark vignette
  const bg = new Graphics();
  bg.rect(0, 0, width, height).fill({ color: 0x050505, alpha: 0.85 });
  bg.alpha = 0;
  container.addChild(bg);

  // Blackhole distortion
  const bulge = new BulgePinchFilter({
      center: [0.5, 0.5],
      radius: 0,
      strength: 0, // Negative for pinch (suck in)
  });

  if (container.parent) {
      const existingFilters = container.parent.filters || [];
      container.parent.filters = [...existingFilters, bulge];
  }

  // Suction particles
  const particles: { s: Graphics; x: number; y: number; angle: number; dist: number; speed: number }[] = [];
  const cx = width / 2;
  const cy = height / 2;

  for (let i = 0; i < 150; i++) {
      const p = new Graphics();
      p.circle(0, 0, 1 + Math.random() * 3).fill({ color: 0x8888aa, alpha: 0.8 });
      p.blendMode = "add";
      container.addChild(p);

      const angle = Math.random() * Math.PI * 2;
      const dist = 300 + Math.random() * 800; // Start far away
      particles.push({
          s: p,
          x: 0, y: 0,
          angle, dist,
          speed: 10 + Math.random() * 20, // Fast
      });
  }

  let time = 0;
  const DURATION = 220;

  const ticker = (t: Ticker) => {
      time += t.deltaTime;

      // Darken
      if (time < 60) {
          bg.alpha = (time / 60) * 0.85;
      }

      // Suck in distortion
      if (time < 120) {
          bulge.radius = (time / 120) * 800;
          bulge.strength = -((time / 120) * 1.0); // Extreme pinch
      } else {
          // Release slightly into a lingering void
          bulge.strength = -1.0 + ((time - 120) / 100) * 0.2;
      }

      // Particle physics (spiral inward)
      for (const p of particles) {
          p.dist -= p.speed * t.deltaTime * (1 + (time / 100)); // Accelerate inward
          p.angle += 0.05 * t.deltaTime; // Swirl
          
          if (p.dist < 10) {
              p.s.visible = false; // "Sucked in"
          } else {
              p.x = cx + Math.cos(p.angle) * p.dist;
              p.y = cy + Math.sin(p.angle) * p.dist;
              p.s.position.set(p.x, p.y);
          }
      }

      if (time > DURATION) {
          Ticker.shared.remove(ticker);
          
          if (container.parent && container.parent.filters) {
              container.parent.filters = (container.parent.filters as any[]).filter(f => f !== bulge);
              if (container.parent.filters.length === 0) {
                  container.parent.filters = null;
              }
          }
          
          onComplete();
          
          const cleanup = (t2: Ticker) => {
            container.alpha -= 0.03 * t2.deltaTime;
            if (container.alpha <= 0) {
              Ticker.shared.remove(cleanup);
              container.destroy({ children: true });
            }
          };
          Ticker.shared.add(cleanup);
      }
  };

  Ticker.shared.add(ticker);
}
