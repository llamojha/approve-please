import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdaptiveAudio, tempoForMeters } from '../utils/adaptiveAudio';

class FakeParam {
  value = 0;
  setValueAtTime = vi.fn();
  exponentialRampToValueAtTime = vi.fn();
  setTargetAtTime = vi.fn();
}
class FakeGain {
  gain = new FakeParam();
  connect = vi.fn();
  disconnect = vi.fn();
}
class FakeOscillator {
  frequency = new FakeParam();
  type = 'sine';
  onended: (() => void) | null = null;
  connect = vi.fn();
  disconnect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}
class FakeContext {
  state = 'suspended';
  currentTime = 0;
  destination = {};
  oscillators: FakeOscillator[] = [];
  gains: FakeGain[] = [];
  resume = vi.fn(async () => { this.state = 'running'; });
  suspend = vi.fn(async () => { this.state = 'suspended'; });
  close = vi.fn(async () => { this.state = 'closed'; });
  createGain() { const gain = new FakeGain(); this.gains.push(gain); return gain; }
  createOscillator() { const oscillator = new FakeOscillator(); this.oscillators.push(oscillator); return oscillator; }
}
const makeEngine = () => {
  const context = new FakeContext();
  const factory = vi.fn(() => context as unknown as AudioContext);
  const engine = new AdaptiveAudio(factory);
  return { engine, context, factory };
};
afterEach(() => { vi.useRealTimers(); });

describe('adaptive tempo', () => {
  it('clamps tempo and reacts to whichever meter is weakest', () => {
    expect(tempoForMeters()).toBe(72);
    expect(tempoForMeters({ stability: 100, velocity: 100, satisfaction: 100 })).toBe(72);
    for (const meter of ['stability', 'velocity', 'satisfaction'] as const) {
      const values = [100, 75, 50, 25, 0].map(value => tempoForMeters({ stability: 100, velocity: 100, satisfaction: 100, [meter]: value }));
      expect(values).toEqual([72, 90, 108, 126, 144]);
    }
    expect(tempoForMeters({ stability: -50, velocity: 1000, satisfaction: 50 })).toBe(144);
    expect(tempoForMeters({ stability: NaN, velocity: Infinity, satisfaction: 100 })).toBe(72);
  });
});

describe('opt-in procedural audio', () => {
  it('does not create or play audio until an explicit channel toggle unlocks it', async () => {
    const { engine, context, factory } = makeEngine();
    engine.playCue();
    engine.playArrivalCue();
    engine.setMeters({ stability: 0, velocity: 80, satisfaction: 80 });
    expect(factory).not.toHaveBeenCalled();
    expect(engine.getStatus()).toMatchObject({ musicEnabled: false, notificationsEnabled: false, volume: 0.25, tempo: 144 });
    await engine.setNotificationsEnabled(true);
    expect(context.resume).toHaveBeenCalledTimes(1);
    expect(context.oscillators).toHaveLength(0);
    engine.playArrivalCue();
    expect(context.oscillators).toHaveLength(2);
    expect(context.oscillators.map(note => note.frequency.value)).toEqual([659.25, 987.77]);
    engine.dispose();
  });

  it('rate-limits arrivals and cancels notification voices immediately when muted', async () => {
    const { engine, context } = makeEngine();
    await engine.setNotificationsEnabled(true);
    engine.playArrivalCue();
    engine.playArrivalCue();
    context.currentTime = 0.5;
    engine.playArrivalCue();
    expect(context.oscillators).toHaveLength(2);
    context.currentTime = 0.9;
    engine.playArrivalCue();
    expect(context.oscillators).toHaveLength(4);
    await engine.setNotificationsEnabled(false);
    for (const note of context.oscillators) expect(note.disconnect).toHaveBeenCalled();
    engine.playArrivalCue();
    engine.playCue();
    expect(context.oscillators).toHaveLength(4);
    engine.dispose();
  });

  it('uses a bounded scheduler, preserves note pitch, and closes all resources', async () => {
    vi.useFakeTimers();
    const { engine, context } = makeEngine();
    await engine.setMusicEnabled(true);
    expect(vi.getTimerCount()).toBe(1);
    const initialNotes = context.oscillators.length;
    expect(initialNotes).toBeGreaterThan(0);
    // A delayed frame skips missed beats instead of producing a catch-up burst.
    context.currentTime = 600;
    vi.advanceTimersByTime(25);
    expect(context.oscillators.length - initialNotes).toBeLessThanOrEqual(6);
    engine.setMeters({ stability: 0, velocity: 100, satisfaction: 100 });
    expect(engine.getStatus().tempo).toBe(144);
    expect(context.gains[0].gain.value).toBe(0.25);
    expect(context.oscillators[0].frequency.value).toBe(261.62);
    await engine.setMusicEnabled(false);
    expect(vi.getTimerCount()).toBe(0);
    for (const note of context.oscillators) expect(note.disconnect).toHaveBeenCalled();
    engine.dispose();
    expect(context.close).toHaveBeenCalledTimes(1);
  });

  it('keeps music and notifications independent and clamps master volume', async () => {
    vi.useFakeTimers();
    const { engine, context } = makeEngine();
    await engine.setMusicEnabled(true);
    const count = context.oscillators.length;
    engine.playArrivalCue();
    expect(context.oscillators).toHaveLength(count);
    await engine.setNotificationsEnabled(true);
    engine.playCue(440, 0.1);
    expect(context.oscillators).toHaveLength(count + 1);
    await engine.setNotificationsEnabled(false);
    expect(engine.getStatus().musicEnabled).toBe(true);
    expect(vi.getTimerCount()).toBe(1);
    engine.setVolume(10);
    expect(engine.getStatus().volume).toBe(1);
    engine.setVolume(-1);
    expect(engine.getStatus().volume).toBe(0);
    expect(context.gains[0].gain.setTargetAtTime).toHaveBeenLastCalledWith(0, 0, 0.02);
    engine.dispose();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('suspends hidden tabs, suppresses cues, and resumes only previously enabled channels', async () => {
    vi.useFakeTimers();
    const { engine, context } = makeEngine();
    await engine.setMusicEnabled(true);
    await engine.setNotificationsEnabled(true);
    await engine.setHidden(true);
    expect(context.suspend).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    const count = context.oscillators.length;
    engine.playArrivalCue();
    expect(context.oscillators).toHaveLength(count);
    await engine.setHidden(false);
    expect(context.resume).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(1);
    engine.dispose();
    const idle = makeEngine();
    await idle.engine.setHidden(true);
    await idle.engine.setHidden(false);
    expect(idle.factory).not.toHaveBeenCalled();
    idle.engine.dispose();
  });

  it('waits for a delayed suspension before resuming a rapidly restored tab', async () => {
    vi.useFakeTimers();
    const { engine, context } = makeEngine();
    await engine.setMusicEnabled(true);
    let finishSuspend: () => void = () => {};
    context.suspend.mockImplementation(() => new Promise<void>(resolve => {
      finishSuspend = () => { context.state = 'suspended'; resolve(); };
    }));
    const hiding = engine.setHidden(true);
    const restoring = engine.setHidden(false);
    expect(context.resume).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    finishSuspend();
    await Promise.all([hiding, restoring]);
    expect(context.resume).toHaveBeenCalledTimes(2);
    expect(context.state).toBe('running');
    expect(vi.getTimerCount()).toBe(1);
    engine.dispose();
  });

  it('does not create or resume a context for toggles while hidden', async () => {
    vi.useFakeTimers();
    const { engine, context, factory } = makeEngine();
    await engine.setHidden(true);
    await engine.setMusicEnabled(true);
    await engine.setNotificationsEnabled(true);
    expect(engine.getStatus()).toMatchObject({ musicEnabled: true, notificationsEnabled: true });
    expect(factory).not.toHaveBeenCalled();
    expect(context.oscillators).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
    await engine.setHidden(false);
    expect(factory).toHaveBeenCalledTimes(1);
    expect(context.resume).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(1);
    engine.dispose();
  });

  it('does not let a stale foreground transition resume a tab that is hidden again', async () => {
    vi.useFakeTimers();
    const { engine, context } = makeEngine();
    await engine.setMusicEnabled(true);
    let finishSuspend: () => void = () => {};
    context.suspend.mockImplementation(() => new Promise<void>(resolve => {
      finishSuspend = () => { context.state = 'suspended'; resolve(); };
    }));
    const firstHide = engine.setHidden(true);
    const restore = engine.setHidden(false);
    const secondHide = engine.setHidden(true);
    finishSuspend();
    await Promise.all([firstHide, restore, secondHide]);
    expect(context.resume).toHaveBeenCalledTimes(1);
    expect(context.state).toBe('suspended');
    expect(vi.getTimerCount()).toBe(0);
    engine.dispose();
  });

  it('reports unsupported and failed-resume states without claiming audio is enabled', async () => {
    const unsupported = new AdaptiveAudio(null);
    await unsupported.setMusicEnabled(true);
    expect(unsupported.getStatus()).toMatchObject({ supported: false, musicEnabled: false });
    const { engine, context } = makeEngine();
    context.resume.mockRejectedValue(new Error('Gesture required'));
    await engine.setMusicEnabled(true);
    await engine.setNotificationsEnabled(true);
    expect(engine.getStatus()).toMatchObject({ musicEnabled: false, notificationsEnabled: false, error: 'audio-unavailable' });
    expect(context.oscillators).toHaveLength(0);
    engine.dispose();
  });

  it('does not re-enable a channel when a delayed unlock completes after mute', async () => {
    const { engine, context } = makeEngine();
    let finish: () => void = () => {};
    context.resume.mockImplementation(() => new Promise<void>(resolve => {
      finish = () => { context.state = 'running'; resolve(); };
    }));
    const enabling = engine.setMusicEnabled(true);
    await engine.setMusicEnabled(false);
    finish();
    await enabling;
    expect(engine.getStatus().musicEnabled).toBe(false);
    expect(context.oscillators).toHaveLength(0);
    engine.dispose();
  });
});
