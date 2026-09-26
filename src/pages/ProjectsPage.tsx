import type { CSSProperties } from 'react';

import { NavBar } from '@/components/NavBar';
import { projects } from '@/data/projects';
import { site } from '@/data/site';
import type { Project } from '@/types';

const STRIP_ITEM_CLASS = [
  'group/item relative flex min-h-[4.5rem] w-full grow basis-0 cursor-[inherit] flex-col items-center justify-center overflow-hidden no-underline',
  'transition-all duration-[750ms] hover:grow-[15] hover:duration-[250ms]',
  'group-hover/strip:not-hover:grow-0 group-hover/strip:not-hover:brightness-[0.4] group-hover/strip:not-hover:grayscale',
].join(' ');

const STRIP_IMAGE_CLASS = [
  'h-[clamp(1.5rem,calc(var(--strip-h)*0.38),4rem)] w-auto max-w-[80%] rounded-[0.3rem] object-contain',
  'transition-all duration-[750ms] group-hover/item:h-[clamp(2rem,calc(var(--strip-h)*0.55),5.75rem)] group-hover/item:duration-[250ms]',
].join(' ');

const STRIP_TEXT_CLASS = [
  'absolute bottom-4 left-0 w-[calc(100%-4rem)] pl-8 text-center opacity-0 transition-opacity duration-150',
  'text-[clamp(0.75rem,calc(var(--strip-h)*0.14),1.5rem)] group-hover/item:opacity-80',
  'max-[1360px]:text-[clamp(0.75rem,calc(var(--strip-h)*0.11),1rem)]',
].join(' ');

function ProjectStrip({ project }: { project: Project }) {
  const content = (
    <>
      <img src={project.image} alt={project.name} decoding="async" className={STRIP_IMAGE_CLASS} />
      {project.subtitle ? (
        <p className={`${STRIP_TEXT_CLASS} ${project.light ? 'text-ink' : 'text-white'}`}>{project.subtitle}</p>
      ) : null}
    </>
  );

  const style = { background: project.color };

  if (!project.url) {
    return (
      <div className={STRIP_ITEM_CLASS} style={style}>
        {content}
      </div>
    );
  }

  return (
    <a href={project.url} target="_blank" rel="noreferrer" className={STRIP_ITEM_CLASS} style={style}>
      {content}
    </a>
  );
}

export function ProjectsPage() {
  const stripHeight = `calc((100vh - 4rem) / ${projects.length + 1})`;

  return (
    <main>
      <NavBar />

      <div
        className="group/strip flex h-screen w-full flex-col items-stretch overflow-y-auto pt-16"
        style={{ '--strip-h': stripHeight } as CSSProperties}
      >
        {projects.map((project) => (
          <ProjectStrip key={project.name} project={project} />
        ))}

        <a
          href={site.github}
          target="_blank"
          rel="noreferrer"
          className={`${STRIP_ITEM_CLASS} bg-accent text-center font-bold`}
        >
          <h2 className="m-auto w-max text-[clamp(0.875rem,calc(var(--strip-h)*0.16),1.5rem)] text-ink">
            See more on my <span className="max-[1360px]:underline">GitHub</span>
          </h2>
        </a>
      </div>
    </main>
  );
}
