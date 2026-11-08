'use client';
import {Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode} from 'react';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import {useTexture} from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {projects} from '@/lib/projects';
import {roomPosition} from '@/lib/scene-config';

class SceneBoundary extends Component<{children:ReactNode;onError:()=>void},{failed:boolean}>{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(){this.props.onError();}
  render(){return this.state.failed?null:this.props.children;}
}
function Box({position,size,color='#231a17',glow=false}:{position:[number,number,number];size:[number,number,number];color?:string;glow?:boolean}){
  return <mesh position={position}><boxGeometry args={size}/>{glow?<meshBasicMaterial color={color}/>:<meshStandardMaterial color={color} roughness={.85}/>}</mesh>;
}
function Portal({z,x=0,color='#ff641f'}:{z:number;x?:number;color?:string}){
  return <group position={[x,0,z]}><Box position={[-5,3,0]} size={[.055,6,.12]} color={color} glow/><Box position={[5,3,0]} size={[.055,6,.12]} color={color} glow/><Box position={[0,6,0]} size={[10,.055,.12]} color={color} glow/><Box position={[0,.025,0]} size={[10,.05,.12]} color={color} glow/></group>;
}
function roundedShape(w:number,h:number,r:number){
  const s=new THREE.Shape(),x=-w/2,y=-h/2;
  s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
  return s;
}
// A flat rounded rectangle whose UVs span 0 to 1, so the screenshot fills it with rounded corners.
function roundedPlane(w:number,h:number,r:number){
  const g=new THREE.ShapeGeometry(roundedShape(w,h,r),10),pos=g.attributes.position,uv=g.attributes.uv;
  for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)+w/2)/w,(pos.getY(i)+h/2)/h);
  return g;
}
type Device='monitor'|'phone';
const DEVICE={
  monitor:{bezel:.07,chin:0,radius:.07,screenRadius:.025,depth:.16,color:'#141416'},
  phone:{bezel:.055,chin:0,radius:.2,screenRadius:.15,depth:.09,color:'#1c1c1f'}
};
// Devices float, placed by their centre.
function Picture({src,position,width=7,height=4.4,device='monitor',rotation=[0,0,0]}:{src:string;position:[number,number,number];width?:number;height?:number;device?:Device;rotation?:[number,number,number]}){
  const texture=useTexture(src);
  texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;
  const image=texture.image as {width:number;height:number};
  const ratio=image.width/image.height;
  const w=Math.min(width,height*ratio),h=w/ratio;
  return <group position={position} rotation={rotation}><DeviceBody texture={texture} w={w} h={h} device={device}/></group>;
}
function DeviceBody({texture,w,h,device}:{texture:THREE.Texture;w:number;h:number;device:Device}){
  const d=DEVICE[device];
  // The device body hugs the fitted image, so landscape and portrait captures are never stretched or letterboxed.
  const bw=w+d.bezel*2,bh=h+d.bezel*2+d.chin,bevel=.012;
  const body=useMemo(()=>new THREE.ExtrudeGeometry(roundedShape(bw,bh,d.radius),{depth:d.depth,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:3,curveSegments:10}),[bw,bh,d.radius,d.depth]);
  const screen=useMemo(()=>roundedPlane(w,h,d.screenRadius),[w,h,d.screenRadius]);
  useEffect(()=>()=>{body.dispose();screen.dispose();},[body,screen]);
  return <group>
    {/* Satin metal body: catches the room's warm light along its rounded edges. */}
    <mesh geometry={body} position={[0,-d.chin/2,-d.depth-bevel-.004]}><meshStandardMaterial color={d.color} metalness={.75} roughness={.32}/></mesh>
    <mesh geometry={screen}><meshBasicMaterial map={texture} toneMapped={false}/></mesh>
    {device==='phone'&&<mesh position={[0,h/2-.07,.002]}><circleGeometry args={[.028,20]}/><meshBasicMaterial color="#050506"/></mesh>}
  </group>;
}
// The hero photo as a plane that exactly covers the first camera view (camera at z=8, fov 52, looking at y=3),
// matching the centered HTML photo, so the hand-off is invisible. Scrolling pulls straight back from it
// (the photo only ever shrinks, so it stays sharp) and it fades out before the first room.
const HERO_DISTANCE=8,HERO_FOV=52;
const hero={fade:1};
function HeroPortrait(){
  const texture=useTexture('/images/portrait.jpg');
  texture.colorSpace=THREE.SRGBColorSpace;
  const {width,height}=useThree(s=>s.size);
  const group=useRef<THREE.Group>(null),photo=useRef<THREE.MeshBasicMaterial>(null),frame=useRef<THREE.MeshBasicMaterial>(null);
  useFrame(()=>{
    if(!group.current||!photo.current||!frame.current)return;
    group.current.visible=hero.fade>.01;photo.current.opacity=hero.fade;frame.current.opacity=hero.fade;
  });
  const image=texture.image as {width:number;height:number};
  const ratio=image.width/image.height;
  const viewH=2*HERO_DISTANCE*Math.tan(THREE.MathUtils.degToRad(HERO_FOV/2)),viewW=viewH*width/height;
  const w=Math.max(viewW,viewH*ratio),h=w/ratio;
  return <group ref={group} position={[0,3,0]}><mesh position={[0,0,-.06]}><planeGeometry args={[w+.24,h+.24]}/><meshBasicMaterial ref={frame} color="#0c0a09" transparent/></mesh><mesh><planeGeometry args={[w,h]}/><meshBasicMaterial ref={photo} map={texture} toneMapped={false} transparent/></mesh></group>;
}
// One soft radial glow texture, shared by every room as the backlight behind its devices.
let glowTexture:THREE.CanvasTexture|null=null;
function getGlow(){
  if(glowTexture)return glowTexture;
  const c=document.createElement('canvas');c.width=c.height=256;
  const g=c.getContext('2d')!,grad=g.createRadialGradient(128,128,0,128,128,128);
  grad.addColorStop(0,'rgba(255,255,255,1)');grad.addColorStop(.35,'rgba(255,255,255,.45)');grad.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=grad;g.fillRect(0,0,256,256);
  return glowTexture=new THREE.CanvasTexture(c);
}
// Each project gets its own arrangement of floating devices, so no two rooms look alike.
// Positions are room-local; the resting camera looks at about x 2.8, y 3 from the front-left.
type Piece={id:string;device:Device;pos:[number,number,number];rot:[number,number,number];w:number;h:number};
const LAYOUTS:Record<string,Piece[]>={
  // A monitor with the athlete app in front of it.
  'the-forge-ph':[
    {id:'forge-01-coach-dashboard',device:'monitor',pos:[2.4,3.3,-1.4],rot:[0,.16,0],w:5.4,h:3.4},
    {id:'forge-08-native-today',device:'phone',pos:[5.4,2.6,.5],rot:[0,-.32,.03],w:1.2,h:2.6}],
  // Two screens layered like steps in the workflow, with the phone review in front.
  'inbox-to-action':[
    {id:'inbox-to-action-01-inbox',device:'monitor',pos:[3.9,4,-3],rot:[0,-.22,0],w:4.8,h:3},
    {id:'inbox-to-action-03-review-extraction',device:'monitor',pos:[2.1,2.7,-.6],rot:[0,.2,0],w:4.4,h:2.75},
    {id:'inbox-to-action-03-review-extraction-phone',device:'phone',pos:[5.3,2.4,.8],rot:[0,-.35,0],w:1,h:2.2}],
  // The clinic screen behind, the pet-owner app twice in front.
  'lj-vet':[
    {id:'ljvet-04-pets-clients',device:'monitor',pos:[2.1,3.6,-2.2],rot:[0,.2,0],w:4.8,h:3},
    {id:'ljvet-08-native-home',device:'phone',pos:[3.8,2.5,.7],rot:[0,-.1,0],w:1.15,h:2.5},
    {id:'ljvet-09-native-visits',device:'phone',pos:[5.7,3.15,-1],rot:[0,-.3,0],w:1.1,h:2.4}],
  // Phones only: booking and tracking are what customers see.
  'laundrogo':[
    {id:'laundrogo-03-booking-phone',device:'phone',pos:[2.7,3,-.3],rot:[0,.22,-.03],w:1.55,h:3.3},
    {id:'laundrogo-05-order-timeline-phone',device:'phone',pos:[4.8,3.3,-1.3],rot:[0,-.2,.025],w:1.55,h:3.3}],
  // One large screen, turned toward the visitor: the front desk view.
  'alt-ave':[
    {id:'altave-01-timekeeper-live',device:'monitor',pos:[3,3.2,-1.2],rot:[0,-.28,0],w:6.2,h:3.9}]
};
function Room({index,load}:{index:number;load:boolean}){
  const p=projects[index],pos=roomPosition(index),glow=getGlow();
  const pieces=(LAYOUTS[p.slug]??[]).map(piece=>({...piece,src:p.screenshots.find(s=>s.id===piece.id)?.src})).filter(piece=>piece.src);
  return <group position={pos}>
    <mesh position={[0,-.18,0]}><boxGeometry args={[18,.3,22]}/><meshStandardMaterial color="#120d0b" roughness={.85} metalness={0}/></mesh>
    {/* Backlight: a soft halo of the project colour behind the devices. */}
    <mesh position={[3.4,3.4,-3.6]}><planeGeometry args={[16,10]}/><meshBasicMaterial map={glow} color={p.color} transparent opacity={.32} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false}/></mesh>
    {pieces.map(piece=><group key={piece.id}>
      {/* A soft contact shadow on the floor under each floating device. */}
      <mesh position={[piece.pos[0],-.02,piece.pos[2]]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[piece.device==='phone'?2:piece.w*1.1,piece.device==='phone'?1.2:1.8]}/><meshBasicMaterial map={glow} color="#000" transparent opacity={.7} depthWrite={false}/></mesh>
      {load&&<Suspense fallback={null}><Picture src={piece.src!} position={piece.pos} rotation={piece.rot} width={piece.w} height={piece.h} device={piece.device}/></Suspense>}
    </group>)}
    <pointLight position={[2.5,5.5,4]} color="#ffe4cf" intensity={30} distance={18}/>
  </group>;
}
function Journey({onReady,onFallback}:{onReady:()=>void;onFallback:(reason?:string)=>void}){
  const {camera,gl,invalidate}=useThree();
  const [current,setCurrent]=useState(0);
  const state=useRef({z:8,x:0,y:3,tx:0,ty:3,tz:0});
  const movingUntil=useRef(0),slowFor=useRef(0),warmUntil=useRef(0);
  useEffect(()=>{
    gsap.registerPlugin(ScrollTrigger);
    onReady(); warmUntil.current=performance.now()+4000;
    const context=gsap.context(()=>{
      const timeline=gsap.timeline({paused:true});
      // The master timeline has one normalized segment per measured chapter.
      // Entrance: pull straight back from the centered photo, which fades out before the first room.
      timeline.to(state.current,{z:13,x:0,y:3.1,tx:0,ty:3,tz:0,duration:1,ease:'none'});
      timeline.fromTo(hero,{fade:1},{fade:0,duration:.45,ease:'power1.in'},.15);
      // Rest framing: close on the devices, which sit in the right half beside the project text.
      // Narrower screens step back a little so the phone stays in view.
      const back=Math.max(1,1.6/(innerWidth/innerHeight));
      projects.forEach((_,i)=>{
        const [x,,z]=roomPosition(i);
        timeline.to(state.current,{x:x-1.6,z:z+7.8*back,y:3.15,tx:x+.8,ty:2.75,tz:z-1.5,duration:.25,ease:'power2.inOut'});
        timeline.to(state.current,{duration:.75});
      });
      const last=roomPosition(4);
      timeline.to(state.current,{x:0,z:last[2]-10,y:3,tx:0,ty:2.8,tz:last[2]-24,duration:1});
      const update=()=>{
        // Each move starts when its section enters the bottom of the screen and ends as the title settles,
        // so the camera travels while the title scrolls in instead of after it.
        const y=scrollY,vh=innerHeight;
        const starts=projects.map(p=>document.getElementById(p.slug)!.offsetTop-vh);
        const aboutStart=document.getElementById('about')!.offsetTop-vh;
        let t=0;
        if(y<starts[0]){t=Math.min(1,y/Math.max(1,starts[0]));}
        else if(y>=aboutStart){t=6+Math.min(1,(y-aboutStart)/vh);setCurrent(4);}
        else {
          const idx=starts.findLastIndex(s=>y>=s);
          const end=idx<4?starts[idx+1]:aboutStart,len=Math.max(1,end-starts[idx]);
          const travel=Math.min(vh,len*.6),d=y-starts[idx];
          t=1+idx+(d<travel?.25*d/travel:.25+.75*Math.min(1,(d-travel)/Math.max(1,len-travel)));
          setCurrent(idx);
        }
        timeline.time(t,false); movingUntil.current=performance.now()+120;invalidate();
      };
      ScrollTrigger.create({start:0,end:'max',onUpdate:update,onRefresh:update});
      document.fonts.ready.then(()=>ScrollTrigger.refresh());
      ScrollTrigger.refresh();update();
    });
    const lost=(event:Event)=>{event.preventDefault();onFallback('3D is unavailable. The lightweight studio is ready.');};
    gl.domElement.addEventListener('webglcontextlost',lost);
    return()=>{context.revert();gl.domElement.removeEventListener('webglcontextlost',lost);};
  },[camera,gl,invalidate,onReady,onFallback]);
  useFrame((_,delta)=>{
    const s=state.current; camera.position.set(s.x,s.y,s.z);camera.lookAt(s.tx,s.ty,s.tz);
    const now=performance.now();
    if(now<movingUntil.current){
      // Frames over 0.5 s (tab switches, stalls) are skipped, not treated as recovery, so very slow devices still fall back.
      if(now>warmUntil.current&&delta>1/30){if(delta<.5)slowFor.current+=delta;}else slowFor.current=0;
      if(slowFor.current>=5)onFallback('Switched to the lightweight studio to keep scrolling smooth.');
      invalidate();
    // At low frame rates the next frame can land after the 120 ms movement window; only a real pause resets the count.
    }else if(now>movingUntil.current+500)slowFor.current=0;
  });
  return <><color attach="background" args={['#100c0b']}/><fog attach="fog" args={['#100c0b',13,27]}/><ambientLight intensity={1.1}/><hemisphereLight args={['#ffc79a','#100c0b',1.8]}/><pointLight position={[0,5,6]} color="#ff641f" intensity={50}/><Suspense fallback={null}><HeroPortrait/></Suspense><Portal z={-8} x={-1}/><Box position={[0,-.2,-65.5]} size={[25,.2,130]}/>{projects.map((p,i)=><Room key={p.slug} index={i} load={Math.abs(i-current)<=1}/>)}<Portal z={-133}/><Box position={[0,1,-131]} size={[5,.2,2]}/><Box position={[-2,.5,-131]} size={[.2,1,2]}/><Box position={[2,.5,-131]} size={[.2,1,2]}/></>;
}
export default function World({onReady,onFallback}:{onReady:()=>void;onFallback:(reason?:string)=>void}){
  useEffect(()=>{const canvas=document.createElement('canvas');const ctx=canvas.getContext('webgl2');if(!ctx)onFallback('3D is unavailable. The lightweight studio is ready.');else ctx.getExtension('WEBGL_lose_context')?.loseContext();},[onFallback]);
  return <div className="world" aria-hidden="true"><SceneBoundary onError={()=>onFallback('The lightweight studio is ready.')}><Canvas camera={{position:[0,3,8],fov:52,near:.1,far:70}} frameloop="demand" dpr={[1,1.5]} gl={{antialias:true,powerPreference:'high-performance'}}><Journey onReady={onReady} onFallback={onFallback}/></Canvas></SceneBoundary></div>;
}
