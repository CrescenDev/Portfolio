import Image from 'next/image';
import type { Screenshot } from '@/lib/projects';
export default function ProjectImage({ screenshot, large = false, priority = false }: { screenshot: Screenshot; large?: boolean; priority?: boolean }) {
  const portrait = screenshot.kind !== 'desktop';
  const sizes = portrait ? '(max-width: 767px) 44vw, 320px' : large ? '(max-width: 767px) 100vw, 1100px' : '(max-width: 767px) 100vw, 60vw';
  return <div className={`screen-image ${large ? 'large' : ''} ${portrait ? 'portrait' : ''} kind-${screenshot.kind}`}><Image src={screenshot.src} alt={screenshot.alt} width={screenshot.width} height={screenshot.height} sizes={sizes} priority={priority} style={{width:'100%',height:'auto'}} /></div>;
}
