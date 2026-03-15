import { Container, Graphics, Ticker } from "pixi.js";
import { AdvancedBloomFilter, ShockwaveFilter, GodrayFilter } from "pixi-filters";

export async function playVictoryVFX(
  stage: Container,
  width: number,
  height: number
): Promise<void> {
  const vfxContainer = new Container();
  // Ensure VFX plays on top of everything else
  vfxContainer.zIndex = 1000;
  stage.addChild(vfxContainer);

  const style = Math.random() < 0.5 ? "gold" : "divine";

  return new Promise((resolve) => {
    if (style === "gold") {
      playExtravagantGold(vfxContainer, width, height, resolve);
    } else {
      playDivineAscension(vfxContainer, width, height, resolve);
    }
  });
}

function playExtravagantGold(
  container: Container,
  width: number,
  height: number,
  onComplete: () => void
) {
  // 1. Heavy Bloom Filter
  const bloom = new AdvancedBloomFilter({
    threshold: 0.2,
    bloomScale: 0, // Starts at 0, animates up
    brightness: 1,
    blur: 8,
  });
  container.filters = [bloom];

  // 2. Godrays
  const godrays = new GodrayFilter({
    alpha: 0,
    angle: 30,
    center: [width / 2, height],
    parallel: false,
    time: 0,
  });
  // Add to stage to affect the whole board, not just particles
  const bgRaysContainer = new Container();
  const bgRect = new Graphics().rect(0, 0, width, height).fill({ color: 0xffd700, alpha: 0.3 });
  bgRaysContainer.addChild(bgRect);
  bgRaysContainer.filters = [godrays];
  container.addChildAt(bgRaysContainer, 0);

  // 3. Gold Coins/Particles
  const NUM_COINS = 150;
  const coins: { s: Graphics; x: number; y: number; vx: number; vy: number; rotY: number; rotSpeed: number }[] = [];

  for (let i = 0; i < NUM_COINS; i++) {
    const coin = new Graphics();
    coin.circle(0, 0, 8 + Math.random() * 8).fill({ color: 0xffd700 });
    coin.circle(0, 0, 6 + Math.random() * 6).fill({ color: 0xffe885 }); // Inner highlight
    
    // Spawn from bottom center explosion
    const angle = (Math.PI / 1.5) * (Math.random() - 0.5) - Math.PI / 2;
    const speed = 15 + Math.random() * 25;
    
    container.addChild(coin);
    coins.push({
      s: coin,
      x: width / 2 + (Math.random() - 0.5) * 100,
      y: height + 50,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rotY: Math.random() * Math.PI,
      rotSpeed: 0.1 + Math.random() * 0.3,
    });
  }

  // Flash bang overlay
  const flash = new Graphics().rect(0, 0, width, height).fill({ color: 0xffffff, alpha: 0 });
  container.addChild(flash);

  let time = 0;
  const DURATION = 200; // frames (~3.3 seconds)

  const ticker = (t: Ticker) => {
    time += t.deltaTime;
    godrays.time += t.deltaTime * 0.02;

    // Flash intro
    if (time < 10) {
      flash.alpha = time / 10;
    } else if (time < 30) {
      flash.alpha = 1 - (time - 10) / 20;
    } else {
      flash.alpha = 0;
    }

    // Bloom animation
    if (time < 20) {
      bloom.bloomScale = (time / 20) * 2.5;
    } else {
      bloom.bloomScale = Math.max(0, 2.5 - ((time - 20) / 100));
    }
    
    // Godrays fade in
    if (time < 60) {
      godrays.alpha = Math.min(0.8, time / 40);
    }

    // Screen Shake (apply to parent stage momentarily)
    if (time < 40 && container.parent) {
      const shakeAmt = (40 - time) * 0.5;
      container.parent.x = (Math.random() - 0.5) * shakeAmt;
      container.parent.y = (Math.random() - 0.5) * shakeAmt;
    } else if (time > 40 && container.parent) {
      container.parent.x = 0;
      container.parent.y = 0;
    }

    // Physics
    for (const c of coins) {
      c.vy += 0.4 * t.deltaTime; // Gravity
      c.x += c.vx * t.deltaTime;
      c.y += c.vy * t.deltaTime;
      
      // Pseudo 3D coin flip
      c.rotY += c.rotSpeed * t.deltaTime;
      c.s.scale.y = Math.cos(c.rotY);
      c.s.position.set(c.x, c.y);
    }

    if (time > DURATION) {
      Ticker.shared.remove(ticker);
      if (container.parent) {
        container.parent.x = 0;
        container.parent.y = 0;
      }
      // Resolve BEFORE fully destroying so the UI can fade in over the lingering VFX
      onComplete();
      
      // Fade out cleanup
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

function playDivineAscension(
  container: Container,
  width: number,
  height: number,
  onComplete: () => void
) {
  // Darken background
  const darkBg = new Graphics().rect(0, 0, width, height).fill({ color: 0x000000, alpha: 0 });
  container.addChild(darkBg);

  // Shockwave
  const shockwave = new ShockwaveFilter(
    [width / 2, height / 2],
    {
      amplitude: 30,
      wavelength: 160,
      speed: 15,
      brightness: 2,
      radius: -1,
    }
  );
  
  // We need the shockwave to distort the underlying game board.
  // We apply it to the parent, but we must carefully clean it up.
  if (container.parent) {
      // Safely mix with existing filters if any
      const existingFilters = container.parent.filters || [];
      container.parent.filters = [...existingFilters, shockwave];
  }

  // Holy light shaft
  const lightShaft = new Graphics();
  lightShaft.rect(width / 2 - 150, 0, 300, height);
  lightShaft.fill({ color: 0xffffff, alpha: 0.8 });
  lightShaft.blendMode = "add";
  lightShaft.alpha = 0;
  container.addChild(lightShaft);

  // Floating embers/feathers
  const particles: { s: Graphics; x: number; y: number; vy: number; phase: number }[] = [];
  for (let i = 0; i < 60; i++) {
    const p = new Graphics();
    p.circle(0, 0, 3 + Math.random() * 4).fill({ color: 0xffffff, alpha: 0.8 });
    p.circle(0, 0, 1.5).fill({ color: 0xffffff, alpha: 1 });
    p.blendMode = "add";
    p.alpha = 0;
    container.addChild(p);
    particles.push({
      s: p,
      x: Math.random() * width,
      y: height + Math.random() * 200,
      vy: -1 - Math.random() * 3,
      phase: Math.random() * Math.PI * 2,
    });
  }

  let time = 0;
  const DURATION = 200; // frames (~3.3 seconds)

  const ticker = (t: Ticker) => {
    time += t.deltaTime;

    // Sequence timing
    if (time < 20) {
      // Instant blackout
      darkBg.alpha = time / 20 * 0.85;
    }
    
    // Shockwave expands
    shockwave.time += t.deltaTime * 0.015;

    // Light shaft slams down
    if (time > 30 && time < 40) {
        lightShaft.alpha = (time - 30) / 10;
    } else if (time >= 40) {
        // Lingering pulsing light
        lightShaft.alpha = 0.5 + Math.sin(time * 0.1) * 0.1;
    }

    // Particles float up
    if (time > 30) {
        for (const p of particles) {
            p.y += p.vy * t.deltaTime;
            p.x += Math.sin(p.phase + time * 0.05) * 1 * t.deltaTime;
            p.s.position.set(p.x, p.y);
            
            // Fade particles in
            if (p.s.alpha < 1) p.s.alpha += 0.05;
        }
    }

    if (time > DURATION) {
      Ticker.shared.remove(ticker);
      
      // Cleanup parent filter
      if (container.parent && container.parent.filters) {
          const remainingFilters = container.parent.filters.filter(
            (filter) => filter !== shockwave,
          );
          if (remainingFilters.length === 0) {
              container.parent.filters = null;
          } else {
              container.parent.filters = remainingFilters;
          }
      }

      onComplete();
      
      // Fade out
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
