import openccw from '@/assets/projects/openccw.svg';
import otmusic from '@/assets/projects/otmusic.svg';
import profilecard from '@/assets/projects/profilecard.svg';
import spineAnimation from '@/assets/projects/spineAnimation.svg';
import type { Project } from '@/types';

export const projects: Project[] = [
  {
    name: 'OpenCCW',
    image: openccw,
    subtitle: 'A security-focused third-party launcher for CCW',
    url: 'https://ccw.kivotos.qzz.io/',
    color: '#1c1c1c',
  },
  {
    name: 'otmusic',
    image: otmusic,
    subtitle: 'A lightweight music player that runs in your browser',
    url: 'https://music.nekoyo.cloud/',
    color: '#242424',
  },
  {
    name: 'spineAnimation',
    image: spineAnimation,
    subtitle: 'A Spine runtime extension for the Gandi editor',
    url: 'https://github.com/BenPaoDeXiaoZhi/spineExtension',
    color: '#141414',
  },
  {
    name: 'ProfileCard',
    image: profilecard,
    subtitle: 'Turn your CCW profile into a shareable card',
    url: 'https://profilecard.nekoyo.cloud',
    color: '#1a1a1a',
  },
];
