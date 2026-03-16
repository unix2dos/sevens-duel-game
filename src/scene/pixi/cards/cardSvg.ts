import { Texture } from "pixi.js";

import { isFaceRank, pipLayout, rankText, suitInk, suitSymbol } from "./cardGlyphs";
import { resolveAssetUrl } from "../../../app/assetUrl";
import type { Card } from "../../../game/core/types";

const ART_WIDTH = 300;
const ART_HEIGHT = 420;
const cornerMetrics = {
  insetX: 42,
  insetY: 52,
  rankFontSize: 36,
  suitFontSize: 28,
  suitOffsetY: 30,
} as const;
export type CardFaceVariant = "standard" | "suit-emblem";
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
      const x = Math.round(point.x * ART_WIDTH);
      const y = Math.round(point.y * ART_HEIGHT);
      const rotation = point.rotate ? `transform="rotate(180 ${x} ${y})"` : "";

      return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="'Bodoni Moda', serif" font-size="40" fill="${color}" ${rotation}>${symbol}</text>`;
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
  const emblem = suitSymbol(card.suit);

  return `
    <g transform="translate(${ART_WIDTH / 2} ${ART_HEIGHT / 2})">
      <!-- Minimalist geometric representation for face cards instead of huge watermarks/badges -->
      <rect x="-60" y="-80" width="120" height="160" rx="16" fill="none" stroke="${color}" stroke-opacity="0.1" stroke-width="2"/>
      <text x="0" y="-20" text-anchor="middle" font-family="'Bodoni Moda', serif" font-size="64" font-weight="700" fill="${color}">${rankText(card.rank)}</text>
      <text x="0" y="32" text-anchor="middle" font-family="'Bodoni Moda', serif" font-size="48" fill="${color}">${emblem}</text>
    </g>
  `;
}

function suitEmblemMarkup(card: Card) {
  return `
    <g transform="translate(${ART_WIDTH / 2} ${ART_HEIGHT / 2})">
      <text x="0" y="12" text-anchor="middle" dominant-baseline="middle"
        font-family="'Bodoni Moda', serif" font-size="170" fill="${inkColor(card)}">${suitSymbol(card.suit)}</text>
    </g>
  `;
}

function centerMarkup(card: Card, faceVariant: CardFaceVariant) {
  if (faceVariant === "suit-emblem") {
    return suitEmblemMarkup(card);
  }

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
  const transform = mirrored
    ? `transform="translate(${ART_WIDTH - cornerMetrics.insetX} ${ART_HEIGHT - cornerMetrics.insetY}) rotate(180)"`
    : `transform="translate(${cornerMetrics.insetX} ${cornerMetrics.insetY})"`;

  return `
    <g ${transform}>
      <text x="0" y="0" text-anchor="middle" dominant-baseline="middle"
        font-family="'Bodoni Moda', serif" font-size="${cornerMetrics.rankFontSize}" font-weight="700" fill="${color}">${rankText(card.rank)}</text>
      <text x="0" y="${cornerMetrics.suitOffsetY}" text-anchor="middle" dominant-baseline="middle"
        font-family="'Bodoni Moda', serif" font-size="${cornerMetrics.suitFontSize}" fill="${color}">${suitSymbol(card.suit)}</text>
    </g>
  `;
}

interface BuildCardFaceSvgOptions {
  faceVariant?: CardFaceVariant;
}

export function buildCardFaceSvg(card: Card, { faceVariant = "standard" }: BuildCardFaceSvgOptions = {}) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${ART_WIDTH}" height="${ART_HEIGHT}" viewBox="0 0 ${ART_WIDTH} ${ART_HEIGHT}">
      <defs>
        <linearGradient id="paper" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#fdfcfb"/>
        </linearGradient>
      </defs>
      <!-- Pure clean base without inner dark shadows -->
      <rect x="0" y="0" width="${ART_WIDTH}" height="${ART_HEIGHT}" rx="26" fill="url(#paper)" stroke="#e4e4e4" stroke-width="1.5"/>
      ${faceVariant === "standard" ? `${cornerMarkup(card)}${cornerMarkup(card, true)}` : ""}
      ${centerMarkup(card, faceVariant)}
    </svg>
  `.trim();
}

/* We no longer render SVG for the back, we use the generated PNG texture */
export function buildCardBackSvg() {
  return ""; 
}

function textureKey(card: Card, faceVariant: CardFaceVariant) {
  return `${card.suit}-${card.rank}-${faceVariant}`;
}

export function getCardFaceTexture(card: Card, faceVariant: CardFaceVariant = "standard") {
  return faceTextureCache.get(textureKey(card, faceVariant)) ?? emptyTexture;
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

export function preloadCardFaceTexture(card: Card, faceVariant: CardFaceVariant = "standard") {
  const key = textureKey(card, faceVariant);

  if (faceTextureCache.has(key)) {
    return Promise.resolve(faceTextureCache.get(key)!);
  }

  if (!faceTextureLoads.has(key)) {
    faceTextureLoads.set(
      key,
      loadSvgTexture(buildCardFaceSvg(card, { faceVariant })).then((texture) => {
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
      image.src = resolveAssetUrl("assets/card-back.png");
    }).then((texture) => {
      backTexture = texture;
      return texture;
    });
  }

  return backTextureLoad;
}

export async function preloadCardTextures(cards: Card[]) {
  const uniqueCards = Array.from(new Map(cards.map((card) => [textureKey(card, "standard"), card])).values());

  await Promise.all([preloadCardBackTexture(), ...uniqueCards.map((card) => preloadCardFaceTexture(card))]);
}
