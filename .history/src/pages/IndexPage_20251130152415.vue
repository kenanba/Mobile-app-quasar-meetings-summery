<template>
  <q-page class="q-pa-md flex flex-center column bg-dark text-white">
    <!-- Header Area (lokal in der Page, falls kein MainLayout genutzt wird) -->
    <div class="full-width q-mb-lg row items-center justify-between" style="max-width: 600px">
      <div class="text-h6 text-weight-bold">Quasar<span class="text-pink-3">Memo</span></div>
      <div>
        <q-btn flat round dense icon="settings" @click="showSettings = true" />
      </div>
    </div>

    <!-- State: Leer / Start -->
    <div v-if="!transcript && !summary && !isRecording" class="text-center q-pa-lg">
      <q-icon name="mic_none" size="80px" color="grey-8" />
      <div class="text-h5 q-mt-md text-grey-5">Bereit zur Aufnahme</div>
      <div class="text-caption text-grey-7">Tippe auf das Mikrofon, um zu starten</div>
    </div>

    <!-- Aufnahme & Transkript Bereich -->
    <div v-show="transcript || isRecording" class="full-width" style="max-width: 600px">
      <q-card class="bg-grey-10 q-mb-md" flat bordered>
        <q-card-section>
          <div class="text-subtitle2 text-grey-5 q-mb-sm">LIVE TRANSKRIPT</div>
          <div class="text-body1 typewriter" style="min-height: 100px; white-space: pre-wrap">
            {{ transcript }}<span v-if="isRecording" class="text-pink-3">_</span>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Zusammenfassung Ergebnis -->
    <div v-if="summary" class="full-width" style="max-width: 600px">
      <q-card class="bg-grey-9 q-mb-md" flat bordered>
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6 text-pink-3">
              <q-icon name="auto_awesome" class="q-mr-sm" />KI Zusammenfassung
            </div>
            <q-btn flat round icon="content_copy" size="sm" @click="copyToClipboard(summary)" />
          </div>
          <!-- Simple Markdown Renderer Output -->
          <div class="text-body1" v-html="simpleRenderMarkdown(summary)"></div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Sticky Bottom Controls -->
    <q-page-sticky position="bottom" :offset="[0, 30]">
      <div class="row q-gutter-md items-center">
        <!-- Record Button -->
        <q-btn
          round
          size="xl"
          :color="isRecording ? 'red-5' : 'pink-5'"
          :icon="isRecording ? 'stop' : 'mic'"
          :class="{ 'recording-pulse': isRecording }"
          @click="toggleRecording"
        />

        <!-- Summarize Button -->
        <transition
          appear
          enter-active-class="animated fadeInRight"
          leave-active-class="animated fadeOutRight"
        >
          <q-btn
            v-if="transcript.length > 10 && !isRecording"
            rounded
            color="white"
            text-color="black"
            icon="auto_awesome"
            label="Zusammenfassen"
            :loading="loading"
            @click="generateSummary"
          />
        </transition>

        <!-- Clear Button -->
        <transition
          appear
          enter-active-class="animated fadeInLeft"
          leave-active-class="animated fadeOutLeft"
        >
          <q-btn
            v-if="transcript.length > 0 && !isRecording"
            round
            flat
            color="grey-6"
            icon="refresh"
            @click="clearAll"
          >
            <q-tooltip>Neu starten</q-tooltip>
          </q-btn>
        </transition>
      </div>
    </q-page-sticky>

    <!-- Settings Dialog -->
    <q-dialog v-model="showSettings" persistent>
      <q-card class="bg-grey-9 text-white" style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Einstellungen</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <p class="text-caption text-grey-4">Gemini API Key eingeben (beginnt mit AIza...)</p>
          <q-input v-model="apiKey" filled dark label="API Key" type="password" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Speichern" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useQuasar, copyToClipboard as qCopy } from 'quasar';

const $q = useQuasar();

// State
const transcript = ref('');
const summary = ref('');
const isRecording = ref(false);
const loading = ref(false);
const showSettings = ref(false);
const apiKey = ref(localStorage.getItem('gemini_api_key') || '');

// Speech Recognition
let recognition = null;

onMounted(() => {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'de-DE';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        transcript.value += (transcript.value ? ' ' : '') + finalTranscript;
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech Error:', event.error);
      isRecording.value = false;
      $q.notify({
        color: 'negative',
        message: 'Fehler bei der Spracherkennung: ' + event.error,
      });
    };
  } else {
    $q.notify({
      color: 'negative',
      message: 'Browser unterstützt Web Speech API nicht.',
    });
  }
});

const toggleRecording = () => {
  if (!recognition) return;

  if (isRecording.value) {
    isRecording.value = false;
    recognition.stop();
  } else {
    isRecording.value = true;
    recognition.start();
    transcript.value = '';
    summary.value = '';
  }
};

const clearAll = () => {
  transcript.value = '';
  summary.value = '';
  isRecording.value = false;
};

// Einfacher Markdown Parser (kein npm install nötig)
const simpleRenderMarkdown = (text) => {
  if (!text) return '';
  // Ersetze **bold** durch <b>
  let html = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  // Ersetze * List Items durch <li> (sehr simpel)
  html = html.replace(/^\* (.*$)/gm, '<li>$1</li>');
  // Ersetze Newlines durch <br>
  html = html.replace(/\n/g, '<br>');
  return html;
};

const copyToClipboard = (text) => {
  qCopy(text)
    .then(() => {
      $q.notify({ color: 'green', message: 'Kopiert!', icon: 'check' });
    })
    .catch(() => {
      $q.notify({ color: 'negative', message: 'Fehler beim Kopieren' });
    });
};

const generateSummary = async () => {
  if (!apiKey.value) {
    showSettings.value = true;
    $q.notify({ color: 'warning', message: 'Bitte API Key eingeben.' });
    return;
  }

  localStorage.setItem('gemini_api_key', apiKey.value);
  loading.value = true;

  const prompt = `
Du bist ein professioneller Assistent. Fasse zusammen:
1. **Kernaussage**
2. **Details**
3. **Action Items**

Transkript: "${transcript.value}"
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.value}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    summary.value = data.candidates[0].content.parts[0].text;
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Fehler: ' + error.message,
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.typewriter {
  font-family: 'Roboto Mono', monospace;
}

/* Pulsating animation for recording */
@keyframes pulse-red {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.7);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(255, 82, 82, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 82, 82, 0);
  }
}
.recording-pulse {
  animation: pulse-red 2s infinite;
}
</style>
