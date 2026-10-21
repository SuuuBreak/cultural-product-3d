export type View = 'front' | 'side' | 'back' | 'top' | 'iso'
export type LightMode = 'studio' | 'warm' | 'dark'
export type MaterialMode = 'original' | 'metal' | 'leather' | 'fabric' | 'plastic'
export const views: {id:View; label:string; en:string}[] = [
  {id:'front',label:'正面',en:'FRONT'}, {id:'side',label:'侧面',en:'SIDE'}, {id:'back',label:'背面',en:'BACK'}, {id:'top',label:'顶部',en:'TOP'}, {id:'iso',label:'轴测',en:'45°'}
]
export const hotspots = [
  {id:'crown', label:'金属冠饰', en:'CROWN & RING', position:[0.32,3.42,0.49] as [number,number,number], title:'冠冕之形，秩序之意', text:'金色冠饰与圆环呼应秦文化的秩序意象。概念模型以金属 PBR 表现暖金反射；实际合金、镀层与连接方式待实物确认。', material:'金属 / Metal', roughness:'0.34',metalness:'0.82'},
  {id:'face', label:'刺绣面部', en:'EMBROIDERED FACE', position:[0.58,2.34,0.58] as [number,number,number], title:'柔软之中，藏着少年气', text:'米肤色面部使用贴合三维头部的程序化刺绣纹理，表现瞳色、眉形与细小针脚。弯曲发束与批量细纤维近似毛绒；尚未使用实物扫描或真实刺绣贴图。', material:'绒布 / Plush', roughness:'0.96',metalness:'0.00'},
  {id:'coin', label:'半两钱胸饰', en:'COIN PENDANT', position:[0.10,1.40,0.57] as [number,number,number], title:'一枚方孔钱，连接古今', text:'从展板提取圆形方孔钱胸饰，以独立几何体呈现厚度、方孔、双圈和连接绳。浅浮雕字样为视觉示意，历史字形、实际镀层与装配结构仍待确认。', material:'金属 / Metal', roughness:'0.34',metalness:'0.82'},
  {id:'cape', label:'云纹披风', en:'CLOUD-PATTERN CAPE', position:[-0.78,1.0,0.30] as [number,number,number], title:'玄色为底，金云为纹', text:'披风加入曲面褶皱、内衬、双层包边和分层云纹纹理，以起伏与粗糙度表现绣线。图案和裁片为参考展板的概念重建，不代表实际工艺或尺寸。', material:'织物 / Fabric', roughness:'0.92',metalness:'0.00'}
]
export const materials: {id:MaterialMode; label:string; color:string; roughness:number; metalness:number}[] = [
  {id:'original',label:'原始 CMF',color:'#b99b65',roughness:0.92,metalness:0},
  {id:'metal',label:'金属',color:'#a88a50',roughness:0.28,metalness:0.85},
  {id:'leather',label:'皮革',color:'#543c2d',roughness:0.66,metalness:0},
  {id:'fabric',label:'织物',color:'#676760',roughness:0.96,metalness:0},
  {id:'plastic',label:'塑料',color:'#d9cbbb',roughness:0.24,metalness:0}
]
