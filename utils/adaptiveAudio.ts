import type { MeterSet } from '../types';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Rhythm follows the weakest team meter; pitch and loudness stay constant. */
export const tempoForMeters = (meters?: MeterSet): number => {
  if (!meters) return 72;
  const weakest = Math.min(...Object.values(meters).map(value => Number.isFinite(value) ? clamp(value, 0, 100) : 100));
  return Math.round(72 + (100 - weakest) * 0.72);
};

export interface AudioStatus {
  musicEnabled: boolean;
  notificationsEnabled: boolean;
  volume: number;
  supported: boolean;
  error: string | null;
  tempo: number;
}

type Voice = { oscillator: OscillatorNode; gain: GainNode; channel: 'music' | 'notification' };

/** Original after-hours instrumental: soft minor-seventh chords, bass, and a pentatonic pulse. */
export class AdaptiveAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private voices = new Set<Voice>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextNote = 0;
  private step = 0;
  private hidden = false;
  private disposed = false;
  private lastArrival = -Infinity;
  private musicRevision = 0;
  private notificationRevision = 0;
  private visibilityRevision = 0;
  private pendingSuspension: Promise<void> | null = null;
  private status: AudioStatus;

  constructor(private createContext: (() => AudioContext) | null, private changed: (status: AudioStatus) => void = () => {}) {
    this.status = { musicEnabled: false, notificationsEnabled: false, volume: 0.25, supported: Boolean(createContext), error: null, tempo: 72 };
  }

  getStatus = (): AudioStatus => ({ ...this.status });
  private publish() { if (!this.disposed) this.changed(this.getStatus()); }

  setMeters(meters?: MeterSet) {
    const tempo = tempoForMeters(meters);
    if (tempo !== this.status.tempo) { this.status.tempo = tempo; this.publish(); }
  }

  setVolume(volume: number) {
    this.status.volume = Number.isFinite(volume) ? clamp(volume, 0, 1) : 0;
    if (this.master && this.context) this.master.gain.setTargetAtTime(this.status.volume, this.context.currentTime, 0.02);
    this.publish();
  }

  private async unlock(): Promise<boolean> {
    if (this.disposed || this.hidden || !this.createContext) return false;
    try {
      if (this.pendingSuspension) await this.pendingSuspension;
      if (this.disposed || this.hidden) return false;
      if (!this.context) {
        this.context = this.createContext();
        this.master = this.context.createGain();
        this.master.gain.value = this.status.volume;
        this.master.connect(this.context.destination);
      }
      if (this.context.state !== 'running') await this.context.resume();
      if (this.disposed) return false;
      if (this.context.state !== 'running') throw new Error('Audio did not start');
      // A visibility change can occur while resume is pending.
      if (this.hidden) await this.suspendContext();
      this.status.error = null;
      return true;
    } catch {
      this.status.error = 'audio-unavailable';
      this.publish();
      return false;
    }
  }

  async setMusicEnabled(enabled: boolean): Promise<void> {
    const revision = ++this.musicRevision;
    if (!enabled) {
      this.status.musicEnabled = false;
      this.stopMusic();
      this.publish();
      return;
    }
    const unlocked = this.hidden ? this.status.supported : await this.unlock();
    if (this.disposed || revision !== this.musicRevision) return;
    this.status.musicEnabled = unlocked;
    if (unlocked && !this.hidden) this.startMusic();
    this.publish();
  }

  async setNotificationsEnabled(enabled: boolean): Promise<void> {
    const revision = ++this.notificationRevision;
    if (!enabled) {
      this.status.notificationsEnabled = false;
      this.stopVoices('notification');
      this.publish();
      return;
    }
    const unlocked = this.hidden ? this.status.supported : await this.unlock();
    if (this.disposed || revision !== this.notificationRevision) return;
    this.status.notificationsEnabled = unlocked;
    this.publish();
  }

  private note(frequency: number, time: number, duration: number, amplitude: number, channel: Voice['channel'], type: OscillatorType = 'sine') {
    const ctx = this.context;
    if (!ctx || !this.master || this.disposed) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, amplitude), time + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    oscillator.connect(gain);
    gain.connect(this.master);
    const voice: Voice = { oscillator, gain, channel };
    this.voices.add(voice);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); this.voices.delete(voice); };
    oscillator.start(time);
    oscillator.stop(time + duration + 0.02);
  }

  private startMusic() {
    if (this.timer || !this.context || this.hidden) return;
    this.nextNote = this.context.currentTime + 0.03;
    this.schedule();
    this.timer = setInterval(() => this.schedule(), 25);
  }

  private schedule() {
    const ctx = this.context;
    if (!ctx || ctx.state !== 'running' || this.hidden || !this.status.musicEnabled) return;
    // A stalled tab never catches up by emitting a burst of old notes.
    if (this.nextNote < ctx.currentTime) this.nextNote = ctx.currentTime + 0.03;
    while (this.nextNote < ctx.currentTime + 0.12) {
      const beat = 60 / this.status.tempo;
      const chords = [[130.81, 155.56, 196, 233.08], [103.83, 130.81, 155.56, 196], [116.54, 146.83, 174.61, 220], [98, 123.47, 146.83, 174.61]];
      const chord = chords[Math.floor(this.step / 16) % chords.length];
      const pulse = [0, 2, 1, 3, 2, 1, 3, 2][this.step % 8];
      this.note(chord[pulse] * 2, this.nextNote, 0.28, 0.09, 'music', 'triangle');
      if (this.step % 4 === 0) this.note(chord[0] / 2, this.nextNote, 0.48, 0.14, 'music');
      if (this.step % 16 === 0) chord.forEach(frequency => this.note(frequency, this.nextNote, 1.4, 0.035, 'music'));
      this.step += 1;
      this.nextNote += beat / 2;
    }
  }

  private stopVoices(channel?: Voice['channel']) {
    for (const voice of this.voices) {
      if (channel && voice.channel !== channel) continue;
      voice.oscillator.onended = null;
      try { voice.oscillator.stop(); } catch { /* Already ended. */ }
      voice.oscillator.disconnect();
      voice.gain.disconnect();
      this.voices.delete(voice);
    }
  }

  private stopMusic() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.stopVoices('music');
  }

  private canNotify() {
    return !this.disposed && !this.hidden && this.status.notificationsEnabled && this.context?.state === 'running';
  }

  playCue(frequency = 660, duration = 0.15) {
    if (!this.canNotify() || !this.context) return;
    this.note(clamp(frequency, 80, 2000), this.context.currentTime, clamp(duration, 0.05, 0.5), 0.18, 'notification', 'triangle');
  }

  playArrivalCue() {
    if (!this.canNotify() || !this.context) return;
    const now = this.context.currentTime;
    if (now - this.lastArrival < 0.8) return;
    this.lastArrival = now;
    this.note(659.25, now, 0.14, 0.2, 'notification');
    this.note(987.77, now + 0.13, 0.22, 0.16, 'notification');
  }

  private suspendContext(): Promise<void> {
    if (this.pendingSuspension) return this.pendingSuspension;
    if (!this.context || this.context.state !== 'running') return Promise.resolve();
    this.pendingSuspension = this.context.suspend()
      .catch(() => { /* Hidden tabs have no scheduled voices even if suspend is unavailable. */ })
      .finally(() => { this.pendingSuspension = null; });
    return this.pendingSuspension;
  }

  async setHidden(hidden: boolean) {
    const revision = ++this.visibilityRevision;
    this.hidden = hidden;
    if (hidden) {
      this.stopMusic();
      this.stopVoices();
      await this.suspendContext();
      return;
    }
    // Wait for a preceding hide to finish; otherwise its late suspend could silence
    // an already visible tab after the scheduler has restarted.
    if (this.pendingSuspension) await this.pendingSuspension;
    if (this.disposed || this.hidden || revision !== this.visibilityRevision) return;
    if (!(this.status.musicEnabled || this.status.notificationsEnabled)) return;
    const unlocked = await this.unlock();
    if (this.disposed || this.hidden || revision !== this.visibilityRevision) return;
    if (unlocked) {
      if (this.status.musicEnabled) this.startMusic();
    } else if (this.status.error) {
      this.status.musicEnabled = false;
      this.status.notificationsEnabled = false;
      this.publish();
    }
  }

  dispose() {
    this.disposed = true;
    this.musicRevision += 1;
    this.notificationRevision += 1;
    this.visibilityRevision += 1;
    this.stopMusic();
    this.stopVoices();
    this.master?.disconnect();
    if (this.context && this.context.state !== 'closed') void this.context.close().catch(() => {});
    this.context = null;
    this.master = null;
  }
}
