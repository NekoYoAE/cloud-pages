import type { CSSProperties } from 'react';

import { ringConfig } from '@/lib/ringConfig';

const CX = 98.5;
const CY = 98.5;
const FONT_FAMILY = 'Jost, Avenir, Helvetica, Arial, sans-serif';

const ARC_SLACK = 1.4;

function pointAt(deg: number, radius: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

function arcPath(startDeg: number, endDeg: number, radius: number) {
  const from = pointAt(startDeg, radius);
  const to = pointAt(endDeg, radius);
  return `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} A ${radius} ${radius} 0 0 1 ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
}

const SVG_STYLE: CSSProperties = {
  fillRule: 'evenodd',
  clipRule: 'evenodd',
  strokeLinecap: 'square',
  strokeMiterlimit: 2,
  pointerEvents: 'fill',
};

export function TileRing() {
  const { words, name, radius } = ringConfig;

  const slots: Array<string | null> = [...words, null, ...words];
  const total = slots.length;
  const step = 360 / total;
  const span = step * ARC_SLACK;
  const nameIndex = words.length;

  const angleAt = (index: number) => (index - nameIndex) * step - 90;

  return (
    <svg
      viewBox="0 0 197 197"
      className="tile-spin col-start-1 row-start-1 z-[4] h-[40vh] w-[40vh] max-h-[40vh] max-w-[60vw] rounded-full [transform-origin:center_center] [will-change:scale] group-hover/tile:[animation-play-state:paused]"
      style={SVG_STYLE}
    >
      <defs>
        {slots.map((_, index) => (
          <path
            key={`arc-${index}`}
            id={`ring-arc-${index}`}
            d={arcPath(angleAt(index) - span / 2, angleAt(index) + span / 2, radius)}
            fill="none"
          />
        ))}
      </defs>

      {slots.map((item, index) => {
        const isName = item === null;
        const label = isName ? name : item;
        const id = isName ? 'ring-name' : index >= nameIndex ? `${label}1` : label;

        return (
          <g key={id} id={id} className="ring-word" style={{ fill: ringConfig.color, fillOpacity: ringConfig.opacity }}>
            <text
              fontFamily={FONT_FAMILY}
              fontSize={isName ? ringConfig.nameSize : ringConfig.wordSize}
              fontWeight={isName ? ringConfig.nameWeight : ringConfig.wordWeight}
              letterSpacing={isName ? ringConfig.nameSpacing : ringConfig.wordSpacing}
              textAnchor="middle"
            >
              <textPath href={`#ring-arc-${index}`} startOffset="50%">
                {label}
              </textPath>
            </text>
          </g>
        );
      })}
    </svg>
  );
}
