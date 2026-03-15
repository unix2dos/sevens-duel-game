import { Container, Graphics, Sprite, Ticker } from "pixi.js";

import { cardMetrics, cardTheme } from "./cardTheme";
import type { CardFaceVariant } from "./cardSvg";
import { suitInk } from "./cardGlyphs";
import { getCardBackTexture, getCardFaceTexture } from "./cardSvg";
import { CARD_FLIP_DURATION_MS } from "../suitCelebration";
import type { Actor } from "../../../game/core/state";
import type { Card } from "../../../game/core/types";

interface PokerCardSpriteOptions {
  card: Card;
  height: number;
  isInteractive: boolean;
  isSelected?: boolean;
  isLegal: boolean;
  onPress?: (cardId: string) => void;
  animateEntrance?: boolean;
  owner?: Actor;
  replayFlip?: boolean;
  flipDelay?: number;
  flipStartTime?: number; // Absolute timestamp when the celebration started
  faceVariant?: CardFaceVariant;
  width: number;
}

export function createPokerCardSprite({
  card,
  height,
  isInteractive,
  isSelected = false,
  isLegal,
  onPress,
  animateEntrance = true,
  owner,
  replayFlip = false,
  flipDelay = 0,
  flipStartTime = 0,
  faceVariant = "standard",
  width,
}: PokerCardSpriteOptions) {
  const root = new Container();
  const glow = new Graphics();
  const shadow = new Graphics();
  const cardSurface = new Container();
  const faceSprite = new Sprite(getCardFaceTexture(card, faceVariant));
  const backSprite = new Sprite(getCardBackTexture());
  const baseSurfaceY = height / 2;

  glow.roundRect(0, 0, width, height, cardMetrics.radius + 6).fill({
    alpha: isLegal ? 0.35 : 0.12,
    color: suitInk(card) === "warm" ? cardTheme.glowWarm : cardTheme.glowLegal,
  });
  shadow.roundRect(0, 0, width, height, cardMetrics.radius).fill({
    alpha: cardMetrics.shadowAlpha,
    color: cardTheme.shadow,
  });
  shadow.position.y = cardMetrics.shadowOffsetY;
  cardSurface.pivot.set(width / 2, height / 2);
  cardSurface.position.set(width / 2, baseSurfaceY);
  faceSprite.anchor.set(0.5);
  faceSprite.position.set(width / 2, height / 2);
  faceSprite.width = width;
  faceSprite.height = height;
  faceSprite.visible = true;
  backSprite.anchor.set(0.5);
  backSprite.position.set(width / 2, height / 2);
  backSprite.width = width;
  backSprite.height = height;
  backSprite.visible = false;

  const isFlipResolved =
    replayFlip &&
    flipStartTime > 0 &&
    Date.now() > flipStartTime + flipDelay + CARD_FLIP_DURATION_MS;

  if (isFlipResolved) {
    cardSurface.scale.x = 1;
    faceSprite.visible = false;
    backSprite.visible = true;
  }

  cardSurface.addChild(backSprite, faceSprite);
  root.addChild(glow, shadow, cardSurface);

  if (owner) {
    const badge = new Graphics();
    const badgeColor = owner === "player" ? 0x3b82f6 : 0xef4444;
    
    badge
      .circle(width - 14, 14, 4.5)
      .fill({ color: badgeColor, alpha: 0.95 })
      .stroke({ color: 0xffffff, alpha: 0.9, width: 1.5 });
      
    root.addChild(badge);
  }

  if (!isLegal) {
    root.alpha = 0.94;
  }

  const targetRootAlpha = isLegal ? 1 : 0.94;

  if (animateEntrance) {
    // Entrance micro-animation
    const slideOffset = 15;
    cardSurface.y += slideOffset;
    shadow.y += slideOffset;
    glow.y += slideOffset;
    root.alpha = 0;

    const animateIn = () => {
      cardSurface.y += (baseSurfaceY - cardSurface.y) * 0.2;
      shadow.y += (cardMetrics.shadowOffsetY - shadow.y) * 0.2;
      glow.y += (0 - glow.y) * 0.2;

      if (root.alpha < targetRootAlpha) {
        root.alpha += (targetRootAlpha - root.alpha) * 0.15;
      }

      if (Math.abs(cardSurface.y - baseSurfaceY) < 0.5) {
        cardSurface.y = baseSurfaceY;
        shadow.y = cardMetrics.shadowOffsetY;
        glow.y = 0;
        root.alpha = targetRootAlpha;
        Ticker.shared.remove(animateIn);
      }
    };

    Ticker.shared.add(animateIn);
    root.on("destroyed", () => Ticker.shared.remove(animateIn));
  } else {
    root.alpha = targetRootAlpha;
  }

  if (replayFlip && !isFlipResolved) {
    const minScale = 0.08;
    const targetTime = flipStartTime + flipDelay;
    const phaseDuration = CARD_FLIP_DURATION_MS / 2;

    const animateFlip = () => {
      const now = Date.now();

      if (now < targetTime) {
        cardSurface.scale.x = 1;
        faceSprite.visible = true;
        backSprite.visible = false;
        return;
      }

      const elapsedSinceStart = now - targetTime;

      if (elapsedSinceStart >= CARD_FLIP_DURATION_MS) {
        cardSurface.scale.x = 1;
        faceSprite.visible = false;
        backSprite.visible = true;
        Ticker.shared.remove(animateFlip);
        return;
      }

      if (elapsedSinceStart < phaseDuration) {
        const progress = elapsedSinceStart / phaseDuration;
        faceSprite.visible = true;
        backSprite.visible = false;
        cardSurface.scale.x = Math.max(minScale, 1 - progress);
        return;
      }

      const progress = (elapsedSinceStart - phaseDuration) / phaseDuration;
      faceSprite.visible = false;
      backSprite.visible = true;
      cardSurface.scale.x = Math.max(minScale, progress);
    };

    Ticker.shared.add(animateFlip);
    root.on("destroyed", () => Ticker.shared.remove(animateFlip));
  }

  if (isInteractive) {
    root.eventMode = "static";
    root.cursor = "pointer";
    root.on("pointertap", () => onPress?.(card.id));
  }

  // Dark Night Flowing Gold selected effect
  if (isSelected) {
    // --- Particle System ---
    const particlesContainer = new Container();
    // Insert particles behind card surface but above glow
    root.addChildAt(particlesContainer, root.getChildIndex(cardSurface));

    const NUM_PARTICLES = 250;
    const particles: { g: Graphics, x: number, y: number, vx: number, vy: number, life: number, maxLife: number, baseScale: number }[] = [];

    for (let i = 0; i < NUM_PARTICLES; i++) {
        const p = new Graphics();
        // Determine color: mostly gold/orange, some red, few white for extreme heat
        const rand = Math.random();
        let color = 0xffd700; // Gold
        if (rand < 0.15) color = 0xffffff; // White core (hottest)
        else if (rand < 0.5) color = 0xffa500; // Bright orange
        else if (rand < 0.8) color = 0xff4500; // Deep orange-red
        
        // Larger, more diffuse glow for fire
        p.circle(0, 0, 12).fill({ color, alpha: 0.18 });
        p.circle(0, 0, 4).fill({ color: 0xffffff, alpha: 0.85 });
        p.blendMode = "add";
        p.visible = false;
        particlesContainer.addChild(p);
        particles.push({ g: p, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0, baseScale: 1 });
    }

    const emitParticle = (isBurst = false) => {
        // Find a dead particle
        const p = particles.find(p => p.life <= 0);
        if (p) {
            if (isBurst) {
                // Dramatic burst outward
                p.x = width / 2;
                p.y = height / 2;
                const angle = Math.random() * Math.PI * 2;
                const speed = 5 + Math.random() * 12; // Extremely fast burst
                p.vx = Math.cos(angle) * speed;
                p.vy = Math.sin(angle) * speed - 3; 
            } else {
                // Fire usually spawns densely around the bottom and sides
                const side = Math.random();
                if (side < 0.7) {
                    // Base of the flame (bottom edge)
                    p.x = -15 + Math.random() * (width + 30);
                    p.y = height - 10 + Math.random() * 25;
                } else {
                    // Sizzling up the sides
                    p.x = Math.random() < 0.5 ? -20 : width + 20;
                    p.y = height * 0.1 + Math.random() * height * 0.9;
                }
                
                p.vx = (Math.random() - 0.5) * 4.0; // wide chaotic spread
                p.vy = -4 - Math.random() * 8.0; // Fast violently upwards flow
            }
            
            p.maxLife = 20 + Math.random() * 35; // Shorter lived but faster
            p.life = p.maxLife;
            p.baseScale = 0.6 + Math.random() * 1.8; // Massive particles
            p.g.scale.set(p.baseScale);
            p.g.position.set(p.x, p.y);
            p.g.visible = true;
            p.g.alpha = 1;
        }
    };

    // Huge initial explosion on selection
    for(let i = 0; i < 80; i++) emitParticle(true);

    let time = 0;
    const updateSelectedEffect = (ticker: Ticker) => {
      time += ticker.deltaTime * 0.08;
      const breathe = (Math.sin(time) + 1) / 2; 
      
      // Intense golden glow breathing
      glow.alpha = 0.6 + breathe * 0.4; // Brighter floor
      glow.tint = 0xffd700; 
      
      // Levitation breathing
      const scaleAdd = breathe * 0.03;
      cardSurface.scale.set(1.02 + scaleAdd);
      glow.scale.set(1.01 + scaleAdd);
      
      shadow.scale.set(1.0 + scaleAdd * 0.5);
      shadow.alpha = cardMetrics.shadowAlpha - 0.2; 
      shadow.y = cardMetrics.shadowOffsetY + 12; 

      // Update particles
      // Continuous violent emission
      for (let i = 0; i < 4; i++) {
          if (Math.random() < 0.9) emitParticle(false);
      }

      for (const p of particles) {
          if (p.life > 0) {
              p.life -= ticker.deltaTime;
              if (p.life <= 0) {
                  p.g.visible = false;
              } else {
                  p.x += p.vx * ticker.deltaTime;
                  p.y += p.vy * ticker.deltaTime;
                  // Fire flutter and heat distortion
                  p.x += Math.sin(time * 5 + p.life) * 1.5 * ticker.deltaTime;
                  
                  p.g.position.set(p.x, p.y);
                  
                  const lifeRatio = Math.max(0, p.life / p.maxLife);
                  // Ease out alpha sharply for fire tip fade
                  p.g.alpha = Math.pow(lifeRatio, 1.5); 
                  // Shrink aggressively as it burns out
                  p.g.scale.set(p.baseScale * (0.1 + 0.9 * lifeRatio)); 
              }
          }
      }
    };

    Ticker.shared.add(updateSelectedEffect);
    root.on("destroyed", () => Ticker.shared.remove(updateSelectedEffect));
  } else {
    // Reset to base legal/illegal states cleanly
    glow.tint = 0xffffff; // Remove tint
  }

  return root;
}
