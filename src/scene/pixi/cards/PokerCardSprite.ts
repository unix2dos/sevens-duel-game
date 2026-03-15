import { Container, Graphics, Sprite, Ticker } from "pixi.js";

// Animation to show a card being rejected
export function playShakeAnimation(target: Container) {
  const DURATION = 20; // very fast (~0.33s)
  const shakeAmount = 8;
  const originalX = target.x;

  let time = 0;
  const animateShake = (ticker: Ticker) => {
    time += ticker.deltaTime;

    if (time < DURATION) {
      // Fast sine wave shake left and right
      target.x = originalX + Math.sin(time * 1.5) * shakeAmount * (1 - time / DURATION);
    } else {
      target.x = originalX;
      Ticker.shared.remove(animateShake);
    }
  };

  Ticker.shared.add(animateShake);
  const _destroy = target.destroy;
  target.destroy = function(options) {
    Ticker.shared.remove(animateShake);
    if (_destroy) _destroy.call(this, options);
  };
}

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
  lastPlayedActor?: Actor;
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
  lastPlayedActor,
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
    root.alpha = 0.94; // Keep the slight transparent dimming for illegal cards
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
    const _destroyIn = root.destroy;
    root.destroy = function(options) {
      Ticker.shared.remove(animateIn);
      if (_destroyIn) _destroyIn.call(this, options);
    };
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
    const _destroyFlip = root.destroy;
    root.destroy = function(options) {
      Ticker.shared.remove(animateFlip);
      if (_destroyFlip) _destroyFlip.call(this, options);
    };
  }

  if (isInteractive) {
    root.eventMode = "static";
    root.cursor = "pointer";
    root.on("pointertap", () => onPress?.(card.id));
  }

  // Base lift for ALL selected cards (so you can pull out invalid cards to look at them)
  if (isSelected) {
     cardSurface.scale.set(1.02);
     glow.scale.set(1.01);
     shadow.scale.set(1.0);
     shadow.alpha = cardMetrics.shadowAlpha - 0.1;
     shadow.y = cardMetrics.shadowOffsetY + 8;
  }

  // Elegant Fire Selected Effect - ONLY FOR LEGAL CARDS
  if (isSelected && isLegal) {
    const particlesContainer = new Container();
    root.addChildAt(particlesContainer, root.getChildIndex(cardSurface));

    const NUM_PARTICLES = 70; // Balanced fire density
    const particles: { g: Graphics, x: number, y: number, vx: number, vy: number, life: number, maxLife: number, phase: number, baseScale: number }[] = [];

    for (let i = 0; i < NUM_PARTICLES; i++) {
        const p = new Graphics();
        
        // Fire colors
        const rand = Math.random();
        let color = 0xffffff;
        if (rand < 0.1) color = 0xffffff; // Hot core
        else if (rand < 0.4) color = 0xffe885; // Yellow
        else if (rand < 0.8) color = 0xff8c00; // Orange
        else color = 0xff3300; // Red-orange
        
        p.circle(0, 0, 8).fill({ color, alpha: 0.4 });
        p.circle(0, 0, 3).fill({ color: 0xffffff, alpha: 0.8 });
        p.blendMode = "add";
        p.visible = false;
        
        particlesContainer.addChild(p);
        particles.push({ g: p, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0, phase: Math.random() * Math.PI * 2, baseScale: 1 });
    }

    const emitParticle = () => {
        const p = particles.find(p => p.life <= 0);
        if (p) {
            // Spawn mostly at bottom and lower sides
            const spawnPos = Math.random();
            if (spawnPos < 0.7) { // Bottom edge
                p.x = -10 + Math.random() * (width + 20);
                p.y = height - 5 + Math.random() * 20;
            } else if (spawnPos < 0.85) { // Left lower edge
                p.x = -5 - Math.random() * 15;
                p.y = height * 0.4 + Math.random() * height * 0.6;
            } else { // Right lower edge
                p.x = width + 5 + Math.random() * 15;
                p.y = height * 0.4 + Math.random() * height * 0.6;
            }
            
            p.vx = (Math.random() - 0.5) * 1.5; 
            p.vy = -1.5 - Math.random() * 3.5; // Fast upward float
            
            p.maxLife = 25 + Math.random() * 30; 
            p.life = p.maxLife;
            p.baseScale = 0.4 + Math.random() * 0.8;
            p.g.scale.set(p.baseScale);
            p.g.position.set(p.x, p.y);
            p.g.visible = true;
            p.g.alpha = 1; // Instant bright spawn
        }
    };

    // Initial loud burst
    for(let i = 0; i < 30; i++) emitParticle();

    let time = 0;
    const updateSelectedEffect = (ticker: Ticker) => {
      time += ticker.deltaTime * 0.055; // Noticeable breathing speed
      const breathe = (Math.sin(time) + 1) / 2; // 0 to 1
      
      // Breathing glow
      glow.alpha = 0.4 + breathe * 0.5; // Deep pulse
      glow.tint = 0xffaa00; // Warm vivid gold/orange glow
      
      // Pronounced breathing levitation
      const scaleAdd = breathe * 0.04; // 4% extra scale on breath
      cardSurface.scale.set(1.02 + scaleAdd);
      glow.scale.set(1.01 + scaleAdd);
      
      shadow.scale.set(1.0 + scaleAdd * 0.5);
      shadow.alpha = cardMetrics.shadowAlpha - 0.2 + (breathe * 0.1); 
      shadow.y = cardMetrics.shadowOffsetY + 8 + (breathe * 4); 

      // Continuous emission
      for(let i = 0; i < 2; i++) {
         if (Math.random() < 0.6 * ticker.deltaTime) emitParticle();
      }

      for (const p of particles) {
          if (p.life > 0) {
              p.life -= ticker.deltaTime;
              if (p.life <= 0) {
                  p.g.visible = false;
              } else {
                  p.x += p.vx * ticker.deltaTime;
                  p.y += p.vy * ticker.deltaTime;
                  
                  // Fire flutter
                  p.phase += ticker.deltaTime * 0.1;
                  p.x += Math.sin(p.phase) * 0.8 * ticker.deltaTime;
                  
                  p.g.position.set(p.x, p.y);
                  
                  const lifeRatio = Math.max(0, p.life / p.maxLife);
                  // Fire fade out directly
                  p.g.alpha = lifeRatio * 1.5;
                  
                  // Shrink as it burns
                  p.g.scale.set(p.baseScale * (0.5 + 0.5 * lifeRatio));
              }
          }
      }
    };

    Ticker.shared.add(updateSelectedEffect);
    const _destroyEffect = root.destroy;
    root.destroy = function(options) {
      Ticker.shared.remove(updateSelectedEffect);
      if (_destroyEffect) _destroyEffect.call(this, options);
    };
  } else {
    // Reset to base legal/illegal states cleanly
    glow.tint = 0xffffff; // Remove tint
  }

  if (lastPlayedActor) {
    // Persistent glowing outline for the last card played globally
    const botHighlight = new Graphics();
    const borderThickness = 4;
    const highlightColor = lastPlayedActor === "player" ? 0xd4af37 : 0xef4444;
    
    botHighlight.roundRect(-borderThickness, -borderThickness, width + borderThickness * 2, height + borderThickness * 2, cardMetrics.radius + 4)
      .fill({ color: highlightColor, alpha: 0.0 }) // Transparent fill
      .stroke({ color: highlightColor, width: borderThickness, alignment: 1 });
    
    botHighlight.pivot.set(width / 2, height / 2);
    botHighlight.position.set(width / 2, baseSurfaceY);
    cardSurface.addChild(botHighlight);

    let highlightTime = 0;
    const animateHighlight = (ticker: Ticker) => {
      highlightTime += ticker.deltaTime * 0.05;
      // Pulse alpha between 0.4 and 0.9
      botHighlight.alpha = 0.4 + (Math.sin(highlightTime) + 1) * 0.25;
    };

    Ticker.shared.add(animateHighlight);
    const _destroyHighlight = root.destroy;
    root.destroy = function(options) {
      Ticker.shared.remove(animateHighlight);
      if (_destroyHighlight) _destroyHighlight.call(this, options);
    };
  }

  return root;
}
