import * as THREE from 'three';

const ASPHALT_SIZE = 256;
const ASPHALT_SPECKLES = 5200;
const GRASS_SIZE = 256;
const GRASS_STRIPES = 8;
const GRASS_BLADES = 9000;
const CHEQUER_COLUMNS = 12;
const CHEQUER_ROWS = 2;

function canvas2d(width: number, height: number): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas.getContext('2d');
}

function repeating(ctx: CanvasRenderingContext2D, anisotropy: number): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(ctx.canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = anisotropy;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Fine-grained grey tarmac with a faint rubbered line down the middle. */
export function createAsphaltTexture(): THREE.Texture | null {
  const ctx = canvas2d(ASPHALT_SIZE, ASPHALT_SIZE);
  if (!ctx) return null;
  ctx.fillStyle = '#5d6166';
  ctx.fillRect(0, 0, ASPHALT_SIZE, ASPHALT_SIZE);
  const rubber = ctx.createLinearGradient(0, 0, ASPHALT_SIZE, 0);
  rubber.addColorStop(0.25, 'rgba(20,20,22,0)');
  rubber.addColorStop(0.5, 'rgba(20,20,22,0.14)');
  rubber.addColorStop(0.75, 'rgba(20,20,22,0)');
  ctx.fillStyle = rubber;
  ctx.fillRect(0, 0, ASPHALT_SIZE, ASPHALT_SIZE);
  for (let i = 0; i < ASPHALT_SPECKLES; i += 1) {
    const shade = 50 + Math.floor(Math.random() * 46);
    ctx.fillStyle = `rgba(${shade},${shade + 1},${shade + 3},0.7)`;
    ctx.fillRect(Math.random() * ASPHALT_SIZE, Math.random() * ASPHALT_SIZE, 1, 1);
  }
  return repeating(ctx, 8);
}

/** Mown-grass stripes with blade noise. */
export function createGrassTexture(): THREE.Texture | null {
  const ctx = canvas2d(GRASS_SIZE, GRASS_SIZE);
  if (!ctx) return null;
  const stripe = GRASS_SIZE / GRASS_STRIPES;
  for (let i = 0; i < GRASS_STRIPES; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? '#2f4f2a' : '#355730';
    ctx.fillRect(0, i * stripe, GRASS_SIZE, stripe);
  }
  for (let i = 0; i < GRASS_BLADES; i += 1) {
    const green = 70 + Math.floor(Math.random() * 40);
    ctx.fillStyle = `rgba(${Math.floor(green * 0.45)},${green},${Math.floor(green * 0.4)},0.35)`;
    ctx.fillRect(Math.random() * GRASS_SIZE, Math.random() * GRASS_SIZE, 1, 2);
  }
  return repeating(ctx, 8);
}

/** Black-and-white chequer for the start/finish line (u across the road, v along it). */
export function createChequerTexture(): THREE.Texture | null {
  const cell = 16;
  const ctx = canvas2d(CHEQUER_COLUMNS * cell, CHEQUER_ROWS * cell);
  if (!ctx) return null;
  for (let column = 0; column < CHEQUER_COLUMNS; column += 1) {
    for (let row = 0; row < CHEQUER_ROWS; row += 1) {
      ctx.fillStyle = (column + row) % 2 === 0 ? '#f4f4f4' : '#141414';
      ctx.fillRect(column * cell, row * cell, cell, cell);
    }
  }
  const texture = repeating(ctx, 4);
  texture.magFilter = THREE.NearestFilter;
  return texture;
}
