import logoSvg from '@/assets/logo.svg';

export function TileStatic() {
  return (
    <img
      src={logoSvg}
      alt=""
      aria-hidden
      className="col-start-1 row-start-1 z-[1] h-[40vh] w-[40vh] max-h-[40vh] max-w-[60vw] scale-100 [pointer-events:fill] [will-change:scale]"
    />
  );
}
