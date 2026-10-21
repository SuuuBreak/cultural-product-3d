import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CatmullRomCurve3, DoubleSide, Group, MathUtils, Shape, ShapeGeometry, Vector3, Path, TubeGeometry, Color, Float32BufferAttribute } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { coinEngraving, fabricTexture, surface } from '../../lib/materials'
import type { MaterialMode } from '../../data/product'
import type { Point } from '../../lib/modelGeometry'

export const gold = { color: '#bb9553', metalness: .82, roughness: .34 }
export function Part({ children, offset, exploded }: { children: ReactNode; offset: Point; exploded: boolean }) {
  const ref = useRef<Group>(null), firstFrame = useRef(true), invalidate = useThree(state => state.invalidate)
  useEffect(() => { firstFrame.current = true; invalidate() }, [exploded, invalidate])
  useFrame((_, dt) => {
    const step = firstFrame.current ? 1 / 60 : dt; firstFrame.current = false
    if (ref.current) offset.forEach((value, i) => {
      const axis = (['x', 'y', 'z'] as const)[i]
      const target = exploded ? value : 0
      ref.current!.position[axis] = MathUtils.damp(ref.current!.position[axis], target, 5, step)
      if (Math.abs(ref.current!.position[axis] - target) > .0001) invalidate()
    })
  })
  return <group ref={ref}>{children}</group>
}
export function ClothMaterial({ mode, clouds = false }: { mode: MaterialMode; clouds?: boolean }) {
  // Remount on preset changes: reset map defines, colour, roughness and sheen together.
  return <meshPhysicalMaterial key={`${mode}-${clouds ? 'brocade' : 'plain'}`} {...surface(mode, clouds)} side={DoubleSide} sheen={mode === 'metal' || mode === 'plastic' ? 0 : .22} sheenColor="#777f75" sheenRoughness={.85} />
}
export function SoftShape({ position, scale, rotation = [0, 0, 0], color = '#21211e' }: { position: Point; scale: Point; rotation?: Point; color?: string }) {
  return <mesh position={position} scale={scale} rotation={rotation} castShadow receiveShadow>
    <sphereGeometry args={[1, 32, 24]} /><meshPhysicalMaterial color={color} roughness={.96} metalness={0} bumpMap={fabricTexture()} bumpScale={.008} sheen={.22} sheenColor="#858b7c" sheenRoughness={.9} />
  </mesh>
}
export function Seam({ points, radius = .009, color = '#a78a52', metal = false }: { points: Point[]; radius?: number; color?: string; metal?: boolean }) {
  const signature = JSON.stringify(points)
  const curve = useMemo(() => new CatmullRomCurve3((JSON.parse(signature) as Point[]).map(p => new Vector3(...p))), [signature])
  return <mesh castShadow><tubeGeometry args={[curve, Math.max(12, points.length * 5), radius, 6, false]} /><meshStandardMaterial color={color} roughness={metal ? .35 : .8} metalness={metal ? .8 : .12} /></mesh>
}
export function RoundedPlate({ shape, depth = .025, color = '#b79453' }: { shape: Shape; depth?: number; color?: string }) {
  return <mesh castShadow receiveShadow><extrudeGeometry args={[shape, { depth, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: .009, bevelThickness: .008, curveSegments: 16 }]} /><meshStandardMaterial {...gold} color={color} /></mesh>
}
export function Crown() {
  const plate = useMemo(() => {
    const s = new Shape(); s.moveTo(-.19, -.075); s.lineTo(-.26, .17); s.quadraticCurveTo(0, .31, .26, .17); s.lineTo(.19, -.075); s.closePath()
    const hole = new Path(); hole.moveTo(-.10, -.025); hole.lineTo(.10, -.025); hole.lineTo(.16, .13); hole.quadraticCurveTo(0, .21, -.16, .13); hole.closePath(); s.holes.push(hole)
    return s
  }, [])
  return <group position={[0, 3.30, .36]} rotation={[-.1, 0, -.05]}>
    <RoundedPlate shape={plate} depth={.032} />
    <mesh position={[0, .10, .045]} castShadow><sphereGeometry args={[.049, 20, 16]} /><meshStandardMaterial color="#25241e" metalness={.15} roughness={.6} /></mesh>
    <Seam points={[[-.36, -.04, -.025], [0, -.11, .02], [.36, -.04, -.025]]} radius={.018} metal />
    {[-1, 1].map(side => <group key={side} position={[side * .37, -.04, -.025]}><mesh><sphereGeometry args={[.035, 16, 12]} /><meshStandardMaterial {...gold} /></mesh></group>)}
    <Seam points={[[-.13, -.06, .049], [0, .02, .06], [.13, -.06, .049]]} radius={.008} />
  </group>
}
export function RingAssembly() {
  return <group>
    <mesh position={[0, 3.88, -.1]} rotation={[0, .1, -.12]} castShadow><torusGeometry args={[.255, .025, 14, 64]} /><meshStandardMaterial {...gold} /></mesh>
    <mesh position={[.025, 3.885, -.087]} rotation={[0, .1, -.12]} castShadow><torusGeometry args={[.239, .011, 10, 64]} /><meshStandardMaterial {...gold} roughness={.28} /></mesh>
    <mesh position={[.015, 3.57, -.1]} castShadow><torusGeometry args={[.073, .015, 10, 32]} /><meshStandardMaterial {...gold} /></mesh>
    <mesh position={[.04, 3.48, -.1]} rotation={[0, 0, -.1]}><boxGeometry args={[.11, .24, .045]} /><meshStandardMaterial color="#252521" roughness={.95} bumpMap={fabricTexture()} bumpScale={.01} /></mesh>
    <Seam points={[[.01, 3.38, -.07], [.02, 3.5, -.07], [.03, 3.59, -.07]]} radius={.005} />
    <group position={[.29, 3.72, -.09]} rotation={[0, 0, .5]}>
      <mesh castShadow><torusGeometry args={[.075, .016, 10, 32]} /><meshStandardMaterial {...gold} /></mesh>
      <mesh position={[0, -.13, 0]}><boxGeometry args={[.07, .13, .035]} /><meshStandardMaterial {...gold} /></mesh>
      <Tassel position={[0, -.24, 0]} scale={.68} />
    </group>
  </group>
}
export function Tassel({ position = [0, 0, 0], scale = 1 }: { position?: Point; scale?: number }) {
  const geometry = useMemo(() => {
    const strands = Array.from({ length: 36 }, (_, i) => {
      const a = i / 36 * Math.PI * 2, spread = .025 + (i % 3) * .007
      const points = [[Math.sin(a) * .018, -.06, Math.cos(a) * .018], [Math.sin(a) * spread, -.17, Math.cos(a) * spread], [Math.sin(a) * (spread + .018), -.31 + Math.sin(i * 4) * .016, Math.cos(a) * (spread + .012)]]
      const curve = new CatmullRomCurve3(points.map(p => new Vector3(...p as Point)))
      const g = new TubeGeometry(curve, 6, .003, 4, false), color = new Color(i % 4 ? '#7f2b23' : '#a44532'), colors = []
      for (let v = 0; v < g.attributes.position.count; v++) colors.push(...color.toArray())
      g.setAttribute('color', new Float32BufferAttribute(colors, 3)); return g
    })
    const g = mergeGeometries(strands); strands.forEach(s => s.dispose()); return g
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])
  return <group position={position} scale={scale}>
    <SoftShape position={[0, -.02, 0]} scale={[.038, .052, .035]} color="#6e231f" />
    <Seam points={[[-.028, -.028, .025], [0, -.045, .038], [.027, -.02, .025]]} radius={.005} color="#b44a35" />
    <mesh geometry={geometry}><meshStandardMaterial color="#ffffff" vertexColors roughness={1} /></mesh>
  </group>
}
export function CoinPendant() {
  const shape = useMemo(() => {
    const s = new Shape(); s.absarc(0, 0, .176, 0, Math.PI * 2, false)
    const h = new Path(); h.moveTo(-.052, -.052); h.lineTo(-.052, .052); h.lineTo(.052, .052); h.lineTo(.052, -.052); h.closePath(); s.holes.push(h); return s
  }, [])
  const faceShape = useMemo(() => {
    const g = new ShapeGeometry(shape, 48)
    const uv = g.getAttribute('uv')
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / .352 + .5, uv.getY(i) / .352 + .5)
    return g
  }, [shape])
  useEffect(() => () => faceShape.dispose(), [faceShape])
  return <group position={[-.025, 1.40, .50]} rotation={[.02, -.06, -.1]}>
    <Seam points={[[-.08, .30, -.02], [-.035, .19, .015], [0, .15, .015], [.035, .21, .015], [.12, .31, -.01]]} radius={.01} color="#743528" />
    <mesh castShadow><extrudeGeometry args={[shape, { depth: .038, bevelEnabled: true, bevelSegments: 3, bevelSize: .007, bevelThickness: .006, curveSegments: 48 }]} /><meshStandardMaterial {...gold} /></mesh>
    <mesh position={[0, 0, .046]} geometry={faceShape}><meshStandardMaterial {...gold} bumpMap={coinEngraving()} bumpScale={.014} /></mesh>
    <mesh position={[0, 0, .048]}><torusGeometry args={[.16, .006, 8, 48]} /><meshStandardMaterial {...gold} /></mesh>
    <Seam points={[[-.057, -.057, .05], [-.057, .057, .05], [.057, .057, .05], [.057, -.057, .05], [-.057, -.057, .05]]} radius={.004} color="#795d32" metal />
    <Tassel position={[0, -.185, .025]} scale={.9} />
  </group>
}
export function TallyCharm() {
  const plate = useMemo(() => {
    const s = new Shape(); s.moveTo(-.067, -.18); s.quadraticCurveTo(-.088, -.18, -.088, -.155); s.lineTo(-.088, .145); s.quadraticCurveTo(-.088, .18, -.05, .18); s.lineTo(.05, .18); s.quadraticCurveTo(.088, .18, .088, .145); s.lineTo(.088, -.155); s.quadraticCurveTo(.088, -.18, .067, -.18); s.closePath(); return s
  }, [])
  return <group position={[.43, 1.14, .40]} rotation={[0, -.12, -.18]}>
    <RoundedPlate shape={plate} depth={.025} />
    <Seam points={[[-.056, -.15, .035], [-.056, .145, .035], [.056, .145, .035], [.056, -.15, .035], [-.056, -.15, .035]]} radius={.004} color="#77572d" metal />
    {[-1, 0, 1].map(i => <group key={i} position={[0, i * .087, .039]}><Seam points={[[-.032, .025, 0], [.031, .025, 0], [-.026, -.026, 0], [.028, -.026, 0]]} radius={.003} color="#7e5e32" metal /></group>)}
    <mesh position={[0, .215, 0]}><torusGeometry args={[.035, .009, 8, 24]} /><meshStandardMaterial {...gold} /></mesh>
    <Seam points={[[0, .25, 0], [-.025, .36, -.035], [-.13, .40, -.05]]} radius={.009} color="#762b23" />
  </group>
}
