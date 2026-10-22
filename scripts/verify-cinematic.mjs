import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'

// Optional browser acceptance check. Install Playwright separately; no runtime dependency.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const baseURL = process.env.PREVIEW_URL || 'http://127.0.0.1:4173'
const output = process.env.SCREENSHOT_DIR || '/tmp/momo-cinematic-qa'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  headless: true,
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
const errors = []
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await page.addInitScript(() => {
    const NativeContext = window.AudioContext
    window.AudioContext = class extends NativeContext {
      constructor(...args) {
        super(...args)
        window.__audio = this
        const analyser = this.createAnalyser()
        window.__analyser = analyser
        const create = this.createDynamicsCompressor.bind(this)
        this.createDynamicsCompressor = () => { const compressor = create(); compressor.connect(analyser); return compressor }
      }
    }
  })
  await page.goto(baseURL, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(1600)
  assert.equal(await page.evaluate(() => Boolean(window.__audio)), false, 'No sound before a gesture')
  assert.equal(await page.locator('canvas').count(), 0, 'Story does not load WebGL')
  assert.equal(await page.evaluate(() => performance.getEntriesByType('resource').some(entry => /\/assets\/App-.*\.js/.test(entry.name))), false, 'Three.js chunk is lazy')
  assert.ok(await page.evaluate(() => document.fonts.check('40px "Qin Serif"')))
  await page.screenshot({ path: `${output}/desktop.png` })
  await page.getByRole('button', { name: '开启沉浸体验', exact: true }).click()
  await page.waitForFunction(() => window.scrollY > 35, null, { timeout: 20000 })
  assert.equal(await page.evaluate(() => window.__audio.state), 'running')
  assert.ok(await page.evaluate(() => { const data = new Float32Array(2048); window.__analyser.getFloatTimeDomainData(data); return data.some(value => Math.abs(value) > 0.00001) }), 'Score produces an audio signal')
  assert.ok(await page.evaluate(() => window.scrollY > 35), 'Automatic journey advances')
  await page.getByRole('button', { name: '暂停自动观赏', exact: true }).click()
  const pausedAt = await page.evaluate(() => window.scrollY)
  await page.waitForTimeout(400)
  assert.ok(Math.abs(await page.evaluate(() => window.scrollY) - pausedAt) < 2, 'Pause stops scrolling')
  await page.getByRole('button', { name: '继续自动观赏' }).click()
  await page.mouse.wheel(0, 120)
  await page.getByRole('button', { name: '继续自动观赏' }).waitFor()
  await page.getByRole('button', { name: '关闭背景音乐' }).click()
  await page.waitForTimeout(500)
  assert.equal(await page.evaluate(() => window.__audio.state), 'suspended')
  await page.getByRole('button', { name: '开启背景音乐' }).click()
  await page.waitForTimeout(100)
  assert.equal(await page.evaluate(() => window.__audio.state), 'running')
  await page.locator('[aria-label="背景音乐音量"]').fill('15')

  await page.getByRole('navigation', { name: '故事章节' }).getByRole('link', { name: /墨墨/ }).click()
  await page.waitForTimeout(1500)
  await page.getByRole('button', { name: '查看冠有其序' }).click()
  assert.equal(await page.locator('#detail-0').isVisible(), true)
  assert.equal(await page.locator('#detail-1').isVisible(), false)
  await page.waitForTimeout(1600)
  await page.screenshot({ path: `${output}/character.png` })
  await page.getByRole('navigation', { name: '故事章节' }).getByRole('link', { name: /织造/ }).click()
  await page.waitForTimeout(1600)
  await page.getByRole('tab', { name: /暖金钱饰/ }).click()
  assert.match(await page.getByRole('tabpanel').innerText(), /方圆之间/)
  await page.keyboard.press('ArrowRight')
  assert.match(await page.getByRole('tabpanel').innerText(), /一缕绛红/)
  await page.getByRole('button', { name: '切换到下一处工艺细节' }).click()
  assert.match(await page.getByRole('tabpanel').innerText(), /金线游走/)
  await page.waitForTimeout(2100)
  await page.screenshot({ path: `${output}/craft.png` })

  await page.getByRole('button', { name: /关于本次数字展映/ }).click()
  assert.equal(await page.locator('dialog').isVisible(), true)
  await page.keyboard.press('Escape')
  assert.equal(await page.locator('dialog').isVisible(), false)
  await page.getByRole('navigation', { name: '故事章节' }).getByRole('link', { name: /相伴/ }).click()
  await page.waitForTimeout(1600)
  await page.screenshot({ path: `${output}/companion.png` })
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)

  for (const width of [390, 320]) {
    const mobile = await browser.newPage({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true })
    mobile.on('pageerror', error => errors.push(error.message))
    await mobile.goto(baseURL, { waitUntil: 'networkidle' })
    await mobile.waitForTimeout(1800)
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    assert.equal(await mobile.locator('.hero-visual img').evaluate(image => image.complete && image.naturalWidth > 0), true)
    await mobile.screenshot({ path: `${output}/mobile-${width}.png` })
    await mobile.getByRole('button', { name: '前往织造' }).click()
    await mobile.waitForTimeout(1600)
    await mobile.getByRole('tab', { name: /绛红流苏/ }).click()
    assert.match(await mobile.getByRole('tabpanel').innerText(), /一缕绛红/)
    await mobile.waitForTimeout(2200)
    await mobile.screenshot({ path: `${output}/mobile-craft-${width}.png` })
    await mobile.close()
  }
  const reduced = await browser.newPage({ reducedMotion: 'reduce' })
  await reduced.goto(baseURL, { waitUntil: 'networkidle' })
  await reduced.getByRole('button', { name: '下一章节' }).click()
  assert.equal(await reduced.locator('.journey-playing').count(), 0)
  assert.equal(await reduced.locator('#character').evaluate(el => Math.abs(el.getBoundingClientRect().top - 76) < 5), true)
  await reduced.close()

  await page.setViewportSize({ width: 1000, height: 800 })
  await page.getByRole('link', { name: /进入 3D 自由探索/ }).click()
  await page.waitForURL('**/explore')
  await page.locator('canvas').waitFor({ timeout: 60000 })
  await page.getByRole('button', { name: '复位', exact: true }).click()
  await page.getByRole('link', { name: '← 返回沉浸叙事' }).click()
  await page.waitForURL(baseURL + '/')
  await page.locator('#hero-title').waitFor()
  assert.deepEqual(errors, [])
  console.log('PASS: desktop/mobile, real audio signal, mute/resume, automatic journey/pause/takeover, chapters, craft tabs + keyboard, details, dialog, reduced motion, lazy 3D route and return; no browser errors.')
} finally {
  await browser.close()
}
