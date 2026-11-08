'use client';
import {useEffect} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Smooth, weighted scrolling plus a soft rise-in for anything marked data-reveal.
export default function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({lerp: 0.09, anchors: true});
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(el => {
        gsap.from(el, {y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: {trigger: el, start: 'top 88%'}});
      });
    });
    return () => { ctx.revert(); gsap.ticker.remove(raf); lenis.destroy(); };
  }, []);
  return null;
}
