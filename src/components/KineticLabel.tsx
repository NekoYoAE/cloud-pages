import { memo } from 'react';
import type { RefObject } from 'react';

type Props = {
  label: string | null;
  layerRef: RefObject<HTMLDivElement | null>;
};

export const KineticLabel = memo(function KineticLabel({ label, layerRef }: Props) {
  if (!label) return null;

  return (
    <div
      ref={layerRef}
      className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center overflow-hidden [perspective:900px]"
    >
      {label.split('').map((char, index) => (
        <span
          key={`${label}-${index}`}
          className="kinetic-letter origin-bottom whitespace-pre text-[12vw] leading-none font-bold tracking-tight text-accent"
        >
          {char}
        </span>
      ))}
    </div>
  );
});
