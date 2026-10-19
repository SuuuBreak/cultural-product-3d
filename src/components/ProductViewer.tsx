import { Component, Suspense, useEffect, useState, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import { ACESFilmicToneMapping, Group } from 'three'
import ProductModel from './ProductModel'
import InteractionController, { type CameraCommand } from './InteractionController'
import type { LightMode, MaterialMode } from '../data/product'
class Boundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return {failed:true}}
 render(){return this.state.failed?<div className="viewer-error" role="alert"><b>三维视窗暂不可用</b><p>请启用浏览器硬件加速，或使用支持 WebGL 2 的浏览器。</p><button onClick={()=>location.reload()}>重新加载</button></div>:this.props.children}
}
export default function ProductViewer({model,material,light,exploded,hotspots,selected,onHotspot,command,auto,onInteract,onFocus}:{model:Group|null;material:MaterialMode;light:LightMode;exploded:boolean;hotspots:boolean;selected:string|null;onHotspot:(id:string)=>void;command:CameraCommand;auto:boolean;onInteract:()=>void;onFocus:(p:[number,number,number])=>void}){
 const [ready,setReady]=useState(false),[lost,setLost]=useState(false)
 useEffect(()=>{if(ready)document.querySelector('canvas')?.setAttribute('aria-label','墨墨产品三维交互视窗')},[ready])
 const warm=light==='warm',dark=light==='dark'
 return <Boundary>{(!ready||lost)&&<div role="status" className="canvas-loading">{lost?'图形上下文已中断，请刷新页面重新加载。':'正在准备实时三维展厅…'}</div>}<Canvas shadows dpr={[1,1.6]} camera={{position:[4.3,3.2,7.3],fov:35}} gl={{antialias:true,toneMapping:ACESFilmicToneMapping}} onCreated={({gl})=>{setReady(true);gl.domElement.addEventListener('webglcontextlost',()=>setLost(true))}} fallback={<div className="viewer-error">当前设备不支持 WebGL 2，请更换浏览器体验。</div>}>
  <ambientLight intensity={dark?.32:.8}/><directionalLight position={[3,6,5]} intensity={dark?2.5:3.8} color={warm?'#ffd5a1':'#fff2e2'} castShadow shadow-mapSize={[1024,1024]} shadow-bias={-.0001}/><directionalLight position={[-4,3,-3]} color={dark?'#809bb7':'#cbd8ef'} intensity={dark?4:2.5}/><directionalLight position={[-2,1,5]} intensity={.8}/>
  <Suspense fallback={null}><Environment resolution={128}><Lightformer position={[0,5,2]} rotation={[Math.PI/2,0,0]} scale={[6,6,1]} intensity={warm?2:3} color={warm?'#ffe1af':'white'}/><Lightformer position={[-4,2,0]} rotation={[0,Math.PI/2,0]} scale={[3,5,1]} intensity={2}/></Environment>
   <group onDoubleClick={e=>{e.stopPropagation();onFocus(e.point.toArray())}}>{model?<primitive object={model}/>:<ProductModel material={material} exploded={exploded} showHotspots={hotspots} selected={selected} onHotspot={onHotspot}/>}</group>
   <ContactShadows position={[0,-.025,0]} opacity={.6} scale={10} blur={2.7} far={6} resolution={256}/>
   <mesh position={[0,-.09,0]} receiveShadow><cylinderGeometry args={[1.55,1.58,.12,96]}/><meshStandardMaterial color="#222322" roughness={.66} metalness={.25}/></mesh>
   <mesh position={[0,-.048,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[1.48,1.488,96]}/><meshStandardMaterial color="#836b46" roughness={.5} metalness={.5}/></mesh>
  </Suspense>
  <InteractionController command={command} auto={auto} onInteract={onInteract}/>
 </Canvas></Boundary>
}
