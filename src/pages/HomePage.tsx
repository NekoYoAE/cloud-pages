import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Icon } from '@/components/Icon';
import { MaskIcon } from '@/components/MaskIcon';
import { TileRing } from '@/components/tile/TileRing';
import { TileStatic } from '@/components/tile/TileStatic';
import { site } from '@/data/site';
import { socials } from '@/data/socials';

const LINK_CLASS = 'font-medium text-inherit transition-none';

export function HomePage() {
  const [flipped, setFlipped] = useState(false);

  const [avatarReady, setAvatarReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setAvatarReady(true), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="grid min-h-screen w-full grid-cols-2 max-[1070px]:grid-cols-[auto] max-[1070px]:grid-rows-[auto_auto]">
      <div className="relative grid h-screen items-center justify-center bg-accent max-[1070px]:h-[40vh] max-[1070px]:min-h-full">
        <div
          className="group/tile reveal-item grid grid-cols-[auto] grid-rows-[auto] items-center justify-items-center select-none"
          onMouseEnter={() => {
            setFlipped(true);

            setAvatarReady(true);
          }}
          onMouseLeave={() => setFlipped(false)}
        >
          <TileStatic />
          <TileRing />
          {avatarReady && (
            <img
              src={site.avatar}
              alt=""
              draggable={false}
              decoding="async"
              className={[
                'col-start-1 row-start-1 max-h-[30vh] max-w-[50vw] select-none rounded-full transition-all duration-300 [-webkit-user-drag:none]',
                flipped ? 'z-[5] scale-100 opacity-100' : 'z-[4] scale-[0.1] opacity-0',
              ].join(' ')}
            />
          )}
        </div>
      </div>

      <div className="grid items-center justify-center bg-ink">
        <div className="mx-auto my-4 max-w-[480px] px-10 py-4">
          <h1 className="mb-[0.2em] text-[4rem] leading-none text-accent max-[510px]:text-[2.5rem] whitespace-nowrap">
            Hi, I&apos;m NeKoYo
          </h1>

          <p className="text-fg">
            I&apos;m a self-described &ldquo;not-quite-full-stack&rdquo; developer. Most of what I build lives in the
            browser, written in{' '}
            <a className={LINK_CLASS} href="https://developer.mozilla.org/en-US/docs/Web/JavaScript">
              JavaScript
            </a>{' '}
            and{' '}
            <a className={LINK_CLASS} href="https://svelte.dev/">
              Svelte
            </a>
            , bundled with{' '}
            <a className={LINK_CLASS} href="https://vitejs.dev/">
              Vite
            </a>{' '}
            and sometimes served from{' '}
            <a className={LINK_CLASS} href="https://workers.cloudflare.com/">
              Cloudflare Workers
            </a>
            .
            <br />
            <br /> Much of what I make grows out of{' '}
            <a className={LINK_CLASS} href="https://www.ccw.site">
              CCW
            </a>
            . That is where OpenCCW came from, as did ProfileCard, which turns a community profile into a card you can
            paste into your bio. I also pitch in on{' '}
            <a className={LINK_CLASS} href="https://esotericsoftware.com/">
              Spine
            </a>{' '}
            skeletal animation tooling for{' '}
            <a className={LINK_CLASS} href="https://getgandi.com/">
              Gandi
            </a>
            .
            <br />
            <br /> While you&apos;re here, feel free to check out my{' '}
            <Link className="text-accent" to="/projects">
              projects
            </Link>{' '}
            or{' '}
            <Link className="text-accent" to="/contact">
              get in touch
            </Link>
            .{' '}
          </p>

          <div className="reveal-item mt-[1.5em] flex items-center">
            {socials.map((social) => (
              <a
                key={social.icon ?? social.label}
                href={social.url}
                aria-label={social.label}
                className="group mr-[1.2rem] fill-muted transition-all duration-200 hover:fill-accent"
              >
                {social.image ? (
                  <MaskIcon
                    src={social.image}
                    className="aspect-62/54 h-5 bg-muted transition-colors duration-200 group-hover:bg-accent"
                  />
                ) : social.icon ? (
                  <Icon name={social.icon} className="h-5" />
                ) : null}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
