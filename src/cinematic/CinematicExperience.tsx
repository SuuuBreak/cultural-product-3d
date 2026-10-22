import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { QinScore } from './score'
import './cinematic.css'

const chapters = [
  { id: 'overture', title: '序章', en: 'OVERTURE' },
  { id: 'character', title: '墨墨', en: 'CHARACTER' },
  { id: 'craft', title: '织造', en: 'CRAFT' },
  { id: 'companion', title: '相伴', en: 'COMPANION' },
]
const details = [
  { title: '冠有其序', en: 'THE CROWN', copy: '一枚暖金冠饰，收住蓬松的玄色发髻。将秦的秩序感，化为少年眉宇间的一点光。', label: '金属冠饰 · 玄色绒毛', position: '72% 24%', scale: 1.75 },
  { title: '目有星河', en: 'THE EXPRESSION', copy: '用细密的绣线勾勒眼神，让威仪里藏着一丝稚气。柔软的面庞，是与古老文化相遇的第一份亲近。', label: '刺绣表情 · 柔软织物', position: '72% 45%', scale: 1.35 },
  { title: '衣藏山河', en: 'THE SILHOUETTE', copy: '玄衣、云纹与垂落的绛红，在小小的身形上层层展开。庄重的纹样，也能拥有温柔的轮廓。', label: '云纹披风 · 层叠衣装', position: '68% 78%', scale: 1.5 },
]
const crafts = [
  { title: '金线游走，云起玄衣。', en: 'GOLDEN THREADS, WOVEN STORIES.', copy: '光掠过织物的起伏，也掠过一针一线的云纹。让文化的纹理，在近处被看见。', material: '玄色提花 / 金线刺绣', color: '#b99a64', position: '30% 50%', scale: 1.05 },
  { title: '方圆之间，自有秩序。', en: 'A SMALL SYMBOL OF UNITY.', copy: '圆形钱饰与方孔相互映照。暖金色的光泽，为深色衣装留下一个明亮的视觉重心。', material: '暖金饰件 / 方孔钱意象', color: '#d6ad65', position: '98% 40%', scale: 1.12 },
  { title: '一缕绛红，让故事流动。', en: 'A THREAD THAT CONNECTS.', copy: '一抹克制的红，垂落在玄黑与暖金之间。随着日常的步履，为小小的角色添一份生动。', material: '绛红织带 / 流苏细节', color: '#913f34', position: '100% 95%', scale: 1.1 },
]

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={diagonal ? { transform: 'rotate(-45deg)' } : undefined}><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.2" /></svg>
}
function Play({ paused = false }: { paused?: boolean }) {
  return <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">{paused ? <path d="M7 5v10m6-10v10" stroke="currentColor" strokeWidth="2" /> : <path d="m7 4 9 6-9 6V4Z" stroke="currentColor" strokeWidth="1.2" />}</svg>
}
function Visual({ src, className = '', alt, eager = false }: { src: string; className?: string; alt: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false)
  return <div className={`cinema-visual ${className} ${failed ? 'visual-failed' : ''}`}>
    <img src={`/cinematic/${src}.webp`} alt={alt} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" onError={() => setFailed(true)} />
    {failed && <p role="status">画面暂未载入，请刷新页面重试。</p>}
  </div>
}

export default function CinematicExperience() {
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(false)
  const [sound, setSound] = useState(false)
  const [volume, setVolume] = useState(38)
  const [detail, setDetail] = useState(1)
  const [craft, setCraft] = useState(0)
  const [audioError, setAudioError] = useState('')
  const [reduced, setReduced] = useState(false)
  const score = useRef<QinScore | null>(null)
  const soundWanted = useRef(false)
  const page = useRef<HTMLDivElement>(null)
  const progress = useRef<HTMLDivElement>(null)
  const credits = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => { setReduced(query.matches); if (query.matches) setPlaying(false) }
    update()
    query.addEventListener('change', update)
    return () => { query.removeEventListener('change', update); score.current?.dispose() }
  }, [])

  useEffect(() => {
    const root = page.current!
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-revealed'); observer.unobserve(entry.target) } })
    }, { threshold: 0.12 })
    root.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el))
    let frame = 0
    const update = () => {
      frame = 0
      const height = document.documentElement.scrollHeight - window.innerHeight
      const amount = height > 0 ? Math.min(1, window.scrollY / height) : 0
      progress.current?.style.setProperty('--progress', String(amount))
      root.classList.toggle('has-scrolled', window.scrollY > 50)
      let current = 0
      chapters.forEach((chapter, index) => {
        const element = document.getElementById(chapter.id)!
        const rect = element.getBoundingClientRect()
        if (rect.top < window.innerHeight * 0.5) current = index
        if (rect.bottom > 0 && rect.top < window.innerHeight) element.style.setProperty('--scene-progress', String(Math.max(0, Math.min(1, -rect.top / rect.height))))
      })
      setActive(current)
    }
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update) }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    update()
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
  }, [])

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) { setPlaying(false); score.current?.pause() }
      else if (soundWanted.current) void score.current?.play().catch(() => { setSound(false); soundWanted.current = false; setAudioError('点击声音按钮可重新开启音乐。') })
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  useEffect(() => {
    if (!playing || reduced) return
    let frame = 0
    let previous = performance.now()
    let wait = 2.5
    let position = window.scrollY
    const animate = (now: number) => {
      const dt = Math.min((now - previous) / 1000, 0.5)
      previous = now
      if (wait > 0) wait -= dt
      else {
        const end = document.documentElement.scrollHeight - window.innerHeight
        position = Math.min(end, position + dt * (window.innerWidth < 700 ? 42 : 55))
        window.scrollTo({ top: position, behavior: 'instant' })
        if (position >= end - 1) { setPlaying(false); return }
      }
      frame = requestAnimationFrame(animate)
    }
    const stop = () => setPlaying(false)
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', 'Escape'].includes(e.key) || (e.code === 'Space' && e.target === document.body)) stop()
    }
    window.addEventListener('wheel', stop, { passive: true })
    window.addEventListener('touchstart', stop, { passive: true })
    window.addEventListener('keydown', onKey)
    frame = requestAnimationFrame(animate)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('wheel', stop); window.removeEventListener('touchstart', stop); window.removeEventListener('keydown', onKey) }
  }, [playing, reduced])

  async function toggleSound(want = !soundWanted.current) {
    soundWanted.current = want
    setSound(want)
    setAudioError('')
    if (!want) { score.current?.pause(); return }
    try {
      if (!score.current) score.current = new QinScore()
      score.current.setVolume(volume / 100)
      await score.current.play()
    } catch { soundWanted.current = false; setSound(false); setAudioError('声音暂时无法开启，你仍可继续浏览画面。') }
  }
  function navigate(index: number) {
    setPlaying(false)
    document.getElementById(chapters[index].id)?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' })
  }
  function begin() {
    setStarted(true)
    void toggleSound(true)
    if (!reduced) setPlaying(true)
    else navigate(1)
  }
  function toggleJourney() {
    if (reduced) { navigate((active + 1) % chapters.length); return }
    if (!started) { begin(); return }
    if (!playing && window.scrollY >= document.documentElement.scrollHeight - window.innerHeight - 3) window.scrollTo({ top: 0, behavior: 'instant' })
    setPlaying(value => !value)
  }

  return <div className={`cinema ${playing ? 'journey-playing' : ''}`} ref={page}>
    <a className="cinema-skip" href="#character">跳至产品故事</a>
    <header className="cinema-header">
      <a href="#overture" className="cinema-brand" onClick={e => { e.preventDefault(); navigate(0) }} aria-label="寻秦，返回序章"><span className="qin-stamp">秦</span><span>寻秦<small>THE SEVEN WOVEN SPRITES</small></span></a>
      <nav aria-label="故事章节">{chapters.map((chapter, index) => <a key={chapter.id} href={`#${chapter.id}`} aria-current={active === index ? 'location' : undefined} onClick={e => { e.preventDefault(); navigate(index) }}><small>0{index + 1}</small>{chapter.title}</a>)}</nav>
      <button className={`sound-button ${sound ? 'sound-on' : ''}`} onClick={() => void toggleSound()} aria-label={sound ? '关闭背景音乐' : '开启背景音乐'} aria-pressed={sound}><span className="sound-wave" aria-hidden="true">{[0, 1, 2, 3, 4].map(i => <i key={i} style={{ '--i': i } as CSSProperties} />)}</span><span>声音 {sound ? '开' : '关'}</span></button>
    </header>

    <main>
      <section id="overture" className="cinema-hero scene" aria-labelledby="hero-title" onPointerMove={e => {
        if (reduced || e.pointerType !== 'mouse') return
        e.currentTarget.style.setProperty('--mx', `${(e.clientX / window.innerWidth - 0.5) * 9}px`)
        e.currentTarget.style.setProperty('--my', `${(e.clientY / window.innerHeight - 0.5) * 6}px`)
      }}>
        <Visual src="momo-hero" className="hero-visual" alt="墨墨概念视觉：玄色毛绒少年身着金线云纹披风，立于暖光中的石台" eager />
        <div className="hero-shade" />
        <div className="cinema-dust" aria-hidden="true">{Array.from({ length: 13 }, (_, i) => <i key={i} style={{ '--i': i, left: `${12 + (i * 17) % 79}%`, top: `${18 + (i * 23) % 71}%` } as CSSProperties} />)}</div>
        <div className="hero-copy">
          <div className="cinema-kicker intro-enter"><span />寻秦 · 七萌织锦 <i /> 卷一</div>
          <h1 id="hero-title" className="intro-enter">一袭玄衣，<br className="hero-first-break" />藏一座<br className="hero-second-break" /><em>少年帝国。</em></h1>
          <p className="hero-description intro-enter">越过千年的风，<br />让厚重的文化，成为掌心的温柔。</p>
          <div className="hero-actions intro-enter"><button className="cinema-primary" onClick={begin}><span className="play-orbit"><Play /></span>{started ? '再次开启沉浸体验' : '开启沉浸体验'}<span className="button-line" /></button><span className="audio-invitation">建议佩戴耳机 · 含环境弦音</span></div>
        </div>
        <div className="hero-side-label">CULTURE, HELD CLOSE.</div>
        <div className="hero-floor"><button className="scroll-invitation" onClick={() => navigate(1)}><span className="scroll-line" />向下，走进墨墨的世界<span>SCROLL TO DISCOVER</span></button><div className="hero-name"><span>墨 墨</span><i>MO–MO</i><small>QIN COLLECTION / 001</small></div></div>
      </section>

      <section className="cinema-prologue" aria-label="设计序言">
        <span className="prologue-watermark" aria-hidden="true">秦</span>
        <div data-reveal><span className="cinema-kicker">AN ANCIENT SPIRIT. A NEW COMPANION.</span><h2>秦有山河，<br /><span>我有墨墨。</span></h2><p>当千年的秩序，遇见一份柔软。<br />冠饰、云纹、方孔钱，化作陪你出发的小小少年。</p><span className="red-stamp">寻秦</span></div>
      </section>

      <section id="character" className="cinema-character scene" aria-labelledby="character-title">
        <div className="character-photo" style={{ '--detail-scale': details[detail].scale, '--detail-origin': details[detail].position } as CSSProperties}>
          <Visual src="momo-hero" alt="墨墨的冠饰、刺绣表情与云纹衣装概念特写" />
          <div className="portrait-vignette" />
          <div className="photo-coordinate"><span>FIG. 01 — MO–MO</span><span>秦 / THE CHARACTER</span></div>
          <div className="portrait-caption" key={detail}><span>0{detail + 1}</span>{details[detail].label}</div>
          <div className="portrait-pins" aria-label="选择角色细节">{details.map((item, index) => <button key={item.en} className={detail === index ? 'active' : ''} onClick={() => { setDetail(index); setPlaying(false) }} aria-label={`查看${item.title}`} aria-pressed={detail === index}>0{index + 1}</button>)}</div>
        </div>
        <div className="character-copy" data-reveal>
          <div className="section-caption"><span>01 / THE CHARACTER</span><span>统一 · 秩序 · 少年</span></div>
          <h2 id="character-title">帝国的气度，<br /><em>少年的温度。</em></h2>
          <p className="section-intro">以玄黑为衣，以暖金为饰。<br />在方寸之间，收藏一份有性格的温柔。</p>
          <div className="detail-accordion">{details.map((item, index) => <div key={item.en} className={detail === index ? 'detail-open' : ''}><h3><button aria-expanded={detail === index} aria-controls={`detail-${index}`} onClick={() => { setDetail(index); setPlaying(false) }}><small>0{index + 1}</small><span>{item.title}</span><i>{detail === index ? '−' : '+'}</i></button></h3><div id={`detail-${index}`} className="detail-body" hidden={detail !== index}><small>{item.en}</small><p>{item.copy}</p></div></div>)}</div>
          <span className="interaction-note"><span />点击细节，靠近一点。</span>
        </div>
      </section>

      <section id="craft" className={`cinema-craft scene craft-${craft}`} aria-labelledby="craft-title">
        <Visual src="momo-craft" className="craft-visual" alt="金线云纹刺绣、暖金方孔钱饰与绛红流苏的概念微距画面" />
        <div className="craft-shade" />
        <div className="craft-topline"><span>02 / MATERIAL & CRAFT</span><span>近观，另有天地。</span></div>
        <div className="craft-copy" data-reveal><span className="cinema-kicker">THE POETRY OF MATERIAL</span><div key={craft} className="craft-description" role="tabpanel" id="craft-panel" aria-labelledby={`craft-tab-${craft}`}><h2 id="craft-title">{crafts[craft].title.split('，')[0]}，<br /><em>{crafts[craft].title.split('，')[1]}</em></h2><p>{crafts[craft].copy}</p><span className="craft-material"><i style={{ background: crafts[craft].color }} />{crafts[craft].material}</span></div></div>
        <button className="craft-pin" onClick={() => { setCraft((craft + 1) % crafts.length); setPlaying(false) }} aria-label="切换到下一处工艺细节"><span>＋</span><small>近观细节</small></button>
        <div className="craft-tabs" role="tablist" aria-label="材质故事">{['金线云纹', '暖金钱饰', '绛红流苏'].map((label, index) => <button id={`craft-tab-${index}`} key={label} role="tab" aria-controls="craft-panel" aria-selected={craft === index} tabIndex={craft === index ? 0 : -1} onKeyDown={e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const next = (craft + (e.key === 'ArrowRight' ? 1 : 2)) % 3; setCraft(next); setPlaying(false); document.getElementById(`craft-tab-${next}`)?.focus() } }} onClick={() => { setCraft(index); setPlaying(false) }}><small>0{index + 1}</small><span>{label}</span><i>{['EMBROIDERY', 'METAL', 'RIBBON'][index]}</i></button>)}</div>
      </section>

      <section className="cinema-palette" aria-label="色彩意象"><div data-reveal><span className="cinema-kicker">THE COLOURS OF QIN</span><p>三种颜色，<span>一种性格。</span></p></div><div className="palette-items" data-reveal>{[['玄黑', 'INK BLACK', '#252320', '沉静，有力量。'], ['暖金', 'ANTIQUE GOLD', '#b9985f', '光华，有分寸。'], ['绛红', 'CINNABAR RED', '#79352d', '热烈，有回响。']].map(([name, en, color, copy]) => <div key={name}><i style={{ background: color }} /><div><strong>{name}</strong><span>{en}</span><p>{copy}</p></div></div>)}</div></section>

      <section id="companion" className="cinema-companion scene" aria-labelledby="companion-title"><Visual src="momo-life" alt="墨墨作为包挂，陪伴日常出行的暖光概念场景" /><div className="companion-shade" /><div className="companion-copy" data-reveal><span className="cinema-kicker">03 / EVERYDAY COMPANION</span><h2 id="companion-title">把千年的故事，<br /><em>带在身边。</em></h2><p>挂在包上，置于案头。<br />让每一次出发，都有一份温柔的陪伴。</p><div className="companion-signature">墨墨 <span>MO–MO</span><i>寻秦 · 七萌织锦</i></div><a className="cinema-outline" href="/explore" onClick={() => { setPlaying(false); score.current?.pause() }}>进入 3D 自由探索<Arrow diagonal /></a><small className="explorer-note">可旋转、缩放的概念模型</small></div></section>
    </main>

    <footer className="cinema-footer"><div className="footer-top"><a href="#overture" className="footer-logotype" onClick={e => { e.preventDefault(); navigate(0) }}>寻秦<span>文化为源，设计为桥。</span></a><button onClick={() => { setPlaying(false); credits.current?.showModal() }}>关于本次数字展映<Arrow diagonal /></button><button onClick={() => navigate(0)}>再看一遍 ↑</button></div><div className="footer-colophon"><span>THE SEVEN WOVEN SPRITES © 2026</span><span>AI 概念影像 · 交互叙事样片</span><span>DESIGNED TO BE FELT.</span></div></footer>

    <aside className="chapter-rail" aria-label="当前章节"><span>0{active + 1}</span><div>{chapters.map((chapter, index) => <button key={chapter.id} aria-label={`前往${chapter.title}`} aria-current={active === index ? 'step' : undefined} onClick={() => navigate(index)} />)}</div><small>04</small></aside>
    <div className={`journey-control ${started ? 'is-started' : ''}`}><button onClick={toggleJourney} aria-label={reduced ? '下一章节' : playing ? '暂停自动观赏' : started ? '继续自动观赏' : '开启自动观赏'}><Play paused={playing} /><span>{reduced ? '下一章节' : playing ? '暂停观赏' : started ? '继续观赏' : '自动观赏'}</span></button><span className="journey-status">{playing ? '滚动即可自由探索' : `${chapters[active].en} / 0${active + 1}`}</span>{sound && <label className="volume-control"><span>音量</span><input type="range" min="0" max="70" value={volume} aria-label="背景音乐音量" onChange={e => { const next = Number(e.target.value); setVolume(next); score.current?.setVolume(next / 100) }} /></label>}</div>
    <div className="cinema-progress" ref={progress} aria-hidden="true" />
    {audioError && <div className="cinema-alert" role="status">{audioError}<button aria-label="关闭声音提示" onClick={() => setAudioError('')}>×</button></div>}
    <dialog className="cinema-credits" ref={credits} onClick={e => { if (e.target === credits.current) credits.current.close() }}><div><button className="credits-close" onClick={() => credits.current?.close()} aria-label="关闭展映说明">×</button><span className="cinema-kicker">ABOUT THIS EXPERIENCE</span><h2>一场关于墨墨的<br />数字展映。</h2><p>本次样片以「寻秦 · 七萌织锦」设计展板为灵感。主视觉、工艺特写与生活场景为 AI 生成的概念影像，用于体验视觉叙事与交互氛围，并非实物摄影或准确的产品还原。</p><p>背景声音由网页即时合成，以五声音阶的拨弦音色与柔和环境声铺陈。右上角可随时关闭声音；自动观赏可以暂停，滚动或触摸即可接管。</p><p>独立的 3D 展厅保留几何概念模型及 GLB / GLTF 导入。模型的外形与工艺精度，仍需后续真实三维资产支持。</p><small>影像 / AI 概念创作　声音 / 程序合成<br />字体 / Noto Serif CJK（SIL Open Font License）</small></div></dialog>
  </div>
}
