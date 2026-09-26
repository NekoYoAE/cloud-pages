import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  ARM_TRAVEL,
  AUTO_DURATION,
  AUTO_EASE,
  IDLE_RESET,
  KEY_STEP,
  MAX_INPUT_STEP,
  SPAN_TRAVEL,
  TOUCH_RATIO,
} from '@/lib/transition';

type TransitionPhase = 'idle' | 'scrub' | 'auto';

export type Slots = { a: string | null; b: string | null; current: 'a' | 'b' };

type Options = {
  order: string[];

  onProgress: (progress: number) => void;
};

function clamp(min: number, max: number, value: number) {
  return Math.min(max, Math.max(min, value));
}

const EDGE_TOLERANCE = 4;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function normalizeWheel(event: WheelEvent) {
  const pixels =
    event.deltaMode === 1
      ? event.deltaY * 16
      : event.deltaMode === 2
        ? event.deltaY * window.innerHeight
        : event.deltaY;

  return clamp(-MAX_INPUT_STEP, MAX_INPUT_STEP, pixels);
}

function isScrollable(el: Element) {
  return /(auto|scroll|overlay)/.test(getComputedStyle(el).overflowY);
}

function scrollState(el: Element) {
  const isDocumentLevel = el === document.body || el === document.documentElement;
  const scroller = isDocumentLevel ? (document.scrollingElement ?? document.documentElement) : el;
  const max = scroller.scrollHeight - scroller.clientHeight;

  return {
    scrollable: isDocumentLevel ? max > EDGE_TOLERANCE : isScrollable(el) && max > EDGE_TOLERANCE,
    atTop: scroller.scrollTop <= EDGE_TOLERANCE,
    atBottom: scroller.scrollTop >= max - EDGE_TOLERANCE,
  };
}

function consumedByInnerScroll(target: EventTarget | null, direction: number) {
  let el = target instanceof Element ? target : null;
  while (el) {
    const state = scrollState(el);
    if (state.scrollable) {
      if (direction > 0 && !state.atBottom) return true;
      if (direction < 0 && !state.atTop) return true;
    }
    el = el.parentElement;
  }
  return false;
}

export function useScrollTransition({ order, onProgress }: Options) {
  const location = useLocation();
  const navigate = useNavigate();

  const [slots, setSlots] = useState<Slots>(() => ({ a: location.pathname, b: null, current: 'a' }));
  const [target, setTarget] = useState<string | null>(null);
  const [dir, setDir] = useState(1);
  const [phase, setPhase] = useState<TransitionPhase>('idle');

  const slotsRef = useRef(slots);
  const targetRef = useRef<string | null>(null);
  const phaseRef = useRef<TransitionPhase>('idle');
  const dirRef = useRef(1);

  const progressRef = useRef(0);

  const travelRef = useRef(0);

  const scrollYRef = useRef(0);
  const idleTimerRef = useRef(0);

  const autoRafRef = useRef(0);

  const pendingRef = useRef<'commit' | 'cancel' | null>(null);

  const landRef = useRef<() => void>(() => {});
  const notifyRef = useRef(onProgress);

  useEffect(() => {
    notifyRef.current = onProgress;
  }, [onProgress]);

  const apiRef = useRef<{
    shownPath: () => string;
    beginAuto: (path: string, dir: number) => void;
    commit: () => void;
    jump: (path: string) => void;
  } | null>(null);

  useEffect(() => {
    const shownPath = () => {
      const current = slotsRef.current;
      return (current.current === 'a' ? current.a : current.b) ?? '';
    };

    const applySlots = (next: Slots) => {
      slotsRef.current = next;
      setSlots(next);
    };

    const setProgress = (value: number) => {
      progressRef.current = value;
      notifyRef.current(value);
    };

    const stopAuto = () => {
      if (autoRafRef.current) cancelAnimationFrame(autoRafRef.current);
      autoRafRef.current = 0;
    };

    const commit = () => {
      stopAuto();
      pendingRef.current = null;
      const current = slotsRef.current;
      const next =
        current.current === 'a'
          ? { a: null, b: targetRef.current, current: 'b' as const }
          : { a: targetRef.current, b: null, current: 'a' as const };

      applySlots(next);
      targetRef.current = null;
      setTarget(null);
      phaseRef.current = 'idle';
      setPhase('idle');
      progressRef.current = 0;
    };

    const cancel = () => {
      pendingRef.current = null;
      const current = slotsRef.current;
      applySlots(current.current === 'a' ? { ...current, b: null } : { ...current, a: null });
      targetRef.current = null;
      setTarget(null);
      phaseRef.current = 'idle';
      setPhase('idle');
      progressRef.current = 0;
      navigate(shownPath(), { replace: true });
    };

    const jump = (path: string) => {
      stopAuto();
      pendingRef.current = null;
      const current = slotsRef.current;
      applySlots(current.current === 'a' ? { a: null, b: path, current: 'b' } : { a: path, b: null, current: 'a' });
      targetRef.current = null;
      setTarget(null);
      phaseRef.current = 'idle';
      setPhase('idle');
      progressRef.current = 0;
      travelRef.current = 0;
    };

    const begin = (to: string, nextDir: number, mode: TransitionPhase) => {
      const current = slotsRef.current;
      applySlots(current.current === 'a' ? { ...current, b: to } : { ...current, a: to });
      scrollYRef.current = window.scrollY;

      navigate(to);
      targetRef.current = to;
      setTarget(to);
      dirRef.current = nextDir;
      setDir(nextDir);
      phaseRef.current = mode;
      setPhase(mode);
    };

    const beginAuto = (to: string, nextDir: number) => {
      stopAuto();
      begin(to, nextDir, 'auto');
      setProgress(0);

      const start = performance.now();
      const duration = AUTO_DURATION * 1000;

      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        setProgress(AUTO_EASE(t));

        if (t < 1) {
          autoRafRef.current = requestAnimationFrame(tick);
          return;
        }
        autoRafRef.current = 0;

        pendingRef.current = 'commit';
      };

      autoRafRef.current = requestAnimationFrame(tick);
    };

    const settle = () => {
      for (let guard = 0; guard < 8; guard += 1) {
        if (phaseRef.current === 'idle') {
          const travel = travelRef.current;
          if (Math.abs(travel) < ARM_TRAVEL) return;

          const nextDir = travel > 0 ? 1 : -1;
          const from = order.indexOf(shownPath());
          const to = from + nextDir;
          if (from < 0 || to < 0 || to >= order.length) {
            travelRef.current = 0;
            return;
          }
          if (prefersReducedMotion()) {
            jump(order[to]);
            navigate(order[to]);
            return;
          }

          begin(order[to], nextDir, 'scrub');
          continue;
        }

        const currentDir = dirRef.current;
        const progress = (travelRef.current * currentDir - ARM_TRAVEL) / SPAN_TRAVEL;

        if (progress >= 1) {
          setProgress(1);
          pendingRef.current = 'commit';
          return;
        }

        if (progress < 0) {
          setProgress(0);
          pendingRef.current = 'cancel';
          return;
        }

        pendingRef.current = null;
        setProgress(progress);
        return;
      }

      travelRef.current = 0;
    };

    const landPending = () => {
      const action = pendingRef.current;
      if (!action) return;
      pendingRef.current = null;

      const currentDir = dirRef.current;

      if (action === 'commit') {
        commit();

        const spent = ARM_TRAVEL + SPAN_TRAVEL;
        if (travelRef.current * currentDir >= spent) {
          travelRef.current -= currentDir * spent;
          if (Math.abs(travelRef.current) < SPAN_TRAVEL) travelRef.current = 0;
        } else {
          travelRef.current = 0;
        }
      } else {
        cancel();

        travelRef.current -= currentDir * ARM_TRAVEL;
        if (Math.abs(travelRef.current) < SPAN_TRAVEL) travelRef.current = 0;
      }

      settle();
    };

    landRef.current = landPending;

    const push = (delta: number) => {
      if (phaseRef.current === 'auto') return;

      travelRef.current += delta;
      settle();

      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(() => {
        if (phaseRef.current === 'idle') travelRef.current = 0;
      }, IDLE_RESET);
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      const delta = normalizeWheel(event);
      if (delta === 0) return;

      if (phaseRef.current === 'idle' && consumedByInnerScroll(event.target, Math.sign(delta))) return;
      push(delta);
    };

    let touchY = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY ?? 0;
      const delta = touchY - y;
      touchY = y;
      if (phaseRef.current === 'idle' && consumedByInnerScroll(event.target, Math.sign(delta))) return;
      push(clamp(-MAX_INPUT_STEP, MAX_INPUT_STEP, delta * TOUCH_RATIO));
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === 'ArrowDown' || event.key === 'PageDown') push(KEY_STEP);
      if (event.key === 'ArrowUp' || event.key === 'PageUp') push(-KEY_STEP);
    };

    apiRef.current = { shownPath, beginAuto, commit, jump };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(idleTimerRef.current);
      stopAuto();
      apiRef.current = null;
    };
  }, [navigate, order]);

  const landFrame = useCallback(() => landRef.current(), []);

  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;

    const path = location.pathname;
    if (path === api.shownPath()) return;
    if (targetRef.current === path) return;

    const from = order.indexOf(api.shownPath());
    const to = order.indexOf(path);
    if (from < 0 || to < 0) {
      api.jump(path);
      return;
    }

    if (phaseRef.current !== 'idle') api.commit();
    api.beginAuto(path, to > from ? 1 : -1);
  }, [location, order]);

  return { slots, target, dir, phase, progressRef, scrollYRef, landFrame };
}
