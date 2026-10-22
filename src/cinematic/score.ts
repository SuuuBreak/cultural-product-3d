/** Locally synthesised pentatonic ambient score. No third-party music or requests. */
export class QinScore {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private voiceBus: GainNode | null = null
  private timer: number | undefined
  private nextNote = 0
  private step = 0
  private disposed = false
  private revision = 0
  private volume = 0.38

  private create() {
    const ctx = new AudioContext()
    this.context = ctx
    const master = ctx.createGain()
    master.gain.value = 0
    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.value = -18
    compressor.ratio.value = 3
    master.connect(compressor).connect(ctx.destination)
    this.master = master
    const voice = ctx.createGain()
    voice.gain.value = 0.8
    voice.connect(master)
    this.voiceBus = voice
    // A deterministic stereo impulse produces a soft, diffuse room tail.
    const reverb = ctx.createConvolver()
    const impulse = ctx.createBuffer(2, ctx.sampleRate * 3.5, ctx.sampleRate)
    let seed = 77
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel)
      for (let i = 0; i < data.length; i++) {
        seed = (seed * 1664525 + 1013904223) >>> 0
        data[i] = (seed / 4294967296 * 2 - 1) * Math.pow(1 - i / data.length, 3.4) * 0.45
      }
    }
    reverb.buffer = impulse
    const wet = ctx.createGain()
    wet.gain.value = 0.4
    voice.connect(reverb).connect(wet).connect(master)
    const delay = ctx.createDelay(2)
    delay.delayTime.value = 0.79
    const feedback = ctx.createGain()
    feedback.gain.value = 0.19
    voice.connect(delay).connect(feedback).connect(delay)
    feedback.connect(master)
    this.nextNote = ctx.currentTime + 0.15
  }

  private note(midi: number, at: number, length: number, strength: number, pad = false) {
    const ctx = this.context!
    const envelope = ctx.createGain()
    const pan = ctx.createStereoPanner()
    pan.pan.value = Math.sin(this.step * 1.7) * 0.35
    envelope.connect(pan).connect(this.voiceBus!)
    const attack = pad ? 1.5 : 0.015
    envelope.gain.setValueAtTime(0.0001, at)
    envelope.gain.exponentialRampToValueAtTime(strength, at + attack)
    envelope.gain.exponentialRampToValueAtTime(0.0001, at + length)
    const harmonics = pad ? [1, 2] : [1, 2, 3, 4.01]
    let remaining = harmonics.length
    harmonics.forEach((harmonic, index) => {
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12) * harmonic
      gain.gain.setValueAtTime(pad ? 0.6 / (index + 1) : 0.75 / (index + 1) ** 2, at)
      if (index > 0) gain.gain.exponentialRampToValueAtTime(0.0001, at + length * 0.5)
      oscillator.connect(gain).connect(envelope)
      oscillator.start(at)
      oscillator.stop(at + length + 0.1)
      oscillator.onended = () => {
        oscillator.disconnect()
        gain.disconnect()
        if (--remaining === 0) { envelope.disconnect(); pan.disconnect() }
      }
    })
  }

  private schedule = () => {
    const ctx = this.context
    if (!ctx || ctx.state !== 'running') return
    const melody = [62, 69, 74, 76, 74, 69, 67, 64, 62, 67, 69, 74, 76, 81, 76, 74,
      69, 67, 64, 62, 64, 67, 69, 74, 67, 64, 62, 57, 62, 64, 67, 69]
    if (this.nextNote < ctx.currentTime) this.nextNote = ctx.currentTime + 0.05
    while (this.nextNote < ctx.currentTime + 0.3) {
      const index = this.step % melody.length
      this.note(melody[index], this.nextNote, 4, index % 4 === 0 ? 0.22 : 0.13)
      if (index % 8 === 0) {
        this.note(index < 16 ? 38 : 43, this.nextNote, 10, 0.13, true)
        this.note(index < 16 ? 57 : 62, this.nextNote + 0.08, 9, 0.07, true)
      }
      this.nextNote += index % 4 === 3 ? 2.4 : 1.2
      this.step++
    }
  }

  async play() {
    if (this.disposed) return
    const revision = ++this.revision
    if (!this.context) this.create()
    await this.context!.resume()
    if (revision !== this.revision || this.disposed) return
    this.master!.gain.setTargetAtTime(this.volume, this.context!.currentTime, 0.6)
    this.schedule()
    window.clearInterval(this.timer)
    this.timer = window.setInterval(this.schedule, 150)
  }

  pause() {
    const revision = ++this.revision
    window.clearInterval(this.timer)
    if (!this.context || this.context.state === 'closed') return
    this.master!.gain.setTargetAtTime(0, this.context.currentTime, 0.08)
    window.setTimeout(() => {
      if (revision === this.revision && this.context?.state === 'running') void this.context.suspend()
    }, 350)
  }

  setVolume(value: number) {
    this.volume = Math.max(0, Math.min(value, 1))
    if (this.context?.state === 'running') this.master!.gain.setTargetAtTime(this.volume, this.context.currentTime, 0.1)
  }

  dispose() {
    this.disposed = true
    this.revision++
    window.clearInterval(this.timer)
    if (this.context && this.context.state !== 'closed') void this.context.close()
  }
}
