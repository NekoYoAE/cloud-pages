import { useEffect, useLayoutEffect, useRef } from 'react';
import { Route, Routes } from 'react-router-dom';

import { KineticLabel } from '@/components/KineticLabel';
import { PageReveal } from '@/components/PageReveal';
import { useScrollTransition, type Slots } from '@/hooks/useScrollTransition';
import { PAGE_LABELS, PAGE_ORDER, STATIC_ITEMS_PATHS } from '@/lib/pageOrder';
import { createPageMotion, SMOOTH_TAU, type PageMotion } from '@/lib/transition';
import { ContactPage } from '@/pages/ContactPage';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProjectsPage } from '@/pages/ProjectsPage';

export function PageStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const slotARef = useRef<HTMLDivElement>(null);
  const slotBRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const curtainARef = useRef<HTMLDivElement>(null);
  const curtainBRef = useRef<HTMLDivElement>(null);
  const motionRef = useRef<PageMotion | null>(null);

  const targetProgressRef = useRef(0);
  const shownProgressRef = useRef(0);
  const rafRef = useRef(0);
  const lastFrameRef = useRef(0);

  const applyProgress = (value: number) => {
    motionRef.current?.apply(value);
  };

  const step = (time: number) => {
    const elapsed = Math.min((time - lastFrameRef.current) / 1000, 0.05);
    lastFrameRef.current = time;

    const gap = targetProgressRef.current - shownProgressRef.current;

    if (Math.abs(gap) < 0.0004) {
      shownProgressRef.current = targetProgressRef.current;
      applyProgress(shownProgressRef.current);
      rafRef.current = 0;

      landFrame();
      return;
    }

    shownProgressRef.current += gap * (1 - Math.exp(-elapsed / SMOOTH_TAU));
    applyProgress(shownProgressRef.current);
    rafRef.current = requestAnimationFrame(step);
  };

  const { slots, target, dir, phase, progressRef, scrollYRef, landFrame } = useScrollTransition({
    order: PAGE_ORDER,
    onProgress: (progress) => {
      targetProgressRef.current = progress;

      if (SMOOTH_TAU <= 0) {
        shownProgressRef.current = progress;
        applyProgress(progress);

        landFrame();
        return;
      }
      if (!rafRef.current) {
        lastFrameRef.current = performance.now();
        rafRef.current = requestAnimationFrame(step);
      }
    },
  });

  const running = phase !== 'idle';
  const outgoingRef = slots.current === 'a' ? slotARef : slotBRef;
  const incomingRef = slots.current === 'a' ? slotBRef : slotARef;

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  useLayoutEffect(() => {
    const outgoing = outgoingRef.current;
    const incoming = incomingRef.current;
    motionRef.current?.dispose();
    motionRef.current = null;

    if (!running || !outgoing || !incoming) return;

    if (scrollYRef.current) outgoing.style.top = `${-scrollYRef.current}px`;

    const motion = createPageMotion({
      outgoing,
      incoming,
      label: labelRef.current,
      curtains: [curtainARef.current, curtainBRef.current],
      dir,
    });

    motion.apply(progressRef.current);
    motionRef.current = motion;

    targetProgressRef.current = progressRef.current;
    shownProgressRef.current = progressRef.current;

    return () => {
      motion.dispose();
      outgoing.style.removeProperty('top');
      motionRef.current = null;
    };
  }, [running, target, dir, slots, progressRef, scrollYRef]);

  const slotClass = (slot: keyof Omit<Slots, 'current'>) => {
    if (!running) return slot === slots.current ? 'min-h-screen w-full' : 'hidden';

    const isOutgoing = slots.current === slot;
    return `pointer-events-none absolute inset-0 overflow-hidden will-change-transform ${isOutgoing ? 'z-10' : 'z-20'}`;
  };

  const renderPage = (path: string | null) =>
    path ? (
      <PageReveal auto={!running} staticItems={STATIC_ITEMS_PATHS.has(path)}>
        <Routes location={path}>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </PageReveal>
    ) : null;

  return (
    <>
      <KineticLabel label={running && target ? (PAGE_LABELS[target] ?? null) : null} layerRef={labelRef} />

      {running && (
        <>
          <div
            ref={curtainARef}
            className="pointer-events-none fixed inset-0 z-[25] bg-ink will-change-transform"
            style={{ transform: 'translate3d(0px, 100%, 0px)' }}
          />
          <div
            ref={curtainBRef}
            className="pointer-events-none fixed inset-0 z-[26] bg-accent will-change-transform"
            style={{ transform: 'translate3d(0px, 100%, 0px)' }}
          />
        </>
      )}

      <div ref={stageRef} className={running ? 'relative h-screen w-full overflow-hidden' : 'min-h-screen w-full'}>
        <div ref={slotARef} className={slotClass('a')}>
          {renderPage(slots.a)}
        </div>
        <div ref={slotBRef} className={slotClass('b')}>
          {renderPage(slots.b)}
        </div>
      </div>
    </>
  );
}
