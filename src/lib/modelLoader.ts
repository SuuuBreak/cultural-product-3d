import { Box3, Group, LoadingManager, Vector3, Mesh, Texture } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
export async function loadModel(files:File[], onProgress:(n:number)=>void):Promise<Group> {
 const main=files.find(f=>/\.(glb|gltf)$/i.test(f.name))
 if(!main)throw new Error('请选择 GLB 或 GLTF 模型文件。')
 if(files.reduce((n,f)=>n+f.size,0)>100*1024*1024)throw new Error('文件总大小请控制在 100 MB 内，以保证浏览器流畅运行。')
 const urls=new Map(files.map(f=>[f.name,URL.createObjectURL(f)]))
 const manager=new LoadingManager()
 manager.setURLModifier(url=>{
  if(url.startsWith('blob:')||url.startsWith('data:'))return url
  const name=decodeURIComponent(url.split('/').pop()??'')
  const local=urls.get(name)
  if(!local)throw new Error(`缺少配套资源：${name}，请与模型一同选择。`)
  return local
 })
 manager.onProgress=(_,loaded,total)=>onProgress(Math.round(loaded/total*100))
 try {
  const gltf=await new GLTFLoader(manager).loadAsync(urls.get(main.name)!,e=>{if(e.total)onProgress(Math.round(e.loaded/e.total*100))})
  const box=new Box3().setFromObject(gltf.scene),size=box.getSize(new Vector3()),center=box.getCenter(new Vector3())
  const max=Math.max(size.x,size.y,size.z);if(!Number.isFinite(max)||max===0)throw new Error('模型为空，或没有可显示的几何体。')
  const root=new Group();gltf.scene.position.sub(center);root.add(gltf.scene);root.scale.setScalar(3.6/max);root.position.y=1.8
  root.traverse(o=>{o.castShadow=true;o.receiveShadow=true})
  return root
 } finally {urls.forEach(url=>URL.revokeObjectURL(url))}
}
export function disposeModel(model:Group){
 model.traverse(o=>{if(o instanceof Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];for(const mat of mats){for(const val of Object.values(mat))if(val instanceof Texture)val.dispose();mat.dispose()}}})
}
