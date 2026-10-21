import { useEffect, useMemo } from 'react'
import { BackSide, DoubleSide, TorusGeometry } from 'three'
import { type MaterialMode } from '../data/product'
import { garmentGeometry, garmentPoint, panelGeometry, collarFibres } from '../lib/modelGeometry'
import { fabricTexture } from '../lib/materials'
import RefinedHead from './model/RefinedHead'
import { ClothMaterial, CoinPendant, Crown, Part, RingAssembly, Seam, SoftShape, TallyCharm, gold } from './model/ModelParts'

function FurCollar() {
  const geometry = useMemo(() => collarFibres(), [])
  useEffect(() => () => geometry.dispose(), [geometry])
  return <group>
    <mesh position={[0, 1.84, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, .72, 1]}><torusGeometry args={[.40, .075, 10, 48]} /><meshPhysicalMaterial color="#181c16" roughness={1} sheen={.2} sheenColor="#6c7763" bumpMap={fabricTexture()} bumpScale={.01} /></mesh>
    <mesh geometry={geometry} receiveShadow raycast={() => {}}><meshStandardMaterial color="#ffffff" vertexColors roughness={1} side={DoubleSide} /></mesh>
  </group>
}
function Cape({ material }: { material: MaterialMode }) {
  const geometry = useMemo(() => garmentGeometry(true), [])
  useEffect(() => () => geometry.dispose(), [geometry])
  const arc = Math.PI * 2 - 1.32
  const hem = Array.from({ length: 55 }, (_, i) => garmentPoint(.99, .66 + i / 54 * arc, true))
  const upperHem = Array.from({ length: 55 }, (_, i) => garmentPoint(.93, .66 + i / 54 * arc, true))
  return <group>
    <mesh geometry={geometry} castShadow receiveShadow><ClothMaterial mode={material} clouds /></mesh>
    <mesh geometry={geometry} scale={[.989, 1, .989]}><meshStandardMaterial color="#35251e" roughness={1} side={BackSide} /></mesh>
    <Seam points={hem} radius={.013} color="#a48a54" />
    <Seam points={upperHem} radius={.005} color="#b59b66" />
    {[.66, .66 + arc].map(theta => <Seam key={theta} points={Array.from({ length: 15 }, (_, i) => garmentPoint(i / 14, theta, true))} radius={.012} color="#b69b61" />)}
    <FurCollar />
  </group>
}
function Robe({ material }: { material: MaterialMode }) {
  const geometry = useMemo(() => garmentGeometry(false), [])
  const lapel = useMemo(() => panelGeometry(
    [[-.27, 1.77, .245], [-.05, 1.53, .355], [.20, 1.32, .39]],
    [[-.18, 1.78, .27], [.035, 1.54, .38], [.27, 1.35, .38]],
  ), [])
  const apron = useMemo(() => panelGeometry(
    [[-.17, 1.08, .365], [-.26, .81, .423], [-.34, .57, .41]],
    [[.13, 1.08, .37], [.19, .81, .441], [.22, .57, .456]],
  ), [])
  const apronUv = apron.getAttribute('uv')
  if (apronUv.getX(0) === 0) for (let i = 0; i < apronUv.count; i++) apronUv.setX(i, .33 + apronUv.getX(i) * .33)
  useEffect(() => () => { geometry.dispose(); lapel.dispose(); apron.dispose() }, [geometry, lapel, apron])
  const beltGeometry = useMemo(() => {
    const g = new TorusGeometry(.445, .052, 4, 64); return g
  }, [])
  useEffect(() => () => beltGeometry.dispose(), [beltGeometry])
  return <group>
    <mesh geometry={geometry} castShadow receiveShadow><ClothMaterial mode={material} /></mesh>
    <mesh geometry={lapel} castShadow><meshPhysicalMaterial color="#3e3629" side={DoubleSide} roughness={.89} bumpMap={fabricTexture()} bumpScale={.01} sheen={.4} /></mesh>
    <mesh geometry={apron} castShadow><ClothMaterial mode={material} clouds /></mesh>
    <Seam points={[[-.28, 1.77, .25], [-.05, 1.53, .366], [.21, 1.32, .40]]} radius={.008} />
    <Seam points={[[.27, 1.77, .25], [.14, 1.60, .33], [-.13, 1.38, .40]]} radius={.007} color="#8e7545" />
    <Seam points={[[-.17, 1.08, .382], [-.26, .81, .436], [-.34, .57, .422], [.22, .57, .468], [.19, .81, .454]]} radius={.008} />
    <Seam points={Array.from({ length: 65 }, (_, i) => garmentPoint(.99, i / 64 * Math.PI * 2, false))} radius={.012} />
    <mesh geometry={beltGeometry} position={[0, 1.095, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, .78, 1]} castShadow><meshStandardMaterial color="#443426" roughness={.78} bumpMap={fabricTexture()} bumpScale={.014} /></mesh>
    <Seam points={[[-.39, 1.10, .18], [-.22, 1.12, .335], [0, 1.12, .367], [.26, 1.12, .31], [.4, 1.1, .13]]} radius={.009} color="#a0854c" />
    <group position={[-.02, 1.095, .398]}><mesh><boxGeometry args={[.14, .095, .027]} /><meshStandardMaterial {...gold} /></mesh><mesh position={[0, 0, .018]}><boxGeometry args={[.09, .049, .01]} /><meshStandardMaterial color="#32291f" roughness={.7} /></mesh></group>
    {[-1, 1].map(side => <group key={side}>
      <group position={[side * .48, 1.37, .015]} rotation={[0, 0, side * .36]}>
        <mesh castShadow receiveShadow><cylinderGeometry args={[.14, .20, .56, 32, 4]} /><ClothMaterial mode={material} clouds /></mesh>
        <mesh position={[0, -.275, 0]}><cylinderGeometry args={[.202, .205, .052, 32]} /><meshStandardMaterial color="#9a804d" roughness={.7} /></mesh>
        <SoftShape position={[0, -.36, .035]} scale={[.128, .15, .135]} color="#dfbaa0" />
        <Seam points={[[.04 * side, -.32, .16], [.045 * side, -.36, .166], [.03 * side, -.4, .15]]} radius={.0028} color="#b28a6a" />
      </group>
      <SoftShape position={[side * .24, .33, .015]} scale={[.20, .28, .20]} />
      <SoftShape position={[side * .24, .14, .13]} scale={[.21, .16, .29]} color="#23231e" />
      <mesh position={[side * .24, .005, .10]} scale={[1, 1, 1.45]}><cylinderGeometry args={[.205, .20, .055, 32]} /><meshStandardMaterial color="#252720" roughness={.95} /></mesh>
      <Seam points={[[side * .24 - .16, .17, .30], [side * .24, .215, .40], [side * .24 + .16, .17, .30]]} radius={.009} />
      <Seam points={[[side * .24 - .10, .29, .20], [side * .24, .32, .237], [side * .24 + .10, .29, .20]]} radius={.006} color="#9c834e" />
    </group>)}
  </group>
}
export default function ProductModel({ material, exploded }: { material: MaterialMode; exploded: boolean }) {
  return <group name="momo-refined-concept">
    <Part offset={[0, 1.06, 0]} exploded={exploded}><RefinedHead /><Crown /></Part>
    <Part offset={[0, 1.9, -.2]} exploded={exploded}><RingAssembly /></Part>
    <Part offset={[0, 0, -1.2]} exploded={exploded}><Cape material={material} /></Part>
    <Part offset={[0, -.25, 0]} exploded={exploded}><Robe material={material} /></Part>
    <Part offset={[0, .05, 1]} exploded={exploded}><CoinPendant /><TallyCharm /></Part>
  </group>
}
