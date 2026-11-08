'use client';
import Link from 'next/link';
import type {CSSProperties, PointerEvent} from 'react';
import type {Project} from '@/lib/projects';

// The collectible project card: tilts toward the pointer with a holographic shine.
function tilt(e: PointerEvent<HTMLAnchorElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  const s = e.currentTarget.style;
  s.setProperty('--mx', `${x * 100}%`); s.setProperty('--my', `${y * 100}%`);
  s.setProperty('--rx', `${(0.5 - y) * 14}deg`); s.setProperty('--ry', `${(x - 0.5) * 14}deg`);
}
function reset(e: PointerEvent<HTMLAnchorElement>) {
  e.currentTarget.style.setProperty('--rx', '0deg'); e.currentTarget.style.setProperty('--ry', '0deg');
}

export default function ProjectCard({project: p, index, className = 'cw-card'}: {project: Project; index: number; className?: string}) {
  return (
    <Link href={`/work/${p.slug}`} className={className} style={{'--accent': p.color} as CSSProperties} onPointerMove={tilt} onPointerLeave={reset}>
      <div className="cw-card-inner">
        <div className="cw-card-top"><span>No. 0{index + 1}</span><span>{p.ai ? 'AI ✳' : 'SYS'}</span></div>
        <div className="cw-shot"><img src={p.screenshots[0].src} alt={p.screenshots[0].alt}/></div>
        <h2>{p.short}</h2>
        <p className="cw-cat">{p.category}</p>
        <p className="cw-stats">{p.stack.slice(0, 3).join(' · ')}</p>
      </div>
    </Link>
  );
}
