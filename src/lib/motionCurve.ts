export type Easing = (t: number) => number;

export const EASE = {
  linear: (t: number) => t,
  power1In: (t: number) => t * t,
  power1Out: (t: number) => t * (2 - t),
  power1InOut: (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
  power2In: (t: number) => t ** 3,
  power2Out: (t: number) => 1 - (1 - t) ** 3,
  power2InOut: (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
  power3In: (t: number) => t ** 4,
  power3Out: (t: number) => 1 - (1 - t) ** 4,
  power3InOut: (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2),
  sineIn: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
  sineOut: (t: number) => Math.sin((t * Math.PI) / 2),
  sineInOut: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  expoIn: (t: number) => (t <= 0 ? 0 : 2 ** (10 * t - 10)),
  expoOut: (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t)),
} satisfies Record<string, Easing>;

type Segment = { from: number; to: number; a: number; b: number; ease: Easing };

export type Track = Segment[];

type ControlPoint = { at: number; value: number; ease?: Easing };

export function track(points: ControlPoint[]): Track {
  const segments: Segment[] = [];

  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const point = points[i];
    segments.push({
      from: prev.at,
      to: point.at,
      a: prev.value,
      b: point.value,
      ease: point.ease ?? EASE.linear,
    });
  }

  return segments;
}

export function trackAt(segments: Track, p: number): number {
  if (segments.length === 0) return 0;
  if (p <= segments[0].from) return segments[0].a;

  let value = segments[0].a;
  for (const segment of segments) {
    if (p >= segment.to) {
      value = segment.b;
      continue;
    }

    if (p <= segment.from) return value;

    const span = segment.to - segment.from;
    const t = span > 0 ? (p - segment.from) / span : 1;
    return segment.a + (segment.b - segment.a) * segment.ease(t);
  }

  return value;
}

export function shiftTrack(segments: Track, offset: number): Track {
  if (segments.length === 0) return segments;

  const first = segments[0].from;
  const span = segments[segments.length - 1].to - first;
  const start = first + offset;
  const scale = span > 0 ? Math.min(1, (1 - start) / span) : 1;

  return segments.map((segment) => ({
    ...segment,
    from: start + (segment.from - first) * scale,
    to: start + (segment.to - first) * scale,
  }));
}
