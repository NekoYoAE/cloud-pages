import { Icon } from '@/components/Icon';
import { MaskIcon } from '@/components/MaskIcon';
import { NavBar } from '@/components/NavBar';
import { platforms } from '@/data/platforms';

export function ContactPage() {
  return (
    <main className="grid h-screen justify-center">
      <h1 className="pointer-events-none fixed bottom-0 left-8 z-[-1] m-0 skew-x-[-10deg] text-[30vh] leading-[1.1em] text-accent opacity-10 select-none">
        Contact
      </h1>
      <NavBar />

      <div className="relative mt-24 h-max max-h-[calc(100vh-9rem-3vw)] min-h-16 w-[80vw] max-w-[calc(300px+3vw)] overflow-y-scroll rounded-[0.4rem] bg-ink px-[1.5vw] py-[22px] shadow-[0_4px_15px_#0000004d] max-[735px]:h-[80vh] max-[735px]:max-h-[80vh] max-[735px]:w-screen max-[735px]:max-w-screen max-[735px]:bg-transparent max-[735px]:shadow-none">
        <div className="mx-auto w-max text-fg">
          {platforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              className="group my-5 grid grid-cols-[auto_1fr] items-center fill-fg text-[1.2em] text-fg no-underline transition-colors duration-300 hover:fill-accent hover:text-accent"
            >
              <div className="h-[1.1em]">
                {platform.image ? (
                  <MaskIcon
                    src={platform.image}
                    className="aspect-62/54 h-5 bg-fg transition-colors duration-300 group-hover:bg-accent"
                  />
                ) : platform.icon ? (
                  <Icon name={platform.icon} className="h-5" />
                ) : null}
              </div>
              <h2 className="ml-4 text-[1.2rem] font-normal">{platform.name}</h2>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
