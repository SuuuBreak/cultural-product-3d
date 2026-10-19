import { useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import { Shape, Path, Vector2, Group, MathUtils } from 'three'
import { cloudTexture, fabricTexture, surface } from '../lib/materials'
import { hotspots, type MaterialMode } from '../data/product'
const gold={color:'#bc9252',metalness:0.85,roughness:0.28}
function Ellipsoid({position=[0,0,0],scale=[1,1,1],color='#161719',rotation=[0,0,0],plush=false}:{position?:[number,number,number];scale?:[number,number,number];color?:string;rotation?:[number,number,number];plush?:boolean}){
 return <mesh position={position} scale={scale} rotation={rotation} castShadow><sphereGeometry args={[1,32,24]}/><meshStandardMaterial color={color} roughness={plush?.98:.7} bumpMap={plush?fabricTexture():undefined} bumpScale={plush?.04:0}/></mesh>
}
function Part({children,offset,exploded}:{children:ReactNode;offset:[number,number,number];exploded:boolean}){
 const ref=useRef<Group>(null)
 useFrame((_,dt)=>{if(ref.current)offset.forEach((v,i)=>{const key=(['x','y','z'] as const)[i];ref.current!.position[key]=MathUtils.damp(ref.current!.position[key],exploded?v:0,5,dt)})})
 return <group ref={ref}>{children}</group>
}
function Coin(){
 const shape=useMemo(()=>{const s=new Shape();s.absarc(0,0,.195,0,Math.PI*2,false);const hole=new Path();hole.moveTo(-.062,-.062);hole.lineTo(-.062,.062);hole.lineTo(.062,.062);hole.lineTo(.062,-.062);hole.closePath();s.holes.push(hole);return s},[])
 return <group position={[0,1.37,.542]}><mesh castShadow><extrudeGeometry args={[shape,{depth:.045,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.009,bevelThickness:.008}]}/><meshStandardMaterial {...gold}/></mesh><mesh position={[0,0,.059]}><torusGeometry args={[.172,.007,8,48]}/><meshStandardMaterial {...gold}/></mesh>{[-1,1].map(v=><group key={v}><mesh position={[v*.116,0,.06]}><boxGeometry args={[.035,.065,.006]}/><meshStandardMaterial color="#6e4a21"/></mesh><mesh position={[0,v*.12,.06]}><boxGeometry args={[.06,.016,.006]}/><meshStandardMaterial color="#6e4a21"/></mesh></group>)}</group>
}
function Tassel(){return <group position={[0,1.07,.56]}><Ellipsoid scale={[.043,.07,.043]} color="#762e27"/>{Array.from({length:15},(_,i)=><mesh key={i} position={[(i-7)*.009,-.15+(Math.sin(i)*.01),0]} rotation={[0,0,(i-7)*.016]}><cylinderGeometry args={[.006,.004,.25,5]}/><meshStandardMaterial color="#8e302a" roughness={1}/></mesh>)}</group>}
function Head(){
 const locks=useMemo(()=>Array.from({length:26},(_,i)=>{const angle=i/26*Math.PI*2;return {position:[Math.cos(angle)*.66,2.63+Math.sin(angle)*.61,0.06] as [number,number,number],rotation:[0,0,angle-.6] as [number,number,number],scale:[.22,.38,.38] as [number,number,number]}}),[])
 return <group>
  <Ellipsoid position={[0,2.51,-.05]} scale={[.85,.81,.65]} plush/>
  <Ellipsoid position={[0,2.34,.26]} scale={[.73,.62,.52]} color="#e3c1a5" plush/>
  {[-1,1].map(s=><group key={s}>
   <Ellipsoid position={[s*.72,2.31,.21]} scale={[.17,.24,.17]} color="#d7b092"/>
   <Ellipsoid position={[s*.3,2.36,.702]} scale={[.211,.265,.07]} color="#f2e4ce"/>
   <Ellipsoid position={[s*.3,2.34,.758]} scale={[.126,.187,.035]} color="#39251e"/>
   <Ellipsoid position={[s*.3,2.29,.785]} scale={[.09,.104,.012]} color="#a17235"/>
   <Ellipsoid position={[s*.28,2.39,.79]} scale={[.071,.117,.015]} color="#171516"/>
   <Ellipsoid position={[s*.263,2.44,.81]} scale={[.036,.044,.01]} color="#fff9e6"/>
   <Ellipsoid position={[s*.34,2.29,.81]} scale={[.018,.02,.008]} color="#e9c579"/>
   <Ellipsoid position={[s*.47,2.13,.673]} scale={[.1,.045,.009]} color="#cd9181"/>
   <Line points={[[s*.49,2.61,.66],[s*.28,2.66,.72],[s*.17,2.62,.71]]} color="#262222" lineWidth={5}/>
  </group>)}
  <Ellipsoid position={[0,2.18,.786]} scale={[.035,.026,.022]} color="#c69580"/>
  <Line points={[[-.045,2.075,.722],[0,2.065,.73],[.045,2.075,.722]]} color="#a16a56" lineWidth={1}/>
  {locks.map((v,i)=><Ellipsoid key={i} {...v} plush/>)}
  {Array.from({length:9},(_,i)=><Ellipsoid key={i} position={[(i-4)*.145,2.79+Math.sin(i*1.7)*.07,.56]} rotation={[.05,0,(i-4)*-.21+.15]} scale={[.16,.36+(i%3)*.025,.18]} plush/>)}
  <Ellipsoid position={[.06,3.27,-.08]} scale={[.3,.26,.3]} plush/>
 </group>
}
export default function ProductModel({material,exploded,showHotspots,onHotspot,selected}:{material:MaterialMode;exploded:boolean;showHotspots:boolean;onHotspot:(id:string)=>void;selected:string|null}){
 const capePoints=useMemo(()=>[new Vector2(.38,1.72),new Vector2(.5,1.6),new Vector2(.68,1.32),new Vector2(.84,.92),new Vector2(.95,.72)],[])
 return <group>
  <Part offset={[0,1.1,0]} exploded={exploded}><Head/>
   <group position={[0,3.17,.64]}><mesh rotation={[0,0,.18]}><torusGeometry args={[.22,.027,12,48,Math.PI]}/><meshStandardMaterial {...gold}/></mesh><mesh position={[0,.06,.03]} rotation={[0,0,-.2]}><boxGeometry args={[.15,.24,.035]}/><meshStandardMaterial {...gold}/></mesh><Ellipsoid position={[0,.08,.056]} scale={[.043,.06,.016]} color="#29211b"/><Line points={[[-.34,0,0],[0,-.055,.055],[.34,0,0]]} color="#bb965b" lineWidth={4}/></group>
  </Part>
  <Part offset={[0,1.9,-.2]} exploded={exploded}>
   <mesh position={[0,3.71,-.05]} rotation={[0,.18,0]} castShadow><torusGeometry args={[.28,.035,16,64]}/><meshStandardMaterial {...gold}/></mesh>
   <mesh position={[0,3.36,-.05]} castShadow><boxGeometry args={[.12,.27,.065]}/><meshStandardMaterial color="#17191a" roughness={.85}/></mesh>
   <mesh position={[.25,3.49,-.03]} rotation={[0,0,.55]}><torusGeometry args={[.1,.022,12,32]}/><meshStandardMaterial {...gold}/></mesh>
  </Part>
  <Part offset={[0,0,-1.2]} exploded={exploded}>
   <mesh castShadow><latheGeometry args={[capePoints,80,.65,Math.PI*2-1.3]}/><meshStandardMaterial {...surface(material)} color={material==='original'?'#ffffff':surface(material).color} map={material==='original'?cloudTexture():undefined} side={2}/></mesh>
   <mesh position={[0,.73,0]} rotation={[Math.PI/2,0,.72]}><torusGeometry args={[.95,.014,8,80,Math.PI*1.75]}/><meshStandardMaterial {...gold}/></mesh>
  </Part>
  <Part offset={[0,-.25,0]} exploded={exploded}>
   <mesh position={[0,1.08,0]} castShadow><cylinderGeometry args={[.38,.55,1.15,48]}/><meshStandardMaterial {...surface(material)}/></mesh>
   <mesh position={[0,.55,0]}><cylinderGeometry args={[.55,.56,.045,48]}/><meshStandardMaterial {...gold}/></mesh>
   <mesh position={[0,1.1,0]}><cylinderGeometry args={[.435,.435,.075,48]}/><meshStandardMaterial color="#907343" roughness={.6}/></mesh>
   {[-1,1].map(s=><group key={s}>
    <group position={[s*.49,1.3,.07]} rotation={[0,0,s*.45]}><mesh castShadow><cylinderGeometry args={[.17,.23,.65,32]}/><meshStandardMaterial {...surface(material)}/></mesh><mesh position={[0,-.32,0]}><cylinderGeometry args={[.232,.233,.025,32]}/><meshStandardMaterial {...gold}/></mesh><Ellipsoid position={[0,-.38,0]} scale={[.145,.18,.14]} color="#dfbaa0" plush/></group>
    <Ellipsoid position={[s*.25,.33,.07]} scale={[.21,.32,.22]} plush/>
    <Ellipsoid position={[s*.25,.15,.19]} scale={[.22,.17,.32]} plush/>
    <Line points={[[s*.25-.15,.16,.39],[s*.25,.21,.47],[s*.25+.15,.16,.39]]} color="#a08451" lineWidth={3}/>
   </group>)}
   <Line points={[[-.28,1.67,.29],[0,1.46,.43],[.28,1.67,.29]]} color="#a58a55" lineWidth={3}/>
  </Part>
  <Part offset={[0,.05,1]} exploded={exploded}><Coin/><Tassel/>
   <group position={[.46,1.12,.44]} rotation={[0,-.2,-.15]}><mesh castShadow><boxGeometry args={[.17,.35,.045]}/><meshStandardMaterial {...gold}/></mesh><Line points={[[-.06,.14,.028],[.06,.14,.028],[.06,-.14,.028],[-.06,-.14,.028],[-.06,.14,.028]]} color="#78582d" lineWidth={1.5}/><mesh position={[0,.22,0]}><torusGeometry args={[.045,.012,8,24]}/><meshStandardMaterial {...gold}/></mesh></group>
  </Part>
  {showHotspots&&!exploded&&hotspots.map((h,i)=><Html key={h.id} position={h.position} center zIndexRange={[20,0]} occlude><button className={`hotspot ${selected===h.id?'selected':''}`} aria-label={h.label} onClick={e=>{e.stopPropagation();onHotspot(h.id)}}><span>{String(i+1).padStart(2,'0')}</span><em>{h.label}</em></button></Html>)}
 </group>
}
