export type View = 'front' | 'side' | 'back' | 'top' | 'iso'
export type LightMode = 'studio' | 'warm' | 'dark'
export type MaterialMode = 'original' | 'metal' | 'leather' | 'fabric' | 'plastic'
export const views: {id:View; label:string; en:string}[] = [
  {id:'front',label:'正面',en:'FRONT'}, {id:'side',label:'侧面',en:'SIDE'}, {id:'back',label:'背面',en:'BACK'}, {id:'top',label:'顶部',en:'TOP'}, {id:'iso',label:'轴测',en:'45°'}
]
export const hotspots = [
  {id:'crown', label:'金属冠饰', en:'CROWN & RING', position:[0.42,3.36,0.2] as [number,number,number], title:'冠冕之形，秩序之意', text:'金色冠饰与圆环呼应秦文化的秩序意象。概念模型以金属 PBR 表现暖金反射；实际合金、镀层与连接方式待实物确认。', material:'金属 / Metal', roughness:'0.28',metalness:'0.85'},
  {id:'face', label:'刺绣面部', en:'EMBROIDERED FACE', position:[0.66,2.38,0.54] as [number,number,number], title:'柔软之中，藏着少年气', text:'米肤色面部、深棕眼睛与黑色绒发构成角色的主要识别特征。眼部用独立曲面组合表达，刺绣针法与绒毛密度需真实贴图补充。', material:'绒布 / Plush', roughness:'0.96',metalness:'0.00'},
  {id:'coin', label:'半两钱胸饰', en:'COIN PENDANT', position:[0.28,1.4,0.69] as [number,number,number], title:'一枚方孔钱，连接古今', text:'从展板提取圆形方孔钱胸饰，以独立几何体呈现金属厚度与穿孔。未复刻无法确认的文字或精密连接结构。', material:'金属 / Metal', roughness:'0.28',metalness:'0.85'},
  {id:'cape', label:'云纹披风', en:'CLOUD-PATTERN CAPE', position:[-0.83,1.1,0.3] as [number,number,number], title:'玄色为底，金云为纹', text:'外扩披风与金色云纹是墨墨的核心视觉语言。程序化云纹用于概念表达，真实织物组织、刺绣走线与裁片结构需后续模型及贴图还原。', material:'织物 / Fabric', roughness:'0.92',metalness:'0.00'}
]
export const materials: {id:MaterialMode; label:string; color:string; roughness:number; metalness:number}[] = [
  {id:'original',label:'原始 CMF',color:'#b99b65',roughness:0.92,metalness:0},
  {id:'metal',label:'金属',color:'#a88a50',roughness:0.28,metalness:0.85},
  {id:'leather',label:'皮革',color:'#543c2d',roughness:0.66,metalness:0},
  {id:'fabric',label:'织物',color:'#676760',roughness:0.96,metalness:0},
  {id:'plastic',label:'塑料',color:'#d9cbbb',roughness:0.24,metalness:0}
]
