import Link from 'next/link';
import {notFound} from 'next/navigation';
import {projects, kindLabel, type Screenshot} from '@/lib/projects';
import ProjectImage from '@/components/ProjectImage';
import ProjectCard from '@/components/ProjectCard';
import SmoothScroll from '@/components/SmoothScroll';

export function generateStaticParams() { return projects.map(p => ({slug: p.slug})); }
export async function generateMetadata({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params; const p = projects.find(p => p.slug === slug);
  return {title: p?.name ?? 'Project not found', description: p?.summary};
}

function Shot({s, lead = false}: {s: Screenshot; lead?: boolean}) {
  const image = <ProjectImage large screenshot={s} priority={lead}/>;
  // Phone captures are small in the row, so each one opens at full size.
  return <figure className={`cs-frame ${s.kind === 'desktop' ? '' : 'cs-phone'}`} data-reveal>
    {s.kind === 'desktop' ? image : <a className="shot-link" href={s.src} target="_blank" rel="noopener" aria-label={`Open full-size screenshot (new tab): ${s.caption}`}>{image}</a>}
    <figcaption>{s.kind !== 'desktop' && <span className="kind-tag">{kindLabel[s.kind]}</span>}{s.caption}</figcaption>
  </figure>;
}

function Chapter({n, title, children}: {n: string; title: string; children: React.ReactNode}) {
  return <section className="cs-chapter" data-reveal><div className="cs-chapter-head"><span>{n}</span><h2>{title}</h2></div><div>{children}</div></section>;
}

export default async function CaseStudy({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params; const index = projects.findIndex(p => p.slug === slug); if (index < 0) notFound();
  const p = projects[index], nextIndex = (index + 1) % projects.length, next = projects[nextIndex];
  const [lead, ...rest] = p.screenshots;
  const desktop = rest.filter(s => s.kind === 'desktop'), phone = rest.filter(s => s.kind !== 'desktop');
  const native = phone.some(s => s.kind === 'native-android');
  return <>
    <SmoothScroll/>
    <header className="site-header case-header"><Link className="wordmark" href="/">Crescen<span>Dev</span></Link><Link href="/#work">← Back to the collection</Link></header>
    <main id="main" className="cs" style={{'--project-accent': p.color, '--accent': p.color} as React.CSSProperties}>
      <section className="cs-hero">
        <div className="cs-word" aria-hidden="true">{p.short.toUpperCase()}</div>
        <div className="cs-hero-copy">
          <p className="cw-kicker cs-kicker">Card No. 0{index + 1} / 05 · {p.category}{p.ai && ' · AI-assisted'}</p>
          <h1>{p.name}</h1>
          <p className="cs-lead">{p.summary}</p>
          <dl className="cs-stats">
            <div><dt>Built for</dt><dd>{p.audience}</dd></div>
            <div><dt>Stack</dt><dd>{p.stack.join(' · ')}</dd></div>
          </dl>
        </div>
        <div className="cs-hero-card"><ProjectCard project={p} index={index}/></div>
      </section>

      <Shot s={lead} lead/>
      <Chapter n="01" title="The problem"><p>{p.problem}</p></Chapter>
      <Chapter n="02" title="How it works"><ol className="cs-steps">{p.workflow.map((step, i) => <li key={step}><span>0{i + 1}</span><p>{step}</p></li>)}</ol></Chapter>
      {desktop.map(s => <Shot key={s.id} s={s}/>)}
      {phone.length > 0 && <Chapter n="03" title="On the phone"><p>{native ? 'A native Android app, built with Expo.' : 'The same web app on a phone browser.'}</p><div className="cs-phone-row">{phone.map(s => <Shot key={s.id} s={s}/>)}</div></Chapter>}
      <Chapter n={phone.length > 0 ? '04' : '03'} title="Key decisions"><div className="cs-decisions">{p.decisions.map(d => <div className="cs-decision" key={d.title}><h3>{d.title}</h3><p>{d.body}</p></div>)}</div></Chapter>
      <Chapter n={phone.length > 0 ? '05' : '04'} title="Status"><p>{p.status}</p></Chapter>

      <section className="cs-next" data-reveal>
        <div><p className="cw-kicker">Next in the collection</p><h2>{next.name}</h2><Link className="text-link" href={`/work/${next.slug}`}>Open card <span>↗</span></Link></div>
        <div className="cs-next-card" style={{'--accent': next.color} as React.CSSProperties}><ProjectCard project={next} index={nextIndex}/></div>
      </section>
    </main>
  </>;
}
