export const AUDIO_PREFERENCES_STORAGE_KEY = 'approve-please.audio.v1';

export interface AudioPreferences {
  musicEnabled: boolean;
  notificationsEnabled: boolean;
  volume: number;
}

export const defaultAudioPreferences: AudioPreferences = { musicEnabled: false, notificationsEnabled: false, volume: 0.25 };

export const readAudioPreferences = (storage: Pick<Storage, 'getItem'>): AudioPreferences => {
  const raw = storage.getItem(AUDIO_PREFERENCES_STORAGE_KEY);
  if (!raw) return defaultAudioPreferences;
  try {
    const value = JSON.parse(raw) as Partial<AudioPreferences>;
    if (typeof value.musicEnabled !== 'boolean' || typeof value.notificationsEnabled !== 'boolean' ||
      !Number.isFinite(value.volume) || (value.volume ?? -1) < 0 || (value.volume ?? 2) > 1) return defaultAudioPreferences;
    return value as AudioPreferences;
  } catch {
    return defaultAudioPreferences;
  }
};

export const writeAudioPreferences = (storage: Pick<Storage, 'setItem'>, value: AudioPreferences): void => {
  storage.setItem(AUDIO_PREFERENCES_STORAGE_KEY, JSON.stringify(value));
};
