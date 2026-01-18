<template>
  <q-page class="q-pa-md flex flex-center column bg-dark text-white">
    <!-- Header Area -->
    <div class="full-width q-mb-lg row items-center justify-between" style="max-width: 600px">
      <div class="text-h6 text-weight-bold">Quasar<span class="text-pink-3">Memo</span></div>
      <div>
        <q-btn v-if="hasKey" flat round dense icon="settings" @click="openSettings" />
      </div>
    </div>

    <!-- State: Leer / Start -->
    <div
      v-if="
        !transcript &&
        !interimTranscript &&
        !summary &&
        !isRecording &&
        hasKey &&
        savedMemos.length === 0
      "
      class="text-center q-pa-lg"
    >
      <q-icon name="mic_none" size="80px" color="grey-8" />
      <div class="text-h5 q-mt-md text-grey-5">Bereit zur Aufnahme</div>
      <div class="text-caption text-grey-7">Tippe auf das Mikrofon (Audio-Modus)</div>
    </div>

    <!-- State: Warten auf Key -->
    <div v-if="!hasKey" class="text-center q-pa-lg">
      <q-icon name="lock" size="60px" color="grey-8" />
      <div class="text-h6 q-mt-md text-grey-5">Setup erforderlich</div>
      <div class="text-caption text-grey-7">Bitte API Key eingeben</div>
    </div>

    <!-- Aufnahme & Live-Vorschau Bereich -->
    <div
      v-show="(transcript || interimTranscript || isRecording) && hasKey"
      class="full-width"
      style="max-width: 600px"
    >
      <q-card class="bg-grey-10 q-mb-md" flat bordered>
        <q-card-section>
          <div class="row justify-between items-center q-mb-sm">
            <div class="text-subtitle2 text-grey-5">LIVE VORSCHAU (Ungenaue Voransicht)</div>
            <q-badge v-if="isRecording" color="red" label="REC" class="animate-blink" />
          </div>
          <div
            class="text-body1 typewriter text-grey-6"
            style="min-height: 60px; white-space: pre-wrap; font-style: italic"
          >
            <!-- Wir zeigen hier nur die WebSpeech API Ergebnisse als "Platzhalter" an -->
            <span>{{ transcript }}</span>
            <span class="text-grey-8">{{ interimTranscript }}</span>
            <span v-if="isRecording" class="text-pink-3">_</span>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Zusammenfassung & Finales Transkript -->
    <div v-if="summary && hasKey" class="full-width" style="max-width: 600px">
      <q-card class="bg-grey-9 q-mb-md" flat bordered>
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6 text-pink-3">
              <q-icon name="auto_awesome" class="q-mr-sm" />KI Ergebnis
            </div>
            <div class="row q-gutter-sm">
              <q-btn flat round icon="save" color="primary" @click="saveMemo(true)">
                <q-tooltip>Manuell Speichern</q-tooltip>
              </q-btn>
              <q-btn flat round icon="content_copy" size="sm" @click="copyToClipboard(summary)" />
            </div>
          </div>

          <!-- Zusammenfassung -->
          <div class="text-body1 q-mb-md" v-html="simpleRenderMarkdown(summary)"></div>

          <q-separator dark />

          <!-- Perfektes Transkript von Gemini -->
          <q-expansion-item
            dense
            dense-toggle
            expand-separator
            icon="graphic_eq"
            label="Perfektes Transkript anzeigen"
            header-class="text-grey-5 text-caption"
          >
            <div class="q-pa-sm text-body2 text-grey-4">
              {{ finalGeminiTranscript }}
            </div>
          </q-expansion-item>
        </q-card-section>
      </q-card>
    </div>

    <!-- Controls -->
    <div v-if="hasKey" class="row q-gutter-md items-center justify-center q-mb-xl">
      <q-btn
        round
        size="xl"
        :color="isRecording ? 'red-5' : 'pink-5'"
        :icon="isRecording ? 'stop' : 'mic'"
        :class="{ 'recording-pulse': isRecording }"
        :disable="loading"
        @click="toggleRecording"
      />

      <!-- Button zum manuellen Auslösen, falls man Pause gemacht hat -->
      <transition
        appear
        enter-active-class="animated fadeInRight"
        leave-active-class="animated fadeOutRight"
      >
        <q-btn
          v-if="audioChunks.length > 0 && !isRecording"
          rounded
          color="white"
          text-color="black"
          icon="auto_awesome"
          label="Verarbeiten"
          :loading="loading"
          @click="processAudioWithGemini"
        />
      </transition>

      <transition
        appear
        enter-active-class="animated fadeInLeft"
        leave-active-class="animated fadeOutLeft"
      >
        <q-btn
          v-if="(transcript.length > 0 || audioChunks.length > 0) && !isRecording"
          round
          flat
          color="grey-6"
          icon="refresh"
          :disable="loading"
          @click="clearAll"
        >
          <q-tooltip>Neu starten</q-tooltip>
        </q-btn>
      </transition>
    </div>

    <!-- Historie -->
    <div v-if="hasKey && savedMemos.length > 0" class="full-width q-mt-lg" style="max-width: 600px">
      <div class="text-h6 q-mb-md text-grey-4">Historie</div>
      <q-list dark bordered separator class="rounded-borders">
        <q-expansion-item
          v-for="(memos, date) in groupedMemos"
          :key="date"
          icon="folder"
          :label="formatDateLabel(date)"
          header-class="text-pink-3 bg-grey-10"
          expand-separator
          dark
        >
          <div class="bg-dark q-pa-sm">
            <q-card v-for="memo in memos" :key="memo.id" class="bg-grey-9 q-mb-sm" flat>
              <q-card-section>
                <div class="row justify-between items-center no-wrap">
                  <div class="text-caption text-grey-5">{{ memo.time }} Uhr</div>
                  <q-btn
                    flat
                    round
                    size="sm"
                    icon="delete"
                    color="red-4"
                    @click="deleteMemo(memo.id)"
                  />
                </div>
                <div class="text-body2 ellipsis-2-lines text-grey-3 q-mt-xs">
                  {{ memo.rawSummary.substring(0, 100) }}...
                </div>
              </q-card-section>
              <q-card-section v-if="memo.showDetails" class="q-pt-none">
                <div class="text-body2" v-html="simpleRenderMarkdown(memo.rawSummary)"></div>
                <q-separator dark class="q-my-sm" />
                <div class="text-caption text-grey-5">Transkript (Gemini):</div>
                <div class="text-caption text-grey-6">{{ memo.transcript }}</div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn
                  flat
                  size="sm"
                  :label="memo.showDetails ? 'Weniger' : 'Anzeigen'"
                  @click="memo.showDetails = !memo.showDetails"
                />
              </q-card-actions>
            </q-card>
          </div>
        </q-expansion-item>
      </q-list>
    </div>

    <!-- Settings Dialog -->
    <q-dialog v-model="showSettings" persistent>
      <q-card class="bg-grey-9 text-white" style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Einstellungen</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <p class="text-caption text-grey-4">Benötigt Google Gemini API Key.</p>
          <q-input v-model="apiKeyInput" filled dark label="Gemini API Key" type="password" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Speichern" color="primary" @click="saveKey" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useQuasar, copyToClipboard as qCopy } from 'quasar';

interface MemoEntry {
  id: number;
  date: string;
  time: string;
  transcript: string;
  rawSummary: string;
  showDetails?: boolean;
}

// Typen für Web Speech API (nur noch für visuelles Feedback)
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [key: number]: {
      isFinal: boolean;
      [key: number]: { transcript: string };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface WindowWithSpeech extends Window {
  SpeechRecognition: new () => SpeechRecognition;
  webkitSpeechRecognition: new () => SpeechRecognition;
}

export default defineComponent({
  name: 'IndexPage',
  setup() {
    const $q = useQuasar();

    // UI State
    const transcript = ref<string>(''); // Nur visuell (Web Speech)
    const interimTranscript = ref<string>(''); // Nur visuell
    const finalGeminiTranscript = ref<string>(''); // Das echte, gute Transkript
    const summary = ref<string>('');
    const isRecording = ref<boolean>(false);
    const loading = ref<boolean>(false);

    // Data State
    const savedMemos = ref<MemoEntry[]>([]);
    const audioChunks = ref<Blob[]>([]); // Hier speichern wir das echte Audio

    // Settings
    const showSettings = ref<boolean>(false);
    const apiKeyInput = ref<string>('');
    const hasKey = ref<boolean>(false);
    let storedApiKey = '';

    // Recorder Instanzen
    let speechRecognition: SpeechRecognition | null = null;
    let mediaRecorder: MediaRecorder | null = null;
    let audioStream: MediaStream | null = null;

    onMounted(() => {
      // Load History
      const loaded = localStorage.getItem('quasar_memo_history');
      if (loaded) {
        try {
          const parsed = JSON.parse(loaded);
          if (Array.isArray(parsed)) savedMemos.value = parsed;
        } catch {
          savedMemos.value = [];
        }
      }

      // Load Key
      const key = localStorage.getItem('gemini_api_key');
      if (key) {
        storedApiKey = key;
        apiKeyInput.value = key;
        hasKey.value = true;
      } else {
        hasKey.value = false;
        showSettings.value = true;
      }

      // Init Web Speech (nur für Visualisierung!)
      const win = window as unknown as WindowWithSpeech;
      if ('webkitSpeechRecognition' in win || 'SpeechRecognition' in win) {
        const SpeechRecognitionCtx = win.SpeechRecognition || win.webkitSpeechRecognition;
        speechRecognition = new SpeechRecognitionCtx();
        if (speechRecognition) {
          speechRecognition.continuous = true;
          speechRecognition.interimResults = true;
          speechRecognition.lang = 'de-DE';

          // Fix ESLint: explicit any replaced with proper types
          speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
            let inter = '';
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) final += event.results[i][0].transcript;
              else inter += event.results[i][0].transcript;
            }
            // Wir hängen es nur für den visuellen Effekt an, nutzen es aber nicht für die KI
            if (final) transcript.value += ' ' + final;
            interimTranscript.value = inter;
          };

          // Fix ESLint: explicit any replaced with proper types
          speechRecognition.onerror = (/* event */) => {
            // Ignore errors for visualization
          };

          // Auto-Restart für den Visualizer
          speechRecognition.onend = () => {
            if (isRecording.value && speechRecognition) {
              try {
                speechRecognition.start();
              } catch {
                // Fix ESLint no-empty: ignore error
              }
            }
          };
        }
      }
    });

    watch(
      savedMemos,
      (newVal) => {
        localStorage.setItem('quasar_memo_history', JSON.stringify(newVal));
      },
      { deep: true },
    );

    // --- LOGIC: AUDIO RECORDING ---

    const startAudioRecording = async () => {
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(audioStream);
        audioChunks.value = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.value.push(event.data);
          }
        };

        mediaRecorder.start();
        return true;
      } catch (err) {
        console.error('Mic Error', err);
        $q.notify({ color: 'negative', message: 'Mikrofon-Zugriff fehlgeschlagen.' });
        return false;
      }
    };

    const stopAudioRecording = () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
    };

    const toggleRecording = async () => {
      if (isRecording.value) {
        // STOP
        isRecording.value = false;
        stopAudioRecording();
        if (speechRecognition) speechRecognition.stop();
        interimTranscript.value = '';

        // Automatisch verarbeiten nach Stop?
        // Granola-Style: Ja.
        // Wir warten kurz, bis der Recorder die Daten finalisiert hat
        setTimeout(() => {
          // Fix ESLint no-floating-promises: use void operator
          void processAudioWithGemini();
        }, 500);
      } else {
        // START
        const success = await startAudioRecording();
        if (success) {
          isRecording.value = true;
          transcript.value = ''; // Reset Visualizer
          summary.value = '';
          finalGeminiTranscript.value = '';
          audioChunks.value = []; // Reset Audio

          if (speechRecognition) {
            try {
              speechRecognition.start();
            } catch {
              // Fix ESLint no-empty: ignore error
            }
          }
        }
      }
    };

    // --- LOGIC: GEMINI AUDIO PROCESSING ---

    const blobToBase64 = (blob: Blob): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          // TS Fix: Ensure string before splitting and handle undefined result
          if (base64data) {
            const base64Content = base64data.split(',')[1];
            if (base64Content) {
              resolve(base64Content);
            } else {
              reject(new Error('Invalid base64 data'));
            }
          } else {
            reject(new Error('Empty reader result'));
          }
        };
        reader.onerror = reject;
      });
    };

    const processAudioWithGemini = async () => {
      if (!storedApiKey) {
        showSettings.value = true;
        return;
      }
      if (audioChunks.value.length === 0) {
        $q.notify({ color: 'warning', message: 'Keine Audio-Daten vorhanden.' });
        return;
      }

      loading.value = true;

      try {
        // 1. Audio Blob erstellen
        const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' }); // Android Chrome nutzt oft webm
        const base64Audio = await blobToBase64(audioBlob);

        // 2. Prompt für Gemini
        // Wir bitten Gemini, erst zu transkribieren, dann zusammenzufassen.
        // JSON Schema wäre sauberer, aber Prompting reicht meist.
        const promptText = `
Hör dir diese Audiodatei an.
Aufgabe 1: Erstelle ein exaktes Transkript (Wort für Wort) auf Deutsch.
Aufgabe 2: Erstelle eine strukturierte Zusammenfassung.

Antworte bitte GENAU in diesem Format (kein Markdown für die Trenner):
---TRANSKRIPT---
[Hier das Transkript einfügen]
---ZUSAMMENFASSUNG---
1. **Kernaussage**: ...
2. **Details**: ...
3. **Action Items**: ...
            `;

        // 3. Request
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${storedApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: promptText },
                    {
                      inlineData: {
                        mimeType: 'audio/webm', // Oder audio/mp3, audio/wav. webm ist browser standard.
                        data: base64Audio,
                      },
                    },
                  ],
                },
              ],
            }),
          },
        );

        const data = await response.json();

        if (data.error) throw new Error(data.error.message);

        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // 4. Parsen
        const parts = rawText.split('---ZUSAMMENFASSUNG---');
        let trans = '';
        let sum = '';

        if (parts.length > 1) {
          trans = parts[0].replace('---TRANSKRIPT---', '').trim();
          sum = parts[1].trim();
        } else {
          // Fallback falls Formatierung scheitert
          sum = rawText;
          trans = '(Transkript konnte nicht sauber getrennt werden)';
        }

        finalGeminiTranscript.value = trans;
        summary.value = sum;

        // Auto Save
        saveMemo(false);
      } catch (e) {
        console.error(e);
        $q.notify({
          color: 'negative',
          message: 'Fehler bei der Audio-Verarbeitung: ' + (e as Error).message,
        });
      } finally {
        loading.value = false;
      }
    };

    // --- UTILS ---

    const saveMemo = (manual = false) => {
      if (!summary.value) return;

      const now = new Date();
      const dateString = now.toISOString().split('T')[0] as string;

      const newEntry: MemoEntry = {
        id: Date.now(),
        date: dateString,
        time: now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        transcript: finalGeminiTranscript.value, // Wir speichern jetzt das GUTE Transkript
        rawSummary: summary.value,
        showDetails: false,
      };
      savedMemos.value.unshift(newEntry);

      if (manual) $q.notify({ color: 'green', icon: 'save', message: 'Gespeichert' });
      else $q.notify({ color: 'green', icon: 'check', message: 'Fertig!' });
    };

    // ... (Restliche Funktionen: deleteMemo, etc. bleiben gleich)
    const groupedMemos = computed(() => {
      const groups: Record<string, MemoEntry[]> = {};
      const sorted = [...savedMemos.value].sort((a, b) => b.id - a.id);
      sorted.forEach((memo) => {
        if (!groups[memo.date]) groups[memo.date] = [];
        const grp = groups[memo.date];
        if (grp) grp.push(memo);
      });
      return Object.keys(groups)
        .sort()
        .reverse()
        .reduce(
          (acc, date) => {
            const grp = groups[date];
            if (grp) acc[date] = grp;
            return acc;
          },
          {} as Record<string, MemoEntry[]>,
        );
    });

    const openSettings = () => {
      apiKeyInput.value = storedApiKey;
      showSettings.value = true;
    };
    const saveKey = () => {
      if (!apiKeyInput.value) return;
      storedApiKey = apiKeyInput.value;
      localStorage.setItem('gemini_api_key', storedApiKey);
      hasKey.value = true;
      showSettings.value = false;
    };
    const deleteMemo = (id: number) => {
      savedMemos.value = savedMemos.value.filter((m) => m.id !== id);
    };
    const formatDateLabel = (iso: string) => {
      if (!iso) return 'Unbekannt';
      const [y, m, d] = iso.split('-');
      return `${d}.${m}.${y}`;
    };
    const simpleRenderMarkdown = (t: string) => {
      if (!t) return '';
      let h = t.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
      h = h.replace(/^\* (.*$)/gm, '<li>$1</li>');
      return h.replace(/\n/g, '<br>');
    };
    const copyToClipboard = (t: string) => {
      // Fix ESLint no-floating-promises
      qCopy(t)
        .then(() => $q.notify({ color: 'green', message: 'Kopiert' }))
        .catch(() => $q.notify({ color: 'negative', message: 'Fehler beim Kopieren' }));
    };
    const clearAll = () => {
      transcript.value = '';
      interimTranscript.value = '';
      summary.value = '';
      finalGeminiTranscript.value = '';
      audioChunks.value = [];
    };
    // Dummy für den Template-Aufruf
    const generateSummary = () => {};

    return {
      transcript,
      interimTranscript,
      finalGeminiTranscript,
      summary,
      isRecording,
      loading,
      showSettings,
      apiKeyInput,
      hasKey,
      savedMemos,
      groupedMemos,
      audioChunks,
      openSettings,
      saveKey,
      toggleRecording,
      clearAll,
      simpleRenderMarkdown,
      copyToClipboard,
      generateSummary,
      saveMemo,
      deleteMemo,
      formatDateLabel,
      processAudioWithGemini,
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
.animate-blink {
  animation: blink 1s infinite;
}
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
