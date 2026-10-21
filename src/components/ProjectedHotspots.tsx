import { useEffect, useRef, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Raycaster, Vector3, type Group } from 'three'
import { hotspots } from '../data/product'
export type HotspotRefs = RefObject<(HTMLButtonElement | null)[]>
export function HotspotOverlay({ buttons, selected, onSelect, visible }: { buttons: HotspotRefs; selected: string | null; onSelect: (id: string) => void; visible: boolean }) {
  return <div className="projected-hotspots" hidden={!visible}>
    {hotspots.map((h, i) => <button key={h.id} ref={el => { buttons.current[i] = el }} className={`hotspot ${selected === h.id ? 'selected' : ''}`} aria-label={h.label} onClick={e => { e.stopPropagation(); onSelect(h.id) }}>
      <span>{String(i + 1).padStart(2, '0')}</span><em>{h.label}</em>
    </button>)}
  </div>
}
// The labels stay in the main React DOM root. Projecting their positions avoids
// independent Drei/React roots and their synchronous teardown during toggles.
export function HotspotProjection({ buttons, model, visible }: { buttons: HotspotRefs; model: RefObject<Group | null>; visible: boolean }) {
  const { camera, size, invalidate } = useThree()
  const data = useRef({ frame: 0, points: hotspots.map(h=>new Vector3(...h.position)), projected: new Vector3(), camera: new Vector3(), direction: new Vector3(), ray: new Raycaster() })
  useEffect(() => { data.current.frame = 0; invalidate() }, [visible, invalidate])
  useFrame(() => {
    const root = model.current
    if (!visible || !root) return
    const d = data.current; d.frame++; camera.getWorldPosition(d.camera)
    if (d.frame % 8 === 1) root.updateWorldMatrix(true, true)
    hotspots.forEach((_, i) => {
      const button = buttons.current[i]; if (!button) return
      const point = d.points[i]; d.projected.copy(point).project(camera)
      button.style.left = `${(d.projected.x * .5 + .5) * size.width}px`
      button.style.top = `${(-d.projected.y * .5 + .5) * size.height}px`
      if (d.frame % 8 !== 1) return
      d.direction.copy(point).sub(d.camera); const distance = d.direction.length()
      d.ray.set(d.camera, d.direction.normalize()); d.ray.far = distance
      const hit = d.ray.intersectObject(root, true)[0]
      const occluded = !!hit && hit.distance < distance - .075
      button.style.visibility = d.projected.z < -1 || d.projected.z > 1 || occluded ? 'hidden' : 'visible'
    })
  })
  return null
}
