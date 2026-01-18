<script setup lang="ts">
import { ref } from 'vue';

const transcript = ref('');
const interimTranscript = ref('');
const listening = ref(false);

let recognition: SpeechRecognition | null = null;
let lastFinalSentence = '';

// Wörter die NICHT erkannt / aufgenommen werden sollen
const blockedWords = [
  'äh',
  'ähm',
  'hm',
  'hmm',
  'okay',
  'weisst du',
  'weißt du',
  'sozusagen',
  'irgendwie',
];

// Funktion: blockierte Wörter entfernen
function filterBlockedWords(text: string) {
  let cleaned = text.toLowerCase();

  blockedWords.forEach((word) => {
    const pattern = new RegExp('\\b' + word + '\\b', 'gi');
    cleaned = cleaned.replace(pattern, '');
  });

  // doppelte Leerzeichen vermeiden
  return cleaned.replace(/\s+/g, ' ').trim();
}

// Initialisierung
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = 'de-DE';
  recognition.interimResults = true;
  recognition.continuous = true;
}

// Start
function startListening() {
  transcript.value = '';
  interimTranscript.value = '';
  listening.value = true;
  recognition?.start();
}

// Stop
function stopListening() {
  listening.value = false;
  recognition?.stop();
}

if (recognition) {
  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let finalChunk = '';
    let interimChunk = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const res = event.results[i];
      if (!res) continue;

      const text = res[0]?.transcript || '';

      if (res.isFinal) finalChunk += text;
      else interimChunk += text;
    }

    // --- Zwischen-Text filtern
    interimChunk = filterBlockedWords(interimChunk);

    if (finalChunk) {
      // --- Finale Worte filtern
      const cleanFinal = filterBlockedWords(finalChunk);
      const cleanTranscript = transcript.value.trim();

      // 1) Keine Wiederholung (exakt)
      if (cleanFinal === lastFinalSentence) {
        interimTranscript.value = '';
        return;
      }

      // 2) Keine Wiederholung (Segment)
      const lastPart = cleanTranscript.slice(-cleanFinal.length - 5).trim();

      if (lastPart === cleanFinal) {
        interimTranscript.value = '';
        return;
      }

      // 3) Speichern, um Wiederholungen zu verhindern
      lastFinalSentence = cleanFinal;

      // 4) Anhängen
      if (cleanFinal.length > 0) {
        transcript.value += (cleanTranscript ? ' ' : '') + cleanFinal;
      }

      interimTranscript.value = '';
    } else {
      interimTranscript.value = interimChunk;
    }
  };
}
</script>

<template>
  <div style="padding: 20px; font-family: sans-serif">
    <h2>🎤 Speech to Text (ohne Wiederholungen + Wortfilter)</h2>

    <button
      @click="listening ? stopListening() : startListening()"
      style="padding: 10px 20px; margin-bottom: 20px; cursor: pointer"
    >
      {{ listening ? 'Stop' : 'Start' }}
    </button>

    <h3>Final:</h3>
    <div style="background: #eee; padding: 10px; min-height: 80px">
      {{ transcript }}
    </div>

    <h3>Live:</h3>
    <div style="background: #ddd; padding: 10px; min-height: 40px">
      {{ interimTranscript }}
    </div>
  </div>
</template>
