import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { DoubleSide } from 'three'
import { faceTextures, hairTexture } from '../../lib/materials'
import { hairFibres, locksGeometry, scalpGeometry } from '../../lib/modelGeometry'
import { SoftShape } from './ModelParts'

export default function RefinedHead() {
  const width = useThree(state => state.size.width)
  const count = width < 560 ? 8000 : 18000
  const geometry = useMemo(() => ({ scalp: scalpGeometry(), locks: locksGeometry(), fibres: hairFibres(count) }), [count])
  useEffect(() => () => Object.values(geometry).forEach(g => g.dispose()), [geometry])
  const face = faceTextures()
  return <group>
    {[-1, 1].map(side => <group key={side}>
      <SoftShape position={[side * .738, 2.39, .14]} scale={[.16, .205, .15]} color="#d9ad8c" />
      <SoftShape position={[side * .80, 2.39, .23]} scale={[.07, .12, .035]} color="#c39475" />
    </group>)}
    <mesh position={[0, 2.49, .12]} scale={[.79, .66, .58]} castShadow receiveShadow>
      <sphereGeometry args={[1, 80, 64]} />
      <meshPhysicalMaterial map={face.color} bumpMap={face.relief} bumpScale={.004} color="#ffffff" roughness={.98} metalness={0} sheen={.12} sheenColor="#baad95" sheenRoughness={1} />
    </mesh>
    <mesh geometry={geometry.scalp} castShadow receiveShadow><meshPhysicalMaterial color="#111310" roughness={.97} metalness={0} side={DoubleSide} bumpMap={hairTexture()} bumpScale={.015} sheen={.22} sheenColor="#656e63" sheenRoughness={.88} /></mesh>
    <mesh geometry={geometry.locks} castShadow receiveShadow><meshPhysicalMaterial color="#131512" roughness={.96} metalness={0} side={DoubleSide} bumpMap={hairTexture()} bumpScale={.015} sheen={.22} sheenColor="#656e63" sheenRoughness={.88} /></mesh>
    <mesh geometry={geometry.fibres} receiveShadow raycast={() => {}}><meshStandardMaterial color="#ffffff" vertexColors roughness={1} metalness={0} side={DoubleSide} /></mesh>
  </group>
}
