'use client';
import Link from 'next/link';
export default function CaseLink({slug}: {slug:string}) {
  return <Link id={`link-${slug}`} className="text-link" href={`/work/${slug}`} onClick={() => sessionStorage.setItem('ember-return',slug)}>View case study <span aria-hidden="true">↗</span></Link>;
}
