import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { projects } from '../lib/projects.ts';
import { chapterTravel, roomPosition } from '../lib/scene-config.ts';
type ManifestEntry = { id: string; project: string; kind: string; source: string; captured: string; synthetic: boolean; original: string };
const manifest: { screens: ManifestEntry[] } = JSON.parse(readFileSync('assets/screenshots/manifest.json', 'utf8'));
const used = projects.flatMap(p => p.screenshots.map(s => ({ p, s })));
test('all five public case study routes exist and are unique',()=>{
  assert.deepEqual(projects.map(p=>p.slug),['the-forge-ph','inbox-to-action','lj-vet','laundrogo','alt-ave']);
  assert.equal(new Set(projects.map(p=>p.slug)).size,5);
});
test('every project has real screenshots: a desktop primary and supporting screen, no placeholders',()=>{
  for(const p of projects){
    assert.ok(p.screenshots.length>=3,`${p.slug} gallery is too small`);
    assert.equal(p.screenshots[0].kind,'desktop',`${p.slug} primary must be a desktop capture`);
    assert.equal(p.screenshots[1].kind,'desktop',`${p.slug} supporting screen must be a desktop capture`);
    assert.doesNotMatch(p.status,/pending/i,`${p.slug} status still mentions pending screenshots`);
  }
});
test('screenshot files exist and their declared size matches the image',()=>{
  for(const {s} of used){
    const file=`public${s.src}`;
    assert.ok(existsSync(file),`Missing ${s.src}`);
    const buf=readFileSync(file);
    // WebP VP8 header: width and height are 14-bit values at bytes 26..29.
    assert.equal(buf.toString('ascii',12,16),'VP8 ',`${s.src} is not a lossy WebP`);
    assert.equal(buf.readUInt16LE(26)&0x3fff,s.width,`${s.id} width`);
    assert.equal(buf.readUInt16LE(28)&0x3fff,s.height,`${s.id} height`);
    assert.ok(s.alt.length>20&&s.caption.length>10,`${s.id} needs descriptive alt text and caption`);
  }
});
test('the provenance manifest covers exactly the screenshots in use',()=>{
  const ids=used.map(u=>u.s.id).sort();
  assert.deepEqual(manifest.screens.map(m=>m.id).sort(),ids);
  for(const {p,s} of used){
    const m=manifest.screens.find(m=>m.id===s.id)!;
    assert.equal(m.project,p.slug,`${s.id} project`);
    assert.equal(m.kind,s.kind,`${s.id} kind`);
    assert.equal(m.synthetic,true,`${s.id} must use synthetic or demo data`);
    assert.match(m.captured,/^\d{4}-\d{2}-\d{2}$/);
    assert.ok(existsSync(`assets/screenshots/originals/${m.original}`),`Missing original for ${s.id}`);
  }
  assert.doesNotMatch(readFileSync('assets/screenshots/manifest.json','utf8'),/password|secret|api[_-]?key|token/i);
});
test('native captures are labelled as native, mobile-web captures are not presented as apps',()=>{
  for(const {s} of used){
    if(s.kind==='native-android')assert.match(s.caption,/native/i,`${s.id} caption should say native`);
    if(s.kind==='mobile-web')assert.match(s.caption,/mobile web/i,`${s.id} caption should say mobile web`);
  }
});
test('AI claims are limited to the two verified AI projects',()=>assert.deepEqual(projects.filter(p=>p.ai).map(p=>p.slug),['the-forge-ph','inbox-to-action']));
test('camera arrival clamps and holds; rooms progress forward without vertical jumps',()=>{
  assert.equal(chapterTravel(-1),0);assert.equal(chapterTravel(0),0);
  assert.equal(chapterTravel(.25),1);assert.equal(chapterTravel(.75),1);
  for(let i=1;i<5;i++){assert.ok(roomPosition(i)[2]<roomPosition(i-1)[2]);assert.equal(roomPosition(i)[1],0);}
});
