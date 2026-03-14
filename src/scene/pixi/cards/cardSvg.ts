import { Texture } from "pixi.js";

import { isFaceRank, pipLayout, rankText, suitInk, suitSymbol } from "./cardGlyphs";
import type { Card } from "../../../game/core/types";

const ART_WIDTH = 300;
const ART_HEIGHT = 420;
const faceTextureCache = new Map<string, Texture>();
const faceTextureLoads = new Map<string, Promise<Texture>>();
const emptyTexture = Texture.EMPTY;
let backTexture: Texture | null = null;
let backTextureLoad: Promise<Texture> | null = null;

function inkColor(card: Card) {
  return suitInk(card) === "warm" ? "#8B0000" : "#1A1A1A"; // Deep dark red and near-black
}

function pipMarkup(card: Card) {
  const points = pipLayout(card.rank);
  const color = inkColor(card);
  const symbol = suitSymbol(card.suit);

  return points
    .map((point) => {
      const rotation = point.rotate ? "rotate(180 0 0)" : "";
      const x = Math.round(point.x * ART_WIDTH);
      const y = Math.round(point.y * ART_HEIGHT);

      return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="'Bodoni Moda', serif" font-size="40" fill="${color}" transform="${rotation}">${symbol}</text>`;
    })
    .join("");
}

function aceMarkup(card: Card) {
  return `
    <text x="${ART_WIDTH / 2}" y="${ART_HEIGHT / 2 - 12}" text-anchor="middle" dominant-baseline="middle"
      font-family="'Bodoni Moda', serif" font-size="110" fill="${inkColor(card)}">${suitSymbol(card.suit)}</text>
    <text x="${ART_WIDTH / 2}" y="${ART_HEIGHT / 2 + 54}" text-anchor="middle" dominant-baseline="middle"
      font-family="'Bodoni Moda', serif" font-size="24" letter-spacing="3" fill="#D4AF37">ACE</text>
  `;
}

function faceMarkup(card: Card) {
  const color = inkColor(card);
  const label = card.rank === "J" ? "JACK" : card.rank === "Q" ? "QUEEN" : "KING";
  const emblem = suitSymbol(card.suit);

  return `
    <g transform="translate(${ART_WIDTH / 2} ${ART_HEIGHT / 2})">
      <rect x="-70" y="-104" width="140" height="208" rx="64" fill="#fbf7ef" stroke="#d7c4a8" stroke-width="2.4"/>
      <rect x="-58" y="-92" width="116" height="184" rx="52" fill="url(#medallion)"/>
      <path d="M0 -84 L16 -52 L0 -58 L-16 -52 Z" fill="#D4AF37" opacity="0.9"/>
      <path d="M0 84 L16 52 L0 58 L-16 52 Z" fill="#D4AF37" opacity="0.9"/>
      <text x="0" y="-28" text-anchor="middle" font-family="'Bodoni Moda', serif" font-size="78" font-weight="700" fill="${color}">${rankText(card.rank)}</text>
      <text x="0" y="24" text-anchor="middle" font-family="'Bodoni Moda', serif" font-size="72" fill="${color}">${emblem}</text>
      <text x="0" y="68" text-anchor="middle" font-family="'Jost', sans-serif" font-size="16" letter-spacing="4" fill="#D4AF37">${label}</text>
      <text x="0" y="-118" text-anchor="middle" font-family="'Bodoni Moda', serif" font-size="28" fill="${color}">${emblem}</text>
      <text x="0" y="136" text-anchor="middle" font-family="'Bodoni Moda', serif" font-size="28" fill="${color}" transform="rotate(180 0 136)">${emblem}</text>
    </g>
  `;
}

function centerMarkup(card: Card) {
  if (card.rank === "A") {
    return aceMarkup(card);
  }

  if (isFaceRank(card.rank)) {
    return faceMarkup(card);
  }

  return pipMarkup(card);
}

function cornerMarkup(card: Card, mirrored = false) {
  const color = inkColor(card);
  const transform = mirrored ? `transform="translate(${ART_WIDTH - 34} ${ART_HEIGHT - 38}) rotate(180)"` : `transform="translate(28 38)"`;

  return `
    <g ${transform}>
      <text x="0" y="0" text-anchor="middle" dominant-baseline="middle"
        font-family="'Bodoni Moda', serif" font-size="34" font-weight="700" fill="${color}">${rankText(card.rank)}</text>
      <text x="0" y="28" text-anchor="middle" dominant-baseline="middle"
        font-family="'Bodoni Moda', serif" font-size="28" fill="${color}">${suitSymbol(card.suit)}</text>
    </g>
  `;
}

export function buildCardFaceSvg(card: Card) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${ART_WIDTH}" height="${ART_HEIGHT}" viewBox="0 0 ${ART_WIDTH} ${ART_HEIGHT}">
      <defs>
        <linearGradient id="paper" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="60%" stop-color="#fdfcfb"/>
          <stop offset="100%" stop-color="#eae6df"/>
        </linearGradient>
        <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
          <stop offset="45%" stop-color="#ffffff" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="medallion" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#f5f3ee"/>
        </linearGradient>
        <pattern id="paperNoise" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="6" r="1" fill="#d4af37" opacity="0.15"/>
          <circle cx="18" cy="11" r="1" fill="#d4af37" opacity="0.12"/>
          <circle cx="12" cy="19" r="1" fill="#d4af37" opacity="0.15"/>
        </pattern>
      </defs>
      <rect x="6" y="10" width="${ART_WIDTH - 12}" height="${ART_HEIGHT - 12}" rx="28" fill="#051a0d" fill-opacity="0.15"/>
      <rect x="0" y="0" width="${ART_WIDTH}" height="${ART_HEIGHT}" rx="26" fill="url(#paper)" stroke="#d4af37" stroke-width="2.4"/>
      <rect x="8" y="8" width="${ART_WIDTH - 16}" height="${ART_HEIGHT - 16}" rx="20" fill="none" stroke="#d4af37" stroke-width="1.2" opacity="0.6"/>
      <rect x="0" y="0" width="${ART_WIDTH}" height="${ART_HEIGHT}" rx="26" fill="url(#paperNoise)"/>
      <path d="M18 18 C88 8 150 18 282 10" stroke="url(#shine)" stroke-opacity="0.68" stroke-width="10" stroke-linecap="round" fill="none"/>
      ${cornerMarkup(card)}
      ${cornerMarkup(card, true)}
      ${centerMarkup(card)}
    </svg>
  `.trim();
}

/* We no longer render SVG for the back, we use the generated PNG texture */
export function buildCardBackSvg() {
  return ""; 
}

function textureKey(card: Card) {
  return `${card.suit}-${card.rank}`;
}

export function getCardFaceTexture(card: Card) {
  return faceTextureCache.get(textureKey(card)) ?? emptyTexture;
}

export function getCardBackTexture() {
  return backTexture ?? emptyTexture;
}

function loadSvgTexture(svg: string) {
  return new Promise<Texture>((resolve, reject) => {
    const image = new Image();

    image.decoding = "async";
    image.onload = () => resolve(Texture.from(image));
    image.onerror = () => reject(new Error("Failed to load SVG texture"));
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

export function preloadCardFaceTexture(card: Card) {
  const key = textureKey(card);

  if (faceTextureCache.has(key)) {
    return Promise.resolve(faceTextureCache.get(key)!);
  }

  if (!faceTextureLoads.has(key)) {
    faceTextureLoads.set(
      key,
      loadSvgTexture(buildCardFaceSvg(card)).then((texture) => {
        faceTextureCache.set(key, texture);
        return texture;
      }),
    );
  }

  return faceTextureLoads.get(key)!;
}

export function preloadCardBackTexture() {
  if (backTexture) {
    return Promise.resolve(backTexture);
  }

  if (!backTextureLoad) {
    backTextureLoad = new Promise<Texture>((resolve, reject) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => resolve(Texture.from(image));
      image.onerror = () => reject(new Error("Failed to load back texture"));
      image.src = "/assets/card-back.png"; 
    }).then((texture) => {
      backTexture = texture;
      return texture;
    });
  }

  return backTextureLoad;
}

export async function preloadCardTextures(cards: Card[]) {
  const uniqueCards = Array.from(new Map(cards.map((card) => [textureKey(card), card])).values());

  await Promise.all(uniqueCards.map((card) => preloadCardFaceTexture(card)));
}
