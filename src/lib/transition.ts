import { EASE, shiftTrack, track, trackAt, type Easing, type Track } from '@/lib/motionCurve';
import { isAnimatable, ITEM_SELECTOR } from '@/lib/pageItems';

export const ARM_TRAVEL = 420;

export const SPAN_TRAVEL = 2400;

export const MAX_INPUT_STEP = 120;

export const KEY_STEP = 420;

export const TOUCH_RATIO = 1.6;

export const IDLE_RESET = 3000;

export const AUTO_DURATION = 0.9;

export const SMOOTH_TAU = 0.09;

const MAX_ITEMS_PER_LAYER = 6;

type KineticLayers = { back: HTMLElement[]; mid: HTMLElement[]; front: HTMLElement[] };

function depthLayer(box: DOMRect, viewportArea: number): keyof KineticLayers {
  const ratio = (box.width * box.height) / viewportArea;
  if (ratio > 0.16) return 'back';
  if (ratio > 0.04) return 'mid';
  return 'front';
}

function isTitle(el: HTMLElement) {
  return el.tagName === 'H1' || el.tagName === 'H2';
}

function collectKineticLayers(root: HTMLElement): KineticLayers {
  const viewportArea = window.innerWidth * window.innerHeight || 1;
  const layers: KineticLayers = { back: [], mid: [], front: [] };

  if (root.querySelector('[data-static-items]')) return layers;

  Array.from(root.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).forEach((el) => {
    if (!isAnimatable(el)) return;

    const box = el.getBoundingClientRect();
    const bucket = layers[depthLayer(box, viewportArea)];

    if (bucket.length >= MAX_ITEMS_PER_LAYER && !isTitle(el)) return;
    bucket.push(el);
  });

  return layers;
}

const outgoingCurves = (dir: number) => ({
  opacity: track([
    { at: 0, value: 1 },
    { at: 0.05, value: 1, ease: EASE.power2Out },
    { at: 0.13, value: 0.99, ease: EASE.power1InOut },
    { at: 0.22, value: 0.95, ease: EASE.power1InOut },
    { at: 0.31, value: 0.85, ease: EASE.power1In },
    { at: 0.4, value: 0.64, ease: EASE.power1In },
    { at: 0.49, value: 0.32, ease: EASE.power1In },
    { at: 0.58, value: 0, ease: EASE.power2In },
  ]),
  yPercent: track([
    { at: 0, value: 0 },
    { at: 0.05, value: 0.7 * dir, ease: EASE.power2Out },
    { at: 0.13, value: -1.4 * dir, ease: EASE.power1InOut },
    { at: 0.22, value: -3.6 * dir, ease: EASE.power1InOut },
    { at: 0.31, value: -6.4 * dir, ease: EASE.power1In },
    { at: 0.4, value: -9.4 * dir, ease: EASE.power1In },
    { at: 0.49, value: -12.8 * dir, ease: EASE.power1In },
    { at: 0.58, value: -16.5 * dir, ease: EASE.power2In },
  ]),
  scale: track([
    { at: 0, value: 1 },
    { at: 0.05, value: 1.002, ease: EASE.power2Out },
    { at: 0.13, value: 0.996, ease: EASE.power1InOut },
    { at: 0.22, value: 0.987, ease: EASE.power1InOut },
    { at: 0.31, value: 0.976, ease: EASE.power1In },
    { at: 0.4, value: 0.963, ease: EASE.power1In },
    { at: 0.49, value: 0.949, ease: EASE.power1In },
    { at: 0.58, value: 0.934, ease: EASE.power2In },
  ]),
  rotateX: track([
    { at: 0, value: 0 },
    { at: 0.05, value: 0.4 * dir, ease: EASE.power2Out },
    { at: 0.13, value: -1 * dir, ease: EASE.power1InOut },
    { at: 0.22, value: -2.2 * dir, ease: EASE.power1InOut },
    { at: 0.31, value: -3.4 * dir, ease: EASE.power1In },
    { at: 0.4, value: -4.6 * dir, ease: EASE.power1In },
    { at: 0.49, value: -5.8 * dir, ease: EASE.power1In },
    { at: 0.58, value: -7 * dir, ease: EASE.power2In },
  ]),
});

const incomingCurves = (dir: number) => ({
  opacity: track([
    { at: 0.48, value: 0 },
    { at: 0.54, value: 0.28, ease: EASE.power1Out },
    { at: 0.6, value: 0.7, ease: EASE.power1Out },
    { at: 0.67, value: 1, ease: EASE.power1Out },
  ]),
  yPercent: track([
    { at: 0.48, value: 9 * dir },
    { at: 0.54, value: 7.6 * dir, ease: EASE.power1Out },
    { at: 0.6, value: 6 * dir, ease: EASE.power1Out },
    { at: 0.67, value: 3.8 * dir, ease: EASE.power1Out },
    { at: 0.74, value: 1.4 * dir, ease: EASE.power2Out },
    { at: 0.81, value: -0.9 * dir, ease: EASE.power1InOut },
    { at: 0.88, value: -1.7 * dir, ease: EASE.power1InOut },
    { at: 0.94, value: -0.7 * dir, ease: EASE.power1InOut },
    { at: 1, value: 0, ease: EASE.power1InOut },
  ]),
  scale: track([
    { at: 0.48, value: 1.055 },
    { at: 0.54, value: 1.047, ease: EASE.power1Out },
    { at: 0.6, value: 1.037, ease: EASE.power1Out },
    { at: 0.67, value: 1.023, ease: EASE.power1Out },
    { at: 0.74, value: 1.008, ease: EASE.power2Out },
    { at: 0.81, value: 0.997, ease: EASE.power1InOut },
    { at: 0.88, value: 0.994, ease: EASE.power1InOut },
    { at: 0.94, value: 0.999, ease: EASE.power1InOut },
    { at: 1, value: 1, ease: EASE.power1InOut },
  ]),
});

const curtainCurve = (dir: number) =>
  track([
    { at: 0.18, value: 100 * dir },
    { at: 0.27, value: 74 * dir, ease: EASE.power2In },
    { at: 0.35, value: 40 * dir, ease: EASE.linear },
    { at: 0.43, value: 12 * dir, ease: EASE.power1Out },
    { at: 0.48, value: 0, ease: EASE.power2Out },
    { at: 0.62, value: 0, ease: EASE.linear },
    { at: 0.7, value: -26 * dir, ease: EASE.power2In },
    { at: 0.8, value: -62 * dir, ease: EASE.linear },
    { at: 0.9, value: -88 * dir, ease: EASE.power1Out },
    { at: 1, value: -100 * dir, ease: EASE.power1Out },
  ]);

const CURTAIN_OFFSETS = [0, 0.13];

const letterCurves = (dir: number, rotateY: number) => ({
  opacity: track([
    { at: 0.04, value: 0 },
    { at: 0.12, value: 0.28, ease: EASE.power2Out },
    { at: 0.2, value: 0.64, ease: EASE.power2Out },
    { at: 0.28, value: 0.9, ease: EASE.power2Out },
    { at: 0.35, value: 1, ease: EASE.power2Out },
    { at: 0.62, value: 1, ease: EASE.linear },
    { at: 0.72, value: 0.86, ease: EASE.power1In },
    { at: 0.82, value: 0.45, ease: EASE.power2In },
    { at: 0.9, value: 0.14, ease: EASE.power2In },
    { at: 0.96, value: 0, ease: EASE.power2In },
  ]),
  yPercent: track([
    { at: 0.04, value: 102 * dir },
    { at: 0.12, value: 78 * dir, ease: EASE.power2Out },
    { at: 0.2, value: 52 * dir, ease: EASE.power2Out },
    { at: 0.28, value: 28 * dir, ease: EASE.power2Out },
    { at: 0.35, value: 10 * dir, ease: EASE.power2Out },
    { at: 0.42, value: 1 * dir, ease: EASE.power1Out },
    { at: 0.48, value: -1.6 * dir, ease: EASE.power1InOut },
    { at: 0.54, value: 0, ease: EASE.power1InOut },
    { at: 0.62, value: -1 * dir, ease: EASE.power1InOut },
    { at: 0.72, value: -14 * dir, ease: EASE.power1In },
    { at: 0.82, value: -38 * dir, ease: EASE.power2In },
    { at: 0.9, value: -60 * dir, ease: EASE.power2In },
    { at: 0.96, value: -82 * dir, ease: EASE.power2In },
  ]),
  scale: track([
    { at: 0.04, value: 0.66 },
    { at: 0.12, value: 0.76, ease: EASE.power2Out },
    { at: 0.2, value: 0.86, ease: EASE.power2Out },
    { at: 0.28, value: 0.95, ease: EASE.power2Out },
    { at: 0.35, value: 1.03, ease: EASE.power2Out },
    { at: 0.42, value: 1.08, ease: EASE.power1Out },
    { at: 0.48, value: 1.02, ease: EASE.power1InOut },
    { at: 0.54, value: 1, ease: EASE.power1InOut },
    { at: 0.62, value: 1.01, ease: EASE.power1InOut },
    { at: 0.72, value: 1.03, ease: EASE.power1In },
    { at: 0.82, value: 1.07, ease: EASE.power2In },
    { at: 0.9, value: 1.1, ease: EASE.power2In },
    { at: 0.96, value: 1.13, ease: EASE.power2In },
  ]),
  rotateX: track([
    { at: 0.04, value: -96 * dir },
    { at: 0.12, value: -76 * dir, ease: EASE.power2Out },
    { at: 0.2, value: -54 * dir, ease: EASE.power2Out },
    { at: 0.28, value: -31 * dir, ease: EASE.power2Out },
    { at: 0.35, value: -12 * dir, ease: EASE.power2Out },
    { at: 0.42, value: -1 * dir, ease: EASE.power1Out },
    { at: 0.48, value: 1.6 * dir, ease: EASE.power1InOut },
    { at: 0.54, value: 0, ease: EASE.power1InOut },
    { at: 0.62, value: 2.5 * dir, ease: EASE.power1InOut },
    { at: 0.72, value: 13 * dir, ease: EASE.power1In },
    { at: 0.82, value: 30 * dir, ease: EASE.power2In },
    { at: 0.9, value: 44 * dir, ease: EASE.power2In },
    { at: 0.96, value: 58 * dir, ease: EASE.power2In },
  ]),
  rotateY: track([
    { at: 0.04, value: rotateY },
    { at: 0.12, value: rotateY * 0.72, ease: EASE.power2Out },
    { at: 0.2, value: rotateY * 0.44, ease: EASE.power2Out },
    { at: 0.28, value: rotateY * 0.22, ease: EASE.power2Out },
    { at: 0.35, value: 0, ease: EASE.power2Out },
    { at: 0.62, value: 0, ease: EASE.linear },
    { at: 0.72, value: -rotateY * 0.24, ease: EASE.power1In },
    { at: 0.82, value: -rotateY * 0.56, ease: EASE.power2In },
    { at: 0.9, value: -rotateY * 0.8, ease: EASE.power2In },
    { at: 0.96, value: -rotateY, ease: EASE.power2In },
  ]),
});

const exitCurves = (dir: number, amplitude: number) => ({
  y: track([
    { at: 0, value: 0 },
    { at: 0.08, value: -amplitude * 0.12 * dir, ease: EASE.power1Out },
    { at: 0.18, value: -amplitude * 0.34 * dir, ease: EASE.power1In },
    { at: 0.28, value: -amplitude * 0.66 * dir, ease: EASE.power1In },
    { at: 0.38, value: -amplitude * dir, ease: EASE.power2In },
  ]),
  opacity: track([
    { at: 0, value: 1 },
    { at: 0.08, value: 0.98, ease: EASE.power1Out },
    { at: 0.18, value: 0.8, ease: EASE.power1In },
    { at: 0.28, value: 0.42, ease: EASE.power1In },
    { at: 0.38, value: 0, ease: EASE.power2In },
  ]),
  scale: track([
    { at: 0, value: 1 },
    { at: 0.08, value: 0.998, ease: EASE.power1Out },
    { at: 0.18, value: 0.99, ease: EASE.power1In },
    { at: 0.28, value: 0.975, ease: EASE.power1In },
    { at: 0.38, value: 0.955, ease: EASE.power2In },
  ]),
});

const enterCurves = (dir: number, amplitude: number) => ({
  y: track([
    { at: 0, value: amplitude * dir },
    { at: 0.08, value: amplitude * 0.62 * dir, ease: EASE.power2Out },
    { at: 0.17, value: amplitude * 0.26 * dir, ease: EASE.power2Out },
    { at: 0.24, value: -amplitude * 0.08 * dir, ease: EASE.power2Out },
    { at: 0.3, value: amplitude * 0.05 * dir, ease: EASE.power1InOut },
    { at: 0.36, value: 0, ease: EASE.power1InOut },
  ]),
  opacity: track([
    { at: 0, value: 0 },
    { at: 0.08, value: 0.3, ease: EASE.power2Out },
    { at: 0.17, value: 0.74, ease: EASE.power2Out },
    { at: 0.24, value: 1, ease: EASE.power2Out },
  ]),
  scale: track([
    { at: 0, value: 0.97 },
    { at: 0.08, value: 0.982, ease: EASE.power2Out },
    { at: 0.17, value: 0.996, ease: EASE.power2Out },
    { at: 0.24, value: 1.008, ease: EASE.power2Out },
    { at: 0.3, value: 1.002, ease: EASE.power1InOut },
    { at: 0.36, value: 1, ease: EASE.power1InOut },
  ]),
});

const revealCurve = track([
  { at: 0, value: 100 },
  { at: 0.1, value: 74, ease: EASE.power2Out },
  { at: 0.2, value: 34, ease: EASE.power1InOut },
  { at: 0.28, value: 8, ease: EASE.power1Out },
  { at: 0.34, value: -6, ease: EASE.power1Out },
]);

const EXIT_TUNING = {
  back: { amplitude: 18, at: 0 },
  mid: { amplitude: 34, at: 0.03 },
  front: { amplitude: 52, at: 0.06 },
};
const ENTER_TUNING = {
  back: { amplitude: 24, at: 0.55 },
  mid: { amplitude: 44, at: 0.585 },
  front: { amplitude: 64, at: 0.62 },
};

const ITEM_STAGGER = 0.012;

type Target = {
  el: HTMLElement;
  opacity?: Track;

  yPercent?: Track;

  y?: Track;
  scale?: Track;
  rotateX?: Track;
  rotateY?: Track;

  reveal?: Track;
};

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

function write(target: Target, progress: number, viewportHeight: number) {
  const { el } = target;

  let y = 0;
  if (target.yPercent) y += (trackAt(target.yPercent, progress) / 100) * viewportHeight;
  if (target.y) y += trackAt(target.y, progress);

  const scale = target.scale ? trackAt(target.scale, progress) : 1;
  const rotateX = target.rotateX ? trackAt(target.rotateX, progress) : 0;
  const rotateY = target.rotateY ? trackAt(target.rotateY, progress) : 0;

  const transforms: string[] = [];
  if (y) transforms.push(`translate3d(0px, ${round(y)}px, 0)`);
  if (scale !== 1) transforms.push(`scale(${round(scale)})`);
  if (rotateX) transforms.push(`rotateX(${round(rotateX)}deg)`);
  if (rotateY) transforms.push(`rotateY(${round(rotateY)}deg)`);

  el.style.transform = transforms.join(' ');

  if (target.opacity) el.style.opacity = String(round(trackAt(target.opacity, progress)));
  if (target.reveal) el.style.clipPath = `inset(0% 0% ${round(trackAt(target.reveal, progress))}% 0%)`;
}

function clear(target: Target) {
  const { el } = target;
  el.style.removeProperty('transform');
  el.style.removeProperty('opacity');
  el.style.removeProperty('clip-path');
}

function staggerFrom(dir: number): 'start' | 'end' {
  return dir > 0 ? 'start' : 'end';
}

function staggerRank(index: number, total: number, from: 'start' | 'end' | 'center') {
  const last = total - 1;
  if (from === 'end') return last - index;
  if (from === 'center') return Math.abs(index - last / 2);
  return index;
}

type MotionLayers = {
  outgoing: HTMLElement;

  incoming: HTMLElement;

  label: HTMLElement | null;

  curtains: (HTMLElement | null)[];

  dir: number;
};

export type PageMotion = {
  apply: (progress: number) => void;

  dispose: () => void;
};

export function createPageMotion({ outgoing, incoming, label, curtains, dir }: MotionLayers): PageMotion {
  const targets: Target[] = [];

  targets.push({ el: outgoing, ...outgoingCurves(dir) });
  targets.push({ el: incoming, ...incomingCurves(dir) });

  curtains.forEach((curtain, index) => {
    if (!curtain) return;
    targets.push({ el: curtain, yPercent: shiftTrack(curtainCurve(dir), CURTAIN_OFFSETS[index] ?? 0) });
  });

  const letters = label ? Array.from(label.querySelectorAll<HTMLElement>('.kinetic-letter')) : [];
  letters.forEach((el, index) => {
    const rotateY = (index % 2 ? 1 : -1) * 50;

    const curves = letterCurves(dir, rotateY);

    targets.push({
      el,
      opacity: curves.opacity,
      yPercent: curves.yPercent,
      scale: curves.scale,
      rotateX: curves.rotateX,
      rotateY: curves.rotateY,
    });
  });

  const from = staggerFrom(dir);
  const outgoingLayers = collectKineticLayers(outgoing);
  const incomingLayers = collectKineticLayers(incoming);

  (Object.keys(EXIT_TUNING) as (keyof KineticLayers)[]).forEach((name) => {
    const items = outgoingLayers[name];
    const { amplitude, at } = EXIT_TUNING[name];
    const curves = exitCurves(dir, amplitude);

    items.forEach((el, index) => {
      const offset = at + staggerRank(index, items.length, from) * ITEM_STAGGER;
      targets.push({
        el,
        y: shiftTrack(curves.y, offset),
        opacity: shiftTrack(curves.opacity, offset),
        scale: shiftTrack(curves.scale, offset),
      });
    });
  });

  (Object.keys(ENTER_TUNING) as (keyof KineticLayers)[]).forEach((name) => {
    const items = incomingLayers[name];
    const { amplitude, at } = ENTER_TUNING[name];
    const curves = enterCurves(dir, amplitude);

    items.forEach((el, index) => {
      const offset = at + staggerRank(index, items.length, from) * ITEM_STAGGER;
      targets.push({
        el,
        y: shiftTrack(curves.y, offset),
        opacity: shiftTrack(curves.opacity, offset),
        scale: shiftTrack(curves.scale, offset),
      });
    });
  });

  const titles = [...incomingLayers.back, ...incomingLayers.mid, ...incomingLayers.front].filter(isTitle);
  titles.forEach((el, index) => {
    targets.push({
      el,
      reveal: shiftTrack(revealCurve, 0.56 + staggerRank(index, titles.length, from) * 0.04),
    });
  });

  let viewportHeight = window.innerHeight;
  let applied = Number.NaN;

  const measure = () => {
    viewportHeight = window.innerHeight;
  };
  window.addEventListener('resize', measure, { passive: true });

  return {
    apply(progress) {
      if (progress === applied) return;
      applied = progress;
      for (const target of targets) write(target, progress, viewportHeight);
    },
    dispose() {
      window.removeEventListener('resize', measure);
      for (const target of targets) clear(target);
    },
  };
}

export const AUTO_EASE: Easing = EASE.power1InOut;
