
const EASES = {
  'none': (t) => t,
  'power1.out': (t) => 1 - Math.pow(1 - t, 2),
  'power1.in': (t) => t * t,
  'power2.out': (t) => 1 - Math.pow(1 - t, 3),
  'power2.in': (t) => t * t * t,
  'power2.inOut': (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  'power4': (t) => 1 - Math.pow(1 - t, 5),
  'power4.out': (t) => 1 - Math.pow(1 - t, 5),
};
const easeOf = (e) => (typeof e === 'function' ? e : EASES[e] || EASES['power2.out']);


const vals = new WeakMap();
function valsOf(el) {
  let v = vals.get(el);
  if (!v) {
    v = { y: 0, opacity: parseFloat(getComputedStyle(el).opacity) || 0 };
    vals.set(el, v);
  }
  return v;
}
function paint(el) {
  const v = valsOf(el);
  el.style.opacity = v.opacity;
  el.style.transform = `translateY(${v.y}px)`;
}

const running = new WeakMap();
function killTweens(el) {
  const set0 = running.get(el);
  if (set0) {
    set0.forEach((t) => (t.dead = true));
    set0.clear();
  }
}

function toList(targets) {
  if (!targets) return [];
  if (Array.isArray(targets)) return targets;
  if (typeof targets.length === 'number') return [...targets];
  return [targets];
}


export function set(targets: any, props: any) {
  toList(targets).forEach((el) => {
    if (!el) return;
    killTweens(el);
    const v = valsOf(el);
    if (props.opacity !== undefined) v.opacity = props.opacity;
    if (props.y !== undefined) v.y = props.y;
    paint(el);
  });
}


export function to(targets: any, props: any, opts: any = {}) {
  const list = toList(targets);
  const dur = (opts.duration ?? 0.5) * 1000;
  const ease = easeOf(opts.ease);
  const stagger = (opts.stagger || 0) * 1000;
  const delay = (opts.delay || 0) * 1000;
  const updaters = list.map((el, i) => {
    if (!el) return null;
    killTweens(el);
    const v = valsOf(el);
    const from = { opacity: v.opacity, y: v.y };
    const startTime = performance.now() + delay + stagger * i;
    const tween = { dead: false };
    if (!running.has(el)) running.set(el, new Set());
    running.get(el).add(tween);
    return () => {
      const p = Math.min(1, Math.max(0, (performance.now() - startTime) / dur));
      if (p <= 0) {

        el.style.opacity = from.opacity;
        el.style.transform = `translateY(${from.y}px)`;
        return false;
      }
      const e = ease(p);
      if (props.opacity !== undefined) v.opacity = from.opacity + (props.opacity - from.opacity) * e;
      if (props.y !== undefined) v.y = from.y + (props.y - from.y) * e;
      paint(el);
      return p >= 1;
    };
  });

  list.forEach((el) => {
    if (!el) return;
    const v = valsOf(el);
    el.style.opacity = v.opacity;
    el.style.transform = `translateY(${v.y}px)`;
  });

  let alive = true;
  const step = () => {
    if (!alive) return;
    let done = true;
    updaters.forEach((fn) => {
      if (fn && !fn()) done = false;
    });
    if (!done) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  return { revert: () => (alive = false) };
}


export function splitChars(root) {
  const chars = [];
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const txt = child.textContent;
        if (!txt.trim()) return;
        const parts = txt.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
            return;
          }
          const word = document.createElement('span');
          word.className = 'fx-word';
          for (const ch of part) {
            const s = document.createElement('span');
            s.className = 'fx-char';
            s.textContent = ch;
            word.appendChild(s);
            chars.push(s);
          }
          frag.appendChild(word);
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };
  walk(root);
  return { chars };
}


export function scrambleText(el: HTMLElement, text: string, opts: any = {}) {
  const dur = (opts.duration ?? 0.4) * 1000;
  const chars = opts.chars || 'AETLAAETLAAETLA';
  const revealDelay = opts.revealDelay ?? 0.2;
  const speed = opts.speed ?? 1.5;
  const ease = easeOf(opts.ease || 'power2.out');
  const n = text.length;
  if (!n) return;
  const t0 = performance.now();
  let acc = 0;
  let lastNow = t0;
  const step = (now) => {
    const dtms = now - lastNow;
    lastNow = now;
    acc += (dtms / 1000) * speed * 30;
    const p = Math.min(1, (now - t0) / dur);
    const e = ease(p);
    const reveal = Math.max(0, Math.min(n, Math.floor(((e - revealDelay) / (1 - revealDelay)) * n)));
    let out = '';
    for (let i = 0; i < n; i++) {
      const c = text[i];
      if (i < reveal || c.trim() === '') out += c;
      else out += chars[Math.floor(Math.random() * chars.length)];
    }
    el.textContent = out;
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = text;
  };
  requestAnimationFrame(step);
}
