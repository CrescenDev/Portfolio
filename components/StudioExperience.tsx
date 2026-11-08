'use client';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { projects } from '@/lib/projects';
const World = dynamic(() => import('./World'), { ssr: false });
function goToChapter(id: string, behavior: ScrollBehavior = 'instant') {
  const el = document.getElementById(id);
  if(!el) return;
  const inWorld = document.documentElement.classList.contains('studio-3d');
  const offset = inWorld && projects.some(p=>p.slug===id) ? el.offsetHeight * .3 : 0;
  window.scrollTo({top:el.offsetTop + offset,behavior});
}
export default function StudioExperience() {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState('entrance');
  const [message, setMessage] = useState('');
  const disable = useCallback((reason?: string) => {
    const id = document.querySelector('[data-current="true"]')?.getAttribute('href')?.slice(1);
    setEnabled(false); setReady(false);
    document.documentElement.classList.remove('studio-3d');
    if (reason) setMessage(reason);
    if(id && id !== 'entrance') requestAnimationFrame(() => goToChapter(id));
  }, []);
  useEffect(() => {
    const media = matchMedia('(min-width: 768px) and (prefers-reduced-motion: no-preference)');
    const update = () => { if(media.matches && localStorage.getItem('ember-flat') !== 'yes') setEnabled(true); else disable(); };
    update(); media.addEventListener('change', update);
    const chapters = [...document.querySelectorAll<HTMLElement>('[data-chapter]')];
    const onScroll = () => {
      const current = chapters.filter(el => el.getBoundingClientRect().top <= innerHeight * .5).at(-1);
      setActive(current?.id ?? 'entrance');
    };
    addEventListener('scroll', onScroll, {passive:true}); onScroll();
    const restore = sessionStorage.getItem('ember-return');
    if(restore) {
      sessionStorage.removeItem('ember-return');
      requestAnimationFrame(() => { goToChapter(restore); document.getElementById(`link-${restore}`)?.focus({preventScroll:true}); });
    }
    const onAnchor = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if(!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const id=link.hash.slice(1);
      if(!document.getElementById(id)?.hasAttribute('data-chapter'))return;
      event.preventDefault();history.pushState(null,'',link.hash);
      goToChapter(id,matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth');
    };
    const onHistory=()=>goToChapter(location.hash.slice(1)||'entrance');
    document.addEventListener('click',onAnchor);addEventListener('popstate',onHistory);
    return () => { document.removeEventListener('click',onAnchor);removeEventListener('popstate',onHistory);media.removeEventListener('change',update); removeEventListener('scroll',onScroll); document.documentElement.classList.remove('studio-3d'); };
  }, [disable]);
  const worldReady = useCallback(() => { document.documentElement.classList.add('studio-3d'); setReady(true); requestAnimationFrame(() => { const id=location.hash.slice(1)||sessionStorage.getItem('ember-return'); if(id) goToChapter(id); }); }, []);
  const toggle = () => {
    if(enabled) {localStorage.setItem('ember-flat','yes'); disable();}
    else { localStorage.removeItem('ember-flat'); if(matchMedia('(min-width: 768px) and (prefers-reduced-motion: no-preference)').matches) {setEnabled(true);setMessage('');} else setMessage('The lightweight view is active for this screen or motion preference.'); }
  };
  return <>
    {enabled && <World onReady={worldReady} onFallback={disable}/>}
    <nav className="chapter-nav" aria-label="Studio chapters"><a href="#entrance" aria-label="Entrance" data-current={active==='entrance'}><span className="chapter-dot"/></a>{projects.map((p,i)=><a key={p.slug} href={`#${p.slug}`} title={p.name} aria-label={`${i+1}. ${p.name}`} aria-current={active===p.slug?'location':undefined} data-current={active===p.slug}><span className="chapter-dot"/><span className="chapter-tooltip">{p.short}</span></a>)}<a href="#about" aria-label="About" data-current={active==='about'}>A</a><a href="#contact" aria-label="Contact" data-current={active==='contact'}>↗</a></nav>
    <div className="view-control"><span className={`status-light ${ready?'live':''}`}/><button onClick={toggle}>{enabled?'View without 3D':'Explore in 3D'}</button></div>
    <span className="sr-only" role="status">{message}</span>
  </>;
}
