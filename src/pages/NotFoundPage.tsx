export function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
      <div className="pointer-events-none absolute bottom-[-155%] left-0 flex w-full items-end justify-center">
        <div className="mx-[-45vh] h-[180vh] w-[180vh] shrink-0 rounded-full bg-[radial-gradient(circle,#FF2D95_0%,transparent_70%)] blur-[200px]" />
        <div className="mx-[-45vh] h-[180vh] w-[180vh] shrink-0 rounded-full bg-[radial-gradient(circle,#00F0B8_0%,transparent_70%)] blur-[200px]" />
      </div>

      <h1 className="relative z-10 text-center leading-none text-white">
        <span className="block text-[clamp(5rem,22vw,14rem)] font-bold">404</span>
        <span className="mt-[0.35em] block text-[clamp(1.5rem,5vw,3rem)] font-bold">这里什么都没有</span>
      </h1>
    </div>
  );
}
