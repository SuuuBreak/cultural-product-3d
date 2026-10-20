import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import { materials, type MaterialMode } from '../data/product'
let cloth: CanvasTexture | undefined
let cloud: CanvasTexture | undefined
export function fabricTexture() {
  if (cloth) return cloth
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle='#888'; ctx.fillRect(0,0,128,128)
  for(let i=0;i<128;i+=2){ctx.fillStyle=i%4?'#989898':'#747474';ctx.fillRect(i,0,1,128);ctx.fillRect(0,i,128,1)}
  cloth = new CanvasTexture(canvas); cloth.wrapS=cloth.wrapT=RepeatWrapping; cloth.repeat.set(7,7)
  return cloth
}
export function cloudTexture() {
  if(cloud) return cloud
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512
  const c=canvas.getContext('2d')!;c.fillStyle='#191a1a';c.fillRect(0,0,1024,512)
  c.strokeStyle='#aa8751';c.lineWidth=3
  for(let row=0;row<3;row++)for(let col=0;col<7;col++){
    c.save();c.translate(col*160+(row%2)*70,row*180+70);c.beginPath();
    c.moveTo(-62,22);c.bezierCurveTo(-92,9,-53,-25,-36,-9);c.bezierCurveTo(-35,-60,31,-57,28,-20);c.bezierCurveTo(66,-39,85,13,45,19);c.bezierCurveTo(16,22,20,-5,2,-1);c.bezierCurveTo(-13,3,-7,19,5,14);c.stroke();
    c.beginPath();c.moveTo(-64,31);c.bezierCurveTo(-21,17,-4,41,50,28);c.stroke();c.restore()
  }
  c.lineWidth=8;c.strokeRect(0,7,1024,498)
  cloud=new CanvasTexture(canvas);cloud.colorSpace=SRGBColorSpace;return cloud
}
export function surface(mode:MaterialMode) {
 const value=materials.find(m=>m.id===mode)!
 return {color:mode==='original'?'#202122':value.color, roughness:value.roughness,metalness:value.metalness, bumpMap:fabricTexture(),bumpScale:mode==='metal'||mode==='plastic'?0.002:0.035}
}
