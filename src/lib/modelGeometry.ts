import { BufferGeometry, CatmullRomCurve3, Color, Float32BufferAttribute, Vector3 } from 'three'
import { seededRandom } from './materials'
export type Point = [number, number, number]
export type HairLock = { points: Point[]; width: number; depth?: number }
export const hairLocks: HairLock[] = [
  { points: [[-.61, 3.12, .27], [-.72, 2.94, .58], [-.70, 2.53, .59]], width: .17 },
  { points: [[-.39, 3.29, .28], [-.58, 3.05, .63], [-.53, 2.73, .72]], width: .19 },
  { points: [[-.13, 3.34, .30], [-.36, 3.12, .66], [-.28, 2.70, .77]], width: .20 },
  { points: [[.14, 3.33, .28], [.08, 3.07, .74], [-.04, 2.65, .78]], width: .18 },
  { points: [[.37, 3.25, .28], [.38, 3.04, .68], [.26, 2.77, .77]], width: .20 },
  { points: [[.58, 3.12, .20], [.71, 2.94, .55], [.62, 2.56, .65]], width: .18 },
  { points: [[-.75, 2.99, -.02], [-.91, 2.73, .22], [-.78, 2.28, .32]], width: .17 },
  { points: [[.74, 2.94, -.06], [.91, 2.70, .22], [.79, 2.26, .30]], width: .17 },
  { points: [[-.26, 3.24, -.26], [-.60, 3.31, -.08], [-.93, 3.12, .14]], width: .22 },
  { points: [[.06, 3.26, -.30], [.52, 3.32, -.17], [.88, 3.04, .05]], width: .22 },
  { points: [[-.07, 3.22, -.31], [-.37, 3.55, -.22], [-.19, 3.61, -.13]], width: .14 },
  { points: [[.05, 3.28, -.26], [.21, 3.52, -.25], [.46, 3.49, -.18]], width: .15 },
  { points: [[-.42, 2.98, -.48], [-.76, 2.91, -.52], [-.89, 2.61, -.35]], width: .24 },
  { points: [[.44, 3.00, -.46], [.76, 2.87, -.49], [.88, 2.60, -.31]], width: .23 },
  { points: [[-.16, 3.13, -.53], [-.30, 2.85, -.71], [-.48, 2.39, -.55]], width: .25 },
  { points: [[.23, 3.11, -.50], [.39, 2.82, -.71], [.39, 2.30, -.54]], width: .25 },
  { points: [[-.61, 2.69, -.42], [-.62, 2.42, -.56], [-.49, 2.10, -.35]], width: .20 },
  { points: [[.61, 2.67, -.43], [.65, 2.40, -.54], [.48, 2.11, -.34]], width: .20 },
]
for (const [x, y, z, endX, endY] of [
  [-.50, 3.16, .49, -.60, 2.62], [-.23, 3.26, .48, -.36, 2.65],
  [.04, 3.27, .51, -.04, 2.56], [.31, 3.20, .47, .32, 2.67],
  [.60, 3.06, .31, .78, 2.45], [-.71, 2.91, .15, -.86, 2.38],
  [-.39, 3.31, -.12, -.64, 3.42], [.21, 3.33, -.15, .53, 3.42],
]) hairLocks.push({ points: [[x, y, z], [(x + endX) / 2, (y + endY) / 2 + .06, z + .13], [endX, endY, z + .20]], width: .075 })
function build(positions: number[], indices: number[], uv?: number[], colors?: number[]) {
  const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(positions, 3)); g.setIndex(indices)
  if (uv) g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  if (colors) g.setAttribute('color', new Float32BufferAttribute(colors, 3))
  g.computeVertexNormals(); g.computeBoundingSphere(); return g
}
export function scalpPoint(phi: number, t: number) {
  const maxTheta = 2.68 - 1.35 * Math.pow(Math.max(0, Math.cos(phi)), .55), theta = .025 + t * maxTheta
  const normal = new Vector3(Math.sin(phi) * Math.sin(theta), Math.cos(theta), Math.cos(phi) * Math.sin(theta))
  const variation = 1 + .025 * Math.sin(phi * 9 + theta * 7)
  const position = new Vector3(normal.x * .86 * variation, 2.59 + normal.y * .75, -.055 + normal.z * .66)
  return { position, normal: new Vector3(normal.x / .86, normal.y / .75, normal.z / .66).normalize() }
}
export function scalpGeometry() {
  const p: number[] = [], uv: number[] = [], indices: number[] = [], rows = 30, cols = 64
  for (let row = 0; row <= rows; row++) for (let col = 0; col <= cols; col++) {
    p.push(...scalpPoint(col / cols * Math.PI * 2, row / rows).position.toArray()); uv.push(col / cols, row / rows)
  }
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    const a = row * (cols + 1) + col, b = a + cols + 1; indices.push(a, b, a + 1, b, b + 1, a + 1)
  }
  return build(p, indices, uv)
}
const lockCurves = new WeakMap<HairLock, CatmullRomCurve3>()
function lockFrame(lock: HairLock, t: number) {
  let curve = lockCurves.get(lock)
  if (!curve) { curve = new CatmullRomCurve3(lock.points.map(p => new Vector3(...p))); lockCurves.set(lock, curve) }
  const center = curve.getPoint(t), tangent = curve.getTangent(t).normalize()
  const side = new Vector3().crossVectors(tangent, new Vector3(0, 0, 1)).normalize()
  const forward = new Vector3().crossVectors(side, tangent).normalize()
  const radius = lock.width * Math.pow(Math.max(.005, Math.sin(Math.PI * t)), .72) * (1 - t * .40)
  return { center, tangent, side, forward, radius }
}
export function locksGeometry() {
  const p: number[] = [], uv: number[] = [], indices: number[] = [], rows = 16, cols = 10
  for (const lock of hairLocks) {
    const base = p.length / 3
    for (let row = 0; row <= rows; row++) {
      const { center, side, forward, radius } = lockFrame(lock, row / rows)
      for (let col = 0; col <= cols; col++) {
        const a = col / cols * Math.PI * 2
        const v = center.clone().addScaledVector(side, Math.cos(a) * radius).addScaledVector(forward, Math.sin(a) * radius * (lock.depth ?? .7))
        p.push(...v.toArray()); uv.push(col / cols, row / rows)
      }
    }
    for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
      const a = base + row * (cols + 1) + col, b = a + cols + 1; indices.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }
  return build(p, indices, uv)
}
// Actual tapered fibres, batched into one mesh; no thousands of React objects.
export function hairFibres(count = 12000) {
  const p: number[] = [], indices: number[] = [], colors: number[] = [], random = seededRandom(1729)
  const dark = new Color('#20231f'), light = new Color('#454b40')
  function strand(root: Vector3, normal: Vector3, flow: Vector3, length: number) {
    const q = (root.x / .79) ** 2 + ((root.y - 2.49) / .66) ** 2
    // Suppress fibres rooted inside the face: otherwise their tips pepper the skin.
    if (q < 1 && root.z > 0 && root.z < .12 + .58 * Math.sqrt(1 - q) + .009) return
    const angle = random() * Math.PI * 2
    let widthAxis = new Vector3(Math.sin(angle), .2, Math.cos(angle)).cross(normal).normalize()
    if (widthAxis.lengthSq() < .01) widthAxis = new Vector3(1, 0, 0)
    const width = .0012 + random() * .0015
    const direction = normal.clone().multiplyScalar(.7).addScaledVector(flow, .6).normalize()
    const middle = root.clone().addScaledVector(direction, length * .58)
    const tip = root.clone().addScaledVector(direction, length).addScaledVector(flow, length * .25)
    const base = p.length / 3
    p.push(...root.clone().addScaledVector(widthAxis, width).toArray(), ...root.clone().addScaledVector(widthAxis, -width).toArray(), ...middle.clone().addScaledVector(widthAxis, width * .55).toArray(), ...middle.clone().addScaledVector(widthAxis, -width * .55).toArray(), ...tip.toArray())
    indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2, base + 2, base + 3, base + 4)
    const color = dark.clone().lerp(light, random() * .55)
    for (let i = 0; i < 5; i++) colors.push(...color.toArray())
  }
  for (let i = 0; i < count; i++) {
    if (i < count * .48) {
      const phi = random() * Math.PI * 2, t = Math.sqrt(random()), { position, normal } = scalpPoint(phi, t)
      const flow = new Vector3(Math.sin(phi) * .4, -.8, Math.cos(phi) * .3).normalize()
      strand(position.addScaledVector(normal, .003), normal, flow, .025 + random() * .055)
    } else {
      const lock = hairLocks[Math.floor(random() * hairLocks.length)], t = .05 + random() * .91, a = random() * Math.PI * 2
      const { center, tangent, side, forward, radius } = lockFrame(lock, t)
      const normal = side.clone().multiplyScalar(Math.cos(a)).addScaledVector(forward, Math.sin(a)).normalize()
      const root = center.addScaledVector(side, Math.cos(a) * radius).addScaledVector(forward, Math.sin(a) * radius * .7)
      strand(root, normal, tangent, .025 + random() * .045)
    }
  }
  return build(p, indices, undefined, colors)
}
export function garmentPoint(t: number, theta: number, cape: boolean): Point {
  const radius = cape ? .31 + .65 * Math.pow(t, .62) : .35 + .19 * t + .035 * Math.sin(Math.PI * t)
  const fold = (cape ? .043 : .018) * Math.sin(theta * (cape ? 9 : 12) + t * .65) * Math.pow(Math.sin(t * Math.PI / 2), .7)
  const r = radius + fold
  return [Math.sin(theta) * r, (cape ? 1.82 : 1.72) - t * (cape ? 1.13 : 1.17) + Math.sin(theta * 5) * .018 * t, Math.cos(theta) * r * (cape ? .71 : .77) - (cape ? .06 : 0)]
}
export function garmentGeometry(cape: boolean) {
  const p: number[] = [], uv: number[] = [], indices: number[] = [], rows = 22, cols = 80, start = cape ? .66 : 0, arc = cape ? Math.PI * 2 - 1.32 : Math.PI * 2
  for (let row = 0; row <= rows; row++) for (let col = 0; col <= cols; col++) {
    p.push(...garmentPoint(row / rows, start + col / cols * arc, cape)); uv.push(col / cols, 1 - row / rows)
  }
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    const a = row * (cols + 1) + col, b = a + cols + 1; indices.push(a, b, a + 1, b, b + 1, a + 1)
  }
  return build(p, indices, uv)
}
export function panelGeometry(left: Point[], right: Point[]) {
  const a = new CatmullRomCurve3(left.map(p => new Vector3(...p))), b = new CatmullRomCurve3(right.map(p => new Vector3(...p)))
  const p: number[] = [], uv: number[] = [], indices: number[] = []
  for (let i = 0; i <= 20; i++) { p.push(...a.getPoint(i / 20).toArray(), ...b.getPoint(i / 20).toArray()); uv.push(0, 1 - i / 20, 1, 1 - i / 20) }
  for (let i = 0; i < 20; i++) { const n = i * 2; indices.push(n, n + 2, n + 1, n + 1, n + 2, n + 3) }
  return build(p, indices, uv)
}

export function collarFibres() {
  const p: number[] = [], indices: number[] = [], colors: number[] = [], random = seededRandom(91)
  const dark = new Color('#1e211b'), light = new Color('#55594b')
  for (let i = 0; i < 5000; i++) {
    const phi = random() * Math.PI * 2, alpha = random() * Math.PI * 2, radial = .40 + Math.cos(alpha) * .075
    const root = new Vector3(Math.sin(phi) * radial, 1.84 + Math.sin(alpha) * .075, Math.cos(phi) * radial * .72)
    const normal = new Vector3(Math.sin(phi) * Math.cos(alpha), Math.sin(alpha), Math.cos(phi) * Math.cos(alpha)).normalize()
    const flow = new Vector3(Math.sin(phi) * .6, -.25, Math.cos(phi) * .6).normalize()
    const tip = root.clone().addScaledVector(normal, .02 + random() * .025).addScaledVector(flow, .02 + random() * .02)
    const across = new Vector3().crossVectors(normal, flow).normalize().multiplyScalar(.0012 + random() * .001)
    const n = p.length / 3
    p.push(...root.clone().add(across).toArray(), ...root.clone().sub(across).toArray(), ...tip.toArray())
    indices.push(n, n + 1, n + 2)
    const color = dark.clone().lerp(light, random() * .4)
    for (let j = 0; j < 3; j++) colors.push(...color.toArray())
  }
  return build(p, indices, undefined, colors)
}
