<template>
  <q-page class="q-pa-md flex flex-center column bg-dark text-white">
    <!-- Header Area -->
    <div class="full-width q-mb-lg row items-center justify-between" style="max-width: 600px">
      <div class="text-h6 text-weight-bold">Quasar<span class="text-pink-3">Memo</span></div>
      <div>
        <!-- Einstellungen Button nur sichtbar wenn Key da ist -->
        <q-btn v-if="hasKey" flat round dense icon="settings" @click="openSettings" />
      </div>
    </div>

    <!-- State: Leer / Start -->
    <div v-if="!transcript && !summary && !isRecording && hasKey" class="text-center q-pa-lg">
      <q-icon name="mic_none" size="80px" color="grey-8" />
      <div class="text-h5 q-mt-md text-grey-5">Bereit zur Aufnahme</div>
      <div class="text-caption text-grey-7">Tippe auf das Mikrofon, um zu starten</div>
    </div>

    <!-- State: Warten auf Key -->
    <div v-if="!hasKey" class="text-center q-pa-lg">
      <q-icon name="lock" size="60px" color="grey-8" />
      <div class="text-h6 q-mt-md text-grey-5">Setup erforderlich</div>
      <div class="text-caption text-grey-7">Bitte API Key eingeben</div>
    </div>

    <!-- Aufnahme & Transkript Bereich -->
    <div v-show="(transcript || isRecording) && hasKey" class="full-width" style="max-width: 600px">
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
    <div v-if="summary && hasKey" class="full-width" style="max-width: 600px">
      <q-card class="bg-grey-9 q-mb-md" flat bordered>
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6 text-pink-3">
              <q-icon name="auto_awesome" class="q-mr-sm" />KI Zusammenfassung
            </div>
            <q-btn flat round icon="content_copy" size="sm" @click="copyToClipboard(summary)" />
          </div>
          <div class="text-body1" v-html="simpleRenderMarkdown(summary)"></div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Sticky Bottom Controls -->
    <q-page-sticky v-if="hasKey" position="bottom" :offset="[0, 30]">
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

    <!-- Settings / Welcome Dialog -->
    <q-dialog v-model="showSettings" persistent>
      <q-card class="bg-grey-9 text-white" style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ hasKey ? 'Einstellungen' : 'Willkommen' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <p class="text-caption text-grey-4">
            {{
              hasKey
                ? 'API Key ändern:'
                : 'Um zu starten, benötigst du einen Google Gemini API Key.'
            }}
          </p>
          <q-input
            v-model="apiKeyInput"
            filled
            dark
            label="Gemini API Key"
            type="password"
            hint="Beginnt mit AIza..."
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Speichern & Starten" color="primary" @click="saveKey" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script type="ts" lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useQuasar, copyToClipboard as qCopy } from 'quasar';

export default defineComponent({
  name: 'IndexPage',
  setup() {
    const $q = useQuasar();

    // State Vars
    const transcript = ref('');
    const summary = ref('');
    const isRecording = ref(false);
    const loading = ref(false);

    // Auth / Settings State
    const showSettings = ref(false);
    const apiKeyInput = ref('');
    const hasKey = ref(false);

    // Interne Variable für den echten Key
    let storedApiKey = '';

    // Speech Recognition Instance
    let recognition = null;

    onMounted(() => {
      // 1. Check for API Key
      const key = localStorage.getItem('gemini_api_key');
      if (key) {
        storedApiKey = key;
        apiKeyInput.value = key;
        hasKey.value = true;
      } else {
        hasKey.value = false;
        showSettings.value = true; // Zwinge Dialog auf
      }

      // 2. Init Speech Recognition
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

    // Actions
    const openSettings = () => {
      apiKeyInput.value = storedApiKey;
      showSettings.value = true;
    };

    const saveKey = () => {
      if (!apiKeyInput.value || apiKeyInput.value.length < 10) {
        $q.notify({ color: 'warning', message: 'Bitte einen gültigen Key eingeben.' });
        return;
      }
      storedApiKey = apiKeyInput.value;
      localStorage.setItem('gemini_api_key', storedApiKey);
      hasKey.value = true;
      showSettings.value = false;
      $q.notify({ color: 'green', message: 'Key gespeichert!' });
    };

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

    const simpleRenderMarkdown = (text) => {
      if (!text) return '';
      let html = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
      html = html.replace(/^\* (.*$)/gm, '<li>$1</li>');
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
      if (!storedApiKey) {
        showSettings.value = true;
        return;
      }

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
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${storedApiKey}`,
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

    // Explicit return for template usage
    return {
      transcript,
      summary,
      isRecording,
      loading,
      showSettings,
      apiKeyInput,
      hasKey,
      openSettings,
      saveKey,
      toggleRecording,
      clearAll,
      simpleRenderMarkdown,
      copyToClipboard,
      generateSummary,
    };
  },
});
</script>

<style scoped>
.typewriter {
  font-family: 'Roboto Mono', monospace;
}

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
