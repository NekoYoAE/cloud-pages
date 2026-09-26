export const ITEM_SELECTOR = 'h1, h2, p, img, input, button, .reveal-item';

export function isAnimatable(el: HTMLElement): boolean {
  if (el.closest('nav')) return false;
  if (el.style.opacity || el.style.transform) return false;

  const style = getComputedStyle(el);
  if (style.animationName !== 'none') return false;
  if (style.display === 'inline') return false;
  if (!Number.parseFloat(style.opacity)) return false;
  if (style.visibility === 'hidden') return false;

  const box = el.getBoundingClientRect();
  return box.width > 0 && box.height > 0;
}
