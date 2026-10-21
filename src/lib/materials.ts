import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import { materials, type MaterialMode } from '../data/product'

// Textures are deterministic and generated locally. No remote asset request is needed.
export function seededRandom(seed: number) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 }
}
function canvas(width: number, height: number) {
  const element = document.createElement('canvas'); element.width = width; element.height = height
  return { element, ctx: element.getContext('2d')! }
}
function texture(element: HTMLCanvasElement, color = false, repeat = false) {
  const map = new CanvasTexture(element)
  if (color) map.colorSpace = SRGBColorSpace
  if (repeat) { map.wrapS = map.wrapT = RepeatWrapping; map.repeat.set(5, 5) }
  map.anisotropy = 4
  return map
}
let cloth: CanvasTexture | undefined
export function fabricTexture() {
  if (cloth) return cloth
  const { element, ctx: c } = canvas(256, 256), random = seededRandom(41)
  c.fillStyle = '#808080'; c.fillRect(0, 0, 256, 256)
  for (let y = 0; y < 256; y += 4) for (let x = 0; x < 256; x += 4) {
    const v = Math.round(105 + random() * 65); c.fillStyle = `rgb(${v},${v},${v})`
    c.fillRect(x, y, 3, 1); c.fillRect(x + ((y / 4) % 2 ? 1 : 0), y + 1, 1, 3)
  }
  cloth = texture(element, false, true); return cloth
}
type TextileMaps = { color: CanvasTexture; relief: CanvasTexture; roughness: CanvasTexture }
let patterned: TextileMaps | undefined, plain: TextileMaps | undefined
function cloudPath(c: CanvasRenderingContext2D) {
  c.beginPath(); c.moveTo(-98, 30)
  c.bezierCurveTo(-137, 17, -116, -23, -78, -12)
  c.bezierCurveTo(-85, -58, -29, -75, -13, -37)
  c.bezierCurveTo(7, -78, 64, -52, 52, -19)
  c.bezierCurveTo(96, -36, 122, 18, 77, 35)
  c.bezierCurveTo(49, 43, 35, 13, 13, 17)
  c.bezierCurveTo(-13, 24, -18, 7, -3, -3)
  c.bezierCurveTo(12, -11, 31, 6, 15, 13)
  c.moveTo(-113, 43); c.bezierCurveTo(-64, 25, -45, 66, 10, 45)
  c.bezierCurveTo(36, 35, 55, 69, 103, 46)
  c.moveTo(-70, 13); c.bezierCurveTo(-85, -12, -42, -25, -30, -8)
  c.bezierCurveTo(-16, 9, -40, 26, -48, 10)
  c.bezierCurveTo(-54, -2, -37, -7, -34, 3)
  c.moveTo(40, 26); c.bezierCurveTo(77, 19, 63, -13, 37, -8)
  c.bezierCurveTo(12, -4, 30, 23, 42, 8)
  c.moveTo(-106, 53); c.bezierCurveTo(-52, 42, -40, 75, 21, 55)
}
function textileMaps(withClouds: boolean): TextileMaps {
  if (withClouds && patterned) return patterned
  if (!withClouds && plain) return plain
  const { element, ctx: c } = canvas(2048, 1024)
  const { element: height, ctx: h } = canvas(2048, 1024)
  const { element: rough, ctx: r } = canvas(2048, 1024)
  c.fillStyle = '#171a17'; c.fillRect(0, 0, 2048, 1024)
  h.fillStyle = '#555555'; h.fillRect(0, 0, 2048, 1024)
  r.fillStyle = '#eeeeee'; r.fillRect(0, 0, 2048, 1024)
  const random = seededRandom(79)
  for (let y = 0; y < 1024; y += 3) {
    c.strokeStyle = y % 6 ? '#20241f' : '#121612'; c.lineWidth = .8
    c.beginPath(); c.moveTo(0, y); c.lineTo(2048, y); c.stroke()
  }
  for (let x = 0; x < 2048; x += 3) {
    c.strokeStyle = x % 6 ? '#2b302866' : '#10130f66'; c.lineWidth = .7
    c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 1024); c.stroke()
  }
  if (withClouds) {
    const motifs = [
      [110, 720, 1.1, -.1], [510, 770, 1.3, .08], [920, 685, 1.18, -.08],
      [1330, 770, 1.4, .1], [1770, 705, 1.2, -.1], [330, 395, .65, .18],
      [1650, 340, .75, -.2], [1015, 320, 1.25, 0],
    ]
    motifs.forEach(([x, y, scale, rotation]) => {
      for (const context of [c, h, r]) {
        context.save(); context.translate(x, y); context.rotate(rotation); context.scale(scale, scale)
        for (let layer = 0; layer < 3; layer++) {
          context.save(); context.translate(0, layer * 5)
          cloudPath(context); context.lineWidth = context === c ? 2.6 : 3.2
          context.strokeStyle = context === c ? ['#b69a5b', '#d0b476', '#8b713e'][layer] : context === h ? '#cccccc' : '#999999'
          context.stroke(); context.restore()
        }
        context.restore()
      }
    })
    for (const context of [c, h, r]) {
      context.lineWidth = 5; context.strokeStyle = context === c ? '#b99d64' : context === h ? '#c8c8c8' : '#aaaaaa'
      for (const y of [31, 44, 949, 969, 991]) { context.beginPath(); context.moveTo(0, y); context.lineTo(2048, y); context.stroke() }
      context.lineWidth = 2
      for (let x = -10; x < 2050; x += 24) { context.beginPath(); context.moveTo(x, 975); context.lineTo(x + 12, 984); context.lineTo(x + 24, 975); context.stroke() }
    }
  }
  // Fine thread interruptions keep embroidery from looking like a flat gold decal.
  for (let i = 0; i < 28000; i++) {
    const x = random() * 2048, y = random() * 1024
    c.fillStyle = random() > .5 ? '#fff8d810' : '#080a0918'; c.fillRect(x, y, 1, 2)
    h.fillStyle = random() > .5 ? '#929292' : '#444444'; h.fillRect(x, y, 1, 1)
  }
  const result = { color: texture(element, true), relief: texture(height), roughness: texture(rough) }
  if (withClouds) patterned = result; else plain = result
  return result
}
export function cloudTexture() { return textileMaps(true).color }
export function surface(mode: MaterialMode, clouds = false) {
  const value = materials.find(m => m.id === mode)!
  const maps = mode === 'original' ? textileMaps(clouds) : null
  return {
    color: maps ? '#ffffff' : value.color,
    map: maps?.color ?? null,
    roughness: value.roughness, metalness: value.metalness,
    roughnessMap: maps?.roughness ?? null,
    bumpMap: maps?.relief ?? (mode === 'fabric' || mode === 'leather' ? fabricTexture() : null),
    bumpScale: mode === 'original' ? .009 : mode === 'leather' ? .012 : mode === 'fabric' ? .018 : 0,
  }
}
let face: { color: CanvasTexture; relief: CanvasTexture } | undefined
export function faceTextures() {
  if (face) return face
  const { element, ctx: c } = canvas(2048, 1024), { element: relief, ctx: h } = canvas(2048, 1024)
  const random = seededRandom(223)
  c.fillStyle = '#dfbaa0'; c.fillRect(0, 0, 2048, 1024)
  h.fillStyle = '#777777'; h.fillRect(0, 0, 2048, 1024)
  for (let i = 0; i < 130000; i++) {
    const x = random() * 2048, y = random() * 1024
    c.fillStyle = random() > .5 ? '#fff1da12' : '#956e5512'; c.fillRect(x, y, .8, 1.8)
    h.fillStyle = random() > .5 ? '#a3a3a3' : '#686868'; h.fillRect(x, y, 1, 2)
  }
  function eyePath(context: CanvasRenderingContext2D, x: number, y: number, side: number) {
    context.beginPath(); context.moveTo(x - 67, y - 66 - side * 6)
    context.bezierCurveTo(x - 45, y - 112, x + 53, y - 115, x + 65, y - 53 + side * 6)
    context.bezierCurveTo(x + 81, y + 12, x + 50, y + 93, x - 4, y + 95)
    context.bezierCurveTo(x - 69, y + 89, x - 83, y + 9, x - 67, y - 66 - side * 6)
    context.closePath()
  }
  for (const side of [-1, 1]) {
    const x = 512 + side * 124, y = 568
    c.save(); eyePath(c, x, y, side); c.fillStyle = '#f0e5d0'; c.fill(); c.clip()
    for (let row = y - 110; row < y + 100; row += 3) {
      c.strokeStyle = row % 2 ? '#d6c8b0' : '#fff5e0'; c.lineWidth = 1.3
      c.beginPath(); c.moveTo(x - 82, row); c.lineTo(x + 82, row + 5); c.stroke()
    }
    const iris = c.createLinearGradient(0, y - 90, 0, y + 95)
    iris.addColorStop(0, '#261a17'); iris.addColorStop(.55, '#5c3b22'); iris.addColorStop(1, '#bf893d')
    c.beginPath(); c.ellipse(x - side * 5, y + 2, 44, 82, 0, 0, Math.PI * 2); c.fillStyle = iris; c.fill(); c.save(); c.clip()
    for (let i = 0; i < 200; i++) {
      const angle = random() * Math.PI * 2, radial = .2 + random() * .8
      c.strokeStyle = i % 3 ? '#dba35477' : '#33221d99'; c.lineWidth = 1.4
      c.beginPath(); c.moveTo(x + Math.sin(angle) * 39 * radial, y + Math.cos(angle) * 77 * radial)
      c.lineTo(x + Math.sin(angle) * 43, y + Math.cos(angle) * 82); c.stroke()
    }
    c.restore(); c.beginPath(); c.ellipse(x - side * 3, y - 16, 24, 55, 0, 0, Math.PI * 2); c.fillStyle = '#241a17'; c.fill()
    c.fillStyle = '#fff3d6'; c.beginPath(); c.ellipse(x - 15, y - 45, 14, 22, -.18, 0, Math.PI * 2); c.fill()
    c.fillStyle = '#e8c98b'; c.beginPath(); c.ellipse(x + 17, y + 43, 6, 8, 0, 0, Math.PI * 2); c.fill()
    for (let row = y - 100; row < y + 100; row += 4) { c.strokeStyle = '#ead6a610'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 80, row); c.lineTo(x + 80, row + 5); c.stroke() }
    c.restore()
    eyePath(h, x, y, side); h.fillStyle = '#a8a8a8'; h.fill()
    for (const context of [c, h]) {
      context.strokeStyle = context === c ? '#38251e' : '#d0d0d0'; context.lineWidth = 9; context.lineCap = 'round'
      context.beginPath(); context.moveTo(x - 69, y - 62 - side * 6); context.bezierCurveTo(x - 38, y - 100, x + 26, y - 108, x + 67, y - 62 + side * 6); context.stroke()
      context.lineWidth = 13; context.beginPath(); context.moveTo(x - 61, y - 143 + side * 20); context.quadraticCurveTo(x, y - 169, x + 49, y - 143 - side * 20); context.stroke()
    }
    const blush = c.createRadialGradient(x + side * 50, y + 96, 0, x + side * 50, y + 96, 36)
    blush.addColorStop(0, '#c77f6566'); blush.addColorStop(1, '#d99b7b00'); c.fillStyle = blush; c.fillRect(x + side * 50 - 36, y + 60, 72, 72)
  }
  c.strokeStyle = '#a9745c'; c.lineWidth = 3; c.beginPath(); c.moveTo(501, 708); c.quadraticCurveTo(512, 703, 523, 708); c.stroke()
  c.fillStyle = '#bf896a'; c.beginPath(); c.ellipse(512, 664, 6, 5, 0, 0, Math.PI * 2); c.fill()
  face = { color: texture(element, true), relief: texture(relief) }; return face
}
let engraving: CanvasTexture | undefined
export function coinEngraving() {
  if (engraving) return engraving
  const { element, ctx: c } = canvas(512, 512)
  c.fillStyle = '#858585'; c.fillRect(0, 0, 512, 512)
  c.strokeStyle = '#d2d2d2'; c.lineWidth = 6
  for (const radius of [230, 217]) { c.beginPath(); c.arc(256, 256, radius, 0, Math.PI * 2); c.stroke() }
  c.font = 'bold 84px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'
  c.fillStyle = '#d6d6d6'; c.fillText('半', 139, 256); c.fillText('两', 370, 256)
  c.strokeStyle = '#646464'; c.lineWidth = 2; c.strokeText('半', 139, 256); c.strokeText('两', 370, 256)
  engraving = texture(element); return engraving
}

let pile: CanvasTexture | undefined
export function hairTexture() {
  if (pile) return pile
  const { element, ctx: c } = canvas(512, 512), random = seededRandom(552)
  c.fillStyle = '#787878'; c.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 20000; i++) {
    const x = random() * 512, y = random() * 512, length = 4 + random() * 26, value = Math.floor(65 + random() * 115)
    c.strokeStyle = `rgb(${value},${value},${value})`; c.lineWidth = .4 + random() * .5
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 1.5, y + length * .6, x - 1 + random() * 2, y + length); c.stroke()
  }
  pile = texture(element, false, true); pile.repeat.set(2, 2); return pile
}
