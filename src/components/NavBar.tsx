import { Link, useLocation } from 'react-router-dom';

import logo from '@/assets/micahlt-small.png';

const NAV_ITEMS = [
  { to: '/', label: 'Home', hideOnMobile: true },
  { to: '/projects', label: 'Projects', hideOnMobile: false },
  { to: '/contact', label: 'Contact', hideOnMobile: false },
] as const;

export function NavBar() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed top-0 left-0 z-20 grid h-16 w-full grid-cols-[auto_auto] bg-accent shadow-[0_3px_10px_#0000004d]">
      <div>
        <Link to="/" aria-label="Home">
          <img
            src={logo}
            alt=""
            className="mt-4 mr-8 mb-4 ml-[5vw] h-4 active:opacity-50 max-[735px]:mt-[1.15rem] max-[735px]:h-[0.8rem]"
          />
        </Link>
      </div>

      <div className="mt-[1.2rem] mr-[5vw] mb-[1.2rem] ml-0 text-right">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            aria-current={pathname === item.to ? 'page' : undefined}
            className={[
              'relative ml-7 text-ink uppercase no-underline',
              "before:absolute before:bottom-[0.1em] before:left-1/2 before:h-[0.5em] before:w-[112%] before:-translate-x-1/2 before:bg-ink before:content-['']",
              pathname === item.to ? 'before:opacity-25' : 'before:opacity-0',
              item.hideOnMobile ? 'max-[735px]:hidden' : '',
            ].join(' ')}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
