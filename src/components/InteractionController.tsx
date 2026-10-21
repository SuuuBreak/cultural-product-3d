import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Vector3 } from 'three'
import type { OrbitControls as Controls } from 'three-stdlib'
import type { View } from '../data/product'
export type CameraCommand={view:View;tick:number;point?:[number,number,number]}
const positions:Record<View,[number,number,number]>={front:[0,2.1,8],side:[8,2.1,0],back:[0,2.1,-8],top:[0,9,0.001],iso:[4.3,3.2,7.3]}
export default function InteractionController({command,auto,onInteract}:{command:CameraCommand;auto:boolean;onInteract:()=>void}){
 const ref=useRef<Controls>(null);const {camera,invalidate}=useThree();const transition=useRef(false),firstFrame=useRef(true)
 const destination=useRef(new Vector3(...positions.iso));const target=useRef(new Vector3(0,1.85,0))
 useEffect(()=>{
   target.current.set(...(command.point??[0,1.85,0]))
   if(command.point){const dir=camera.position.clone().sub(ref.current?.target??new Vector3(0,1.85,0)).normalize();destination.current.copy(target.current).addScaledVector(dir,3.5)}
   else destination.current.set(...positions[command.view])
   transition.current=true;firstFrame.current=true;invalidate()
 },[command,camera,invalidate])
 useEffect(()=>{if(auto)invalidate()},[auto,invalidate])
 useFrame((_,delta)=>{if(auto)invalidate();if(!transition.current||!ref.current)return;const step=firstFrame.current?1/60:delta;firstFrame.current=false;const t=1-Math.exp(-step*6);camera.position.lerp(destination.current,t);ref.current.target.lerp(target.current,t);ref.current.update();if(camera.position.distanceTo(destination.current)<0.008)transition.current=false;else invalidate()})
 return <OrbitControls ref={ref} makeDefault enableDamping dampingFactor={0.075} autoRotate={auto} autoRotateSpeed={0.65} enablePan={false} minDistance={2.7} maxDistance={13} minPolarAngle={0.01} maxPolarAngle={Math.PI*.88} target={[0,1.85,0]} onStart={()=>{transition.current=false;onInteract()}} />
}
