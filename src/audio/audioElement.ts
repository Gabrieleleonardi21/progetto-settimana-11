// ============================================
// ELEMENTO AUDIO — istanza unica per tutta l'app
//
// Vive fuori da React e fuori da Redux: un HTMLAudioElement non è
// serializzabile e non deve essere ricreato a ogni render.
// Nella SPA questa istanza sopravvive ai cambi di rotta, quindi la musica
// non si interrompe navigando — a differenza della versione MPA.
//
// Redux resta la fonte di verità dello *stato* (brano, coda, isPlaying…);
// qui c'è solo il motore che lo esegue. Vedi store/playerThunks.ts.
// ============================================

export const audio = new Audio()
audio.preload = 'none'
