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
  const cx = width / 2;
  const cy = height / 2;

  // 1. Desaturate the entire board (keep this for mood)
  const desaturate = new ColorMatrixFilter();
  desaturate.desaturate();

  // 2. Focused Glitch/CRT tear
  const glitch = new GlitchFilter({
    slices: 5, // localized tear instead of broken screen
    offset: 50,
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

  // Intense localized red glare behind modal
  const glare = new Graphics().circle(cx, cy, 350).fill({ color: 0xff0000, alpha: 0.15 });
  glare.blendMode = "add";
  container.addChild(glare);

  // Distressed particles (horizontal noise slicing across the modal area)
  const particles: { s: Graphics; x: number; y: number; vx: number }[] = [];
  for (let i = 0; i < 60; i++) {
      const g = new Graphics();
      g.rect(0, 0, 10 + Math.random() * 80, 1 + Math.random() * 2).fill({ color: 0xff0044, alpha: 0.8 });
      g.blendMode = "add";
      container.addChild(g);
      particles.push({
          s: g,
          // Constrain mostly to the center Y belt where the modal is
          x: cx + (Math.random() - 0.5) * 600,
          y: cy + (Math.random() - 0.5) * 200,
          vx: (Math.random() < 0.5 ? -1 : 1) * (25 + Math.random() * 40),
      });
  }

  let time = 0;
  const DURATION = 200; // frames (~3.3 seconds)

  const ticker = (t: Ticker) => {
      time += t.deltaTime;

      // Jerky glitch animation focused around the modal
      if (Math.random() < 0.25) {
          glitch.offset = Math.random() * 20 * (time < 80 ? 1 : 0.1); 
          glitch.slices = 3 + Math.random() * 10;
          glitch.seed = Math.random();
      }

      // Glare pulse
      glare.alpha = 0.1 + Math.abs(Math.sin(time * 0.3)) * 0.1;

      // Particle noise
      for (const p of particles) {
          p.x += p.vx * t.deltaTime;
          if (p.x > cx + 400) p.x = cx - 400;
          if (p.x < cx - 400) p.x = cx + 400;
          p.s.position.set(p.x, p.y);
          
          if (time > 100) p.s.alpha -= 0.05;
      }

      if (time > DURATION) {
          Ticker.shared.remove(ticker);
          onComplete(); // resolve the logical completion early
          
          if (container.parent && container.parent.filters) {
              const remainingFilters = container.parent.filters.filter(
                (filter) => filter !== desaturate && filter !== glitch,
              );
              if (remainingFilters.length === 0) {
                  container.parent.filters = null;
              } else {
                  container.parent.filters = remainingFilters;
              }
          }
          
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
  const cx = width / 2;
  const cy = height / 2;

  // Dark vignette focused more heavily on the center behind the modal
  const bg = new Graphics();
  bg.circle(cx, cy, 400).fill({ color: 0x050505, alpha: 0.85 });
  bg.alpha = 0;
  container.addChild(bg);

  // Blackhole distortion (localized)
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

  for (let i = 0; i < 150; i++) {
      const p = new Graphics();
      p.circle(0, 0, 1 + Math.random() * 3).fill({ color: 0x8888aa, alpha: 0.8 });
      p.blendMode = "add";
      container.addChild(p);

      const angle = Math.random() * Math.PI * 2;
      // Start closer since the effect is localized
      const dist = 100 + Math.random() * 400; 
      particles.push({
          s: p,
          x: 0, y: 0,
          angle, dist,
          speed: 10 + Math.random() * 20, // Fast
      });
  }

  let time = 0;
  const DURATION = 260; // frames (~4.3 seconds)

  const ticker = (t: Ticker) => {
      time += t.deltaTime;

      // Darken localized area
      if (time < 60) {
          bg.alpha = (time / 60) * 0.95;
      }

      // Suck in distortion (with smaller radius so it doesn't break the edges of the board)
      if (time < 120) {
          bulge.radius = (time / 120) * 400; // max 400px radius
          bulge.strength = -((time / 120) * 0.8); // Less extreme pinch
      } else {
          // Release slightly into a lingering void
          bulge.strength = -0.8 + ((time - 120) / 100) * 0.2;
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
          onComplete(); // resolve the logical completion early
          
          if (container.parent && container.parent.filters) {
              const remainingFilters = container.parent.filters.filter(
                (filter) => filter !== bulge,
              );
              if (remainingFilters.length === 0) {
                  container.parent.filters = null;
              } else {
                  container.parent.filters = remainingFilters;
              }
          }
          
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
