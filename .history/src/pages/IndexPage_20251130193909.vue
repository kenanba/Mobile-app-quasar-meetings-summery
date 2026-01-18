<template>
  <q-page class="q-pa-md">
    <div style="padding: 20px; font-family: sans-serif">
      <h2>🎤 Speech to Text (Anti-Repeat + Wortfilter)</h2>

      <q-btn
        @click="listening ? stopListening() : startListening()"
        color="primary"
        label="Start / Stop"
        class="q-mb-md"
      />

      <h3>Final:</h3>
      <div style="background: #eee; padding: 10px; min-height: 80px">
        {{ transcript }}
      </div>

      <h3>Live:</h3>
      <div style="background: #ddd; padding: 10px; min-height: 40px">
        {{ interimTranscript }}
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
// speech-recognition.d.ts
interface SpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly [index: number]: { transcript: string };
}

interface SpeechRecognitionResultList {
  readonly length: number;
  readonly [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message?: string;
}

interface Window {
  webkitSpeechRecognition?: { new (): SpeechRecognition };
  SpeechRecognition?: { new (): SpeechRecognition };
}
import { ref } from 'vue';

const transcript = ref('');
const interimTranscript = ref('');
const listening = ref(false);

let recognition: SpeechRecognition | null = null;
let lastFinalSentence = '';

// Wörter, die nicht aufgenommen werden
const blockedWords = ['äh', 'ähm', 'hm', 'hmm', 'okay', 'weisst du'];

function filterBlockedWords(text: string) {
  let cleaned = text.toLowerCase();
  blockedWords.forEach((word) => {
    const pattern = new RegExp('\\b' + word + '\\b', 'gi');
    cleaned = cleaned.replace(pattern, '');
  });
  return cleaned.replace(/\s+/g, ' ').trim();
}

// SpeechRecognition initialisieren
const win = window as Window;

if ('webkitSpeechRecognition' in win || 'SpeechRecognition' in win) {
  const SR = win.SpeechRecognition || win.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = 'de-DE';
  recognition.interimResults = true;
  recognition.continuous = true;
}

// Start / Stop
function startListening() {
  transcript.value = '';
  interimTranscript.value = '';
  listening.value = true;
  recognition?.start();
}

function stopListening() {
  listening.value = false;
  recognition?.stop();
}

// Anti-Duplikat + Wortfilter
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

    interimChunk = filterBlockedWords(interimChunk);

    if (finalChunk) {
      const cleanFinal = filterBlockedWords(finalChunk);
      const cleanTranscript = transcript.value.trim();

      if (cleanFinal === lastFinalSentence) {
        interimTranscript.value = '';
        return;
      }

      const lastPart = cleanTranscript.slice(-cleanFinal.length - 5).trim();

      if (lastPart === cleanFinal) {
        interimTranscript.value = '';
        return;
      }

      lastFinalSentence = cleanFinal;

      if (cleanFinal.length > 0) {
        transcript.value += (cleanTranscript ? ' ' : '') + cleanFinal;
      }

      interimTranscript.value = '';
    } else {
      interimTranscript.value = interimChunk;
    }
  };

  recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
    console.error('SpeechRecognition error:', e.error, e.message);
  };
}
</script>
