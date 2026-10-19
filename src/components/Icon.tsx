export default function Icon({name,size=18}:{name:string;size?:number}){
 const paths:Record<string,React.ReactNode>={
  rotate:<><path d="M3 9a9 9 0 1 1 1 9M3 3v6h6"/></>,
  play:<path d="m8 5 11 7-11 7Z"/>,pause:<><path d="M8 5v14M16 5v14"/></>,
  cube:<><path d="m12 3 9 5v8l-9 5-9-5V8ZM3 8l9 5 9-5M12 13v8M7.5 5.5l9 5"/></>,
  plus:<path d="M12 5v14M5 12h14"/>,arrow:<path d="M5 12h14m-6-6 6 6-6 6"/>,
  upload:<><path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5"/></>,
  expand:<path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6"/>,
  sun:<><circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/></>,
  cross:<path d="m6 6 12 12M6 18 18 6"/>,check:<path d="m5 12 4 4L19 6"/>,
  eye:<><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
  mouse:<><rect x="6" y="2" width="12" height="20" rx="6"/><path d="M12 6v4"/></>,
 }
 return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]??paths.cube}</svg>
}
