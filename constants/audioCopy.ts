export const audioCopy = {
  en: {
    title: 'Afterhours radio', settings: 'Audio settings', button: 'Sound',
    description: 'A quiet instrumental pulse. The rhythm picks up as your lowest team meter falls.',
    music: 'Background music', notifications: 'PR notification sounds', volume: 'Volume',
    test: 'Try the PR chime', off: 'Audio is off until you enable a channel.',
    unavailable: 'Audio is not supported in this browser.', error: 'Audio could not start. Try enabling it again.',
    tempo: (bpm: number) => 'Current tempo: ' + bpm + ' BPM',
    arrival: (count: number) => count === 1 ? 'New PR in your queue' : count + ' new PRs in your queue'
  },
  es: {
    title: 'Radio Afterhours', settings: 'Ajustes de audio', button: 'Sonido',
    description: 'Una base instrumental suave. El ritmo se acelera cuando baja el indicador más débil del equipo.',
    music: 'Música de fondo', notifications: 'Sonidos de nuevas PR', volume: 'Volumen',
    test: 'Probar el aviso de PR', off: 'El audio está apagado hasta que actives una opción.',
    unavailable: 'Este navegador no admite audio.', error: 'No se pudo iniciar el audio. Prueba a activarlo de nuevo.',
    tempo: (bpm: number) => 'Ritmo actual: ' + bpm + ' BPM',
    arrival: (count: number) => count === 1 ? 'Nueva PR en tu bandeja' : count + ' nuevas PR en tu bandeja'
  }
};
