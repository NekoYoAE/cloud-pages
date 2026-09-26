import { iconPaths, type IconName } from '@/lib/iconPaths';

interface IconProps {
  name: IconName;
  className: string;
}

export function Icon({ name, className }: IconProps) {
  const { title, paths } = iconPaths[name];

  return (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className}>
      <title>{title}</title>
      {paths.map((d) => (
        <path key={d.slice(0, 32)} d={d} />
      ))}
    </svg>
  );
}
