import { useEffect } from 'react';

const HOVER_SELECTOR = 'a, button, input, area, g[id]';

const SCALE_IDLE = 1;
const SCALE_HOVER = 1.7;
const SCALE_PRESS = 0.8;
const SCALE_PRESS_HOVER = 1.2;

export function useCursor() {
  useEffect(() => {
    const { body } = document;
    const state = { hovered: false };
    let x = -1000;
    let y = -1000;
    let frame = 0;

    const paint = () => {
      frame = 0;
      body.style.setProperty('--cursor-x', `${x}px`);
      body.style.setProperty('--cursor-y', `${y + document.documentElement.scrollTop - window.scrollY}px`);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const scale = (value: number) => {
      body.style.setProperty('--cursor-transform', `translate(-50%,-50%) scale(${value})`);
    };

    const hoverIn = () => {
      scale(SCALE_HOVER);
      state.hovered = true;
    };

    const hoverOut = () => {
      scale(SCALE_IDLE);
      state.hovered = false;
    };

    const closest = (target: EventTarget | null) => (target instanceof Element ? target.closest(HOVER_SELECTOR) : null);

    const onMouseMove = (event: MouseEvent) => {
      x = event.clientX;
      y = event.clientY;
      schedule();
    };

    const onMouseDown = () => scale(state.hovered ? SCALE_PRESS_HOVER : SCALE_PRESS);
    const onMouseUp = () => scale(state.hovered ? SCALE_HOVER : SCALE_IDLE);

    const onMouseOver = (event: MouseEvent) => {
      const to = closest(event.target);
      if (to && to !== closest(event.relatedTarget)) hoverIn();
    };

    const onMouseOut = (event: MouseEvent) => {
      const from = closest(event.target);
      if (from && from !== closest(event.relatedTarget)) hoverOut();
    };

    body.style.setProperty('--cursor-size', '1.5em');
    scale(SCALE_IDLE);
    paint();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('scroll', schedule, { passive: true });
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('scroll', schedule);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
    };
  }, []);
}
