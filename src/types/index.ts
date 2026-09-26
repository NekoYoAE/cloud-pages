import type { IconName } from '@/lib/iconPaths';

export interface Project {
  name: string;
  image: string;
  subtitle?: string;
  url?: string;

  color: string;

  light?: boolean;
}

export interface Platform {
  name: string;

  icon?: IconName;
  url: string;

  image?: string;
}

export interface SocialLink {
  icon?: IconName;
  url: string;

  image?: string;

  label?: string;
}
