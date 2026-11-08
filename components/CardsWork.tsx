'use client';
import {useEffect, useRef} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {projects} from '@/lib/projects';
import ProjectCard from './ProjectCard';

// Each project is a collectible card: a stacked deck that fans out and slides past as you scroll.
const LIFT = [-40, 50, -20, 60, -50];
const TILT = [-4, 3, -2, 4, -3];

export default function CardsWork() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia(root);
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const cards = gsap.utils.toArray<HTMLElement>('.cw-card');
      const step = () => Math.min(380, innerWidth * 0.27);
      gsap.set(cards, {rotation: i => (i - 2) * 3, y: i => -i * 4});
      const tl = gsap.timeline({
        scrollTrigger: {trigger: '.cw-deck', start: 'top top', end: () => `+=${innerHeight * 3.2}`, pin: true, scrub: 0.8, invalidateOnRefresh: true},
      });
      tl.to(cards, {x: i => (i - 2) * step(), y: i => LIFT[i], rotation: i => TILT[i], duration: 1, ease: 'power3.inOut'}, 0)
        .to('.cw-track', {x: () => step() * 1.6, duration: 1, ease: 'power2.inOut'}, 0)
        .to('.cw-intro, .cw-hint', {opacity: 0, y: 30, duration: 0.5}, 0.15)
        .to('.cw-track', {x: () => -step() * 1.6, duration: 2.2, ease: 'none'}, 1)
        .fromTo('.cw-word', {xPercent: 8}, {xPercent: -38, duration: 3.2, ease: 'none'}, 0)
        .fromTo('.cw-markers', {x: 0}, {x: () => -step() * 1.2, duration: 3.2, ease: 'none'}, 0);
    });
    return () => mm.revert();
  }, []);

  return (
    <div className="cw" ref={root}>
      <section className="cw-deck" id="work">
        <div className="cw-word" aria-hidden="true">SELECTED WORK</div>
        <div className="cw-markers" aria-hidden="true">{['01', '02', '03', '04', '05', '04', '03', '02', '01'].map((n, i) => <span key={i}>{n}</span>)}</div>
        <div className="cw-intro">
          <p className="cw-kicker">Selected work</p>
          <h2 className="cw-title">Five apps for<br/>five businesses.</h2>
        </div>
        <div className="cw-track">{projects.map((p, i) => <ProjectCard key={p.slug} project={p} index={i}/>)}</div>
        <p className="cw-hint" aria-hidden="true">Scroll to deal ↓</p>
      </section>
    </div>
  );
}
