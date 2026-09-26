import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

import { isAnimatable, ITEM_SELECTOR } from '@/lib/pageItems';

const MAX_ITEMS = 14;

const READY_TIMEOUT = 1200;

function waitForPaintReady(root: HTMLElement) {
  const tasks: Promise<unknown>[] = [];

  root.querySelectorAll('img').forEach((img) => {
    if (img.complete) return;
    tasks.push(
      new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      }),
    );
  });

  if (document.fonts && document.fonts.status !== 'loaded') tasks.push(document.fonts.ready);

  return tasks.length ? Promise.all(tasks) : Promise.resolve();
}

export function PageReveal({
  children,
  auto = true,
  staticItems = false,
}: {
  children: ReactNode;
  auto?: boolean;
  staticItems?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    let cancelled = false;
    const finish = () => {
      if (!cancelled) setReady(true);
    };

    const timer = window.setTimeout(finish, READY_TIMEOUT);
    waitForPaintReady(root).then(finish);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;

      window.scrollTo(0, 0);

      if (!auto || staticItems) return;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(root, { opacity: 1 });
        return;
      }

      if (!ready) {
        gsap.set(root, { opacity: 0 });
        return;
      }

      gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power3.out', clearProps: 'opacity' });

      const targets = Array.from(root.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(isAnimatable);

      if (!targets.length) return;

      gsap.from(targets.slice(0, MAX_ITEMS), {
        opacity: 0,
        y: 18,
        scale: 0.99,
        duration: 0.52,
        ease: 'power3.out',
        stagger: 0.045,
        clearProps: 'opacity,transform',
      });
    },
    { dependencies: [ready], scope: ref },
  );

  return (
    <div ref={ref} {...(staticItems ? { 'data-static-items': '' } : {})}>
      {children}
    </div>
  );
}
