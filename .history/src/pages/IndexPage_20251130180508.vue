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
      <div class="text-caption text-grey-7">Tippe auf das Mikrofon, um zu starten</div>
    </div>

    <!-- State: Warten auf Key -->
    <div v-if="!hasKey" class="text-center q-pa-lg">
      <q-icon name="lock" size="60px" color="grey-8" />
      <div class="text-h6 q-mt-md text-grey-5">Setup erforderlich</div>
      <div class="text-caption text-grey-7">Bitte API Key eingeben</div>
    </div>

    <!-- Aufnahme & Transkript Bereich -->
    <div
      v-show="(transcript || interimTranscript || isRecording) && hasKey"
      class="full-width"
      style="max-width: 600px"
    >
      <q-card class="bg-grey-10 q-mb-md" flat bordered>
        <q-card-section>
          <div class="text-subtitle2 text-grey-5 q-mb-sm">LIVE TRANSKRIPT</div>
          <div class="text-body1 typewriter" style="min-height: 100px; white-space: pre-wrap">
            <span>{{ transcript }}</span>
            <span class="text-grey-6">{{ interimTranscript }}</span>
            <span v-if="isRecording" class="text-pink-3 animate-cursor">_</span>
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
            <div class="row q-gutter-sm">
              <!-- Save Button (Optional now, since auto-save) -->
              <q-btn flat round icon="save" color="primary" @click="saveMemo(true)">
                <q-tooltip>Manuell Speichern</q-tooltip>
              </q-btn>
              <!-- Copy Button -->
              <q-btn flat round icon="content_copy" size="sm" @click="copyToClipboard(summary)" />
            </div>
          </div>
          <div class="text-body1" v-html="simpleRenderMarkdown(summary)"></div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Controls -->
    <div v-if="hasKey" class="row q-gutter-md items-center justify-center q-mb-xl">
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

    <!-- Historie / Saved Memos (Folder Structure) -->
    <div v-if="hasKey && savedMemos.length > 0" class="full-width q-mt-lg" style="max-width: 600px">
      <div class="text-h6 q-mb-md text-grey-4">Historie</div>

      <q-list dark bordered separator class="rounded-borders">
        <!-- Loop over grouped dates (Folders) -->
        <q-expansion-item
          v-for="(memos, date) in groupedMemos"
          :key="date"
          icon="folder"
          :label="formatDateLabel(date)"
          header-class="text-pink-3 bg-grey-10"
          expand-separator
          dark
        >
          <!-- Items inside the folder -->
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
                <div class="text-caption text-grey-5">Transkript:</div>
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

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useQuasar, copyToClipboard as qCopy } from 'quasar';

// --- Typ-Definitionen für Memos ---
interface MemoEntry {
  id: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  transcript: string;
  rawSummary: string;
  showDetails?: boolean; // Für UI toggle
}

// --- Typ-Definitionen für Web Speech API ---
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

// Window Erweiterung
interface WindowWithSpeech extends Window {
  SpeechRecognition: new () => SpeechRecognition;
  webkitSpeechRecognition: new () => SpeechRecognition;
}
// ---------------------------------------------------------------------------

export default defineComponent({
  name: 'IndexPage',
  setup() {
    const $q = useQuasar();

    // State Vars
    const transcript = ref<string>('');
    const interimTranscript = ref<string>('');
    const summary = ref<string>('');
    const isRecording = ref<boolean>(false);
    const loading = ref<boolean>(false);

    // Saved Memos
    const savedMemos = ref<MemoEntry[]>([]);

    // Auth / Settings State
    const showSettings = ref<boolean>(false);
    const apiKeyInput = ref<string>('');
    const hasKey = ref<boolean>(false);

    // Interne Variable für den echten Key
    let storedApiKey = '';

    // Speech Recognition Instance
    let recognition: SpeechRecognition | null = null;

    // Load Memos & Init
    onMounted(() => {
      // 0. Load Memos safely
      const loaded = localStorage.getItem('quasar_memo_history');
      if (loaded) {
        try {
          const parsed = JSON.parse(loaded);
          if (Array.isArray(parsed)) {
            savedMemos.value = parsed;
          }
        } catch (e) {
          console.error('Fehler beim Laden der Historie', e);
          // Bei Fehler resetten, um Probleme zu vermeiden
          savedMemos.value = [];
        }
      }

      // 1. Check for API Key
      const key = localStorage.getItem('gemini_api_key');
      if (key) {
        storedApiKey = key;
        apiKeyInput.value = key;
        hasKey.value = true;
      } else {
        hasKey.value = false;
        showSettings.value = true;
      }

      // 2. Init Speech Recognition
      const win = window as unknown as WindowWithSpeech;

      if ('webkitSpeechRecognition' in win || 'SpeechRecognition' in win) {
        const SpeechRecognitionCtx = win.SpeechRecognition || win.webkitSpeechRecognition;
        recognition = new SpeechRecognitionCtx();
        recognition.continuous = true;
        recognition.interimResults = true; // Wichtig für Echtzeit
        recognition.lang = 'de-DE';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let finalChunk = '';
          let interimChunk = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const res = event.results[i];
            if (!res) continue;
            const text = res[0] ? res[0].transcript : '';

            if (res.isFinal) {
              finalChunk += text;
            } else {
              interimChunk += text;
            }
          }

          if (finalChunk) {
            transcript.value += (transcript.value ? ' ' : '') + finalChunk;
            interimTranscript.value = '';
          } else {
            interimTranscript.value = interimChunk;
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech Error:', event.error);
          if (event.error !== 'no-speech') {
            isRecording.value = false;
            $q.notify({
              color: 'negative',
              message: 'Sprach-Fehler: ' + event.error,
            });
          }
        };

        recognition.onend = () => {
          if (isRecording.value && recognition) {
            try {
              recognition.start();
            } catch {
              // Ignore
            }
          }
        };
      } else {
        $q.notify({
          color: 'negative',
          message: 'Browser unterstützt Web Speech API nicht.',
        });
      }
    });

    // Watcher: Speichert Änderungen an savedMemos automatisch in LocalStorage
    watch(
      savedMemos,
      (newVal) => {
        localStorage.setItem('quasar_memo_history', JSON.stringify(newVal));
      },
      { deep: true },
    );

    // Computed: Gruppieren nach Datum (Ordner)
    const groupedMemos = computed(() => {
      const groups: Record<string, MemoEntry[]> = {};

      // Erst sortieren (neueste zuerst)
      const sorted = [...savedMemos.value].sort((a, b) => b.id - a.id);

      sorted.forEach((memo) => {
        if (!groups[memo.date]) groups[memo.date] = [];
        // TS Fix: Nutze optional chaining oder explicit check, um undefined zu vermeiden
        const currentGroup = groups[memo.date];
        if (currentGroup) {
          currentGroup.push(memo);
        }
      });

      // Rückgabe sortiert nach Datum (Schlüssel)
      return Object.keys(groups)
        .sort()
        .reverse()
        .reduce(
          (acc, date) => {
            // TS Fix: Sicherstellen, dass der Wert nicht undefined ist
            const group = groups[date];
            if (group) {
              acc[date] = group;
            }
            return acc;
          },
          {} as Record<string, MemoEntry[]>,
        );
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

    const saveMemo = (manual = false) => {
      if (!summary.value) {
        if (manual) $q.notify({ color: 'warning', message: 'Nichts zu speichern.' });
        return;
      }

      const now = new Date();
      // TS Fix: Sicherstellen, dass date ein string ist
      const dateString = now.toISOString().split('T')[0] as string;

      const newEntry: MemoEntry = {
        id: Date.now(),
        date: dateString, // YYYY-MM-DD
        time: now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        transcript: transcript.value,
        rawSummary: summary.value,
        showDetails: false,
      };

      savedMemos.value.unshift(newEntry);
      // LocalStorage wird durch den Watcher automatisch aktualisiert
      if (manual) $q.notify({ color: 'green', icon: 'save', message: 'Gespeichert!' });
      else $q.notify({ color: 'green', icon: 'auto_awesome', message: 'Automatisch gespeichert' });
    };

    const deleteMemo = (id: number) => {
      savedMemos.value = savedMemos.value.filter((m) => m.id !== id);
      $q.notify({ color: 'grey', message: 'Gelöscht.' });
    };

    const formatDateLabel = (isoDate: string) => {
      if (!isoDate) return 'Unbekanntes Datum';
      const [year, month, day] = isoDate.split('-');
      return `${day}.${month}.${year}`;
    };

    const toggleRecording = () => {
      if (!recognition) return;

      if (isRecording.value) {
        isRecording.value = false;
        recognition.stop();
        interimTranscript.value = '';
      } else {
        isRecording.value = true;
        recognition.start();
        transcript.value = '';
        summary.value = '';
        interimTranscript.value = '';
      }
    };

    const clearAll = () => {
      transcript.value = '';
      interimTranscript.value = '';
      summary.value = '';
      isRecording.value = false;
      if (recognition) recognition.stop();
    };

    const simpleRenderMarkdown = (text: string) => {
      if (!text) return '';
      let html = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
      html = html.replace(/^\* (.*$)/gm, '<li>$1</li>');
      html = html.replace(/\n/g, '<br>');
      return html;
    };

    const copyToClipboard = (text: string) => {
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

Transkript: "${transcript.value} ${interimTranscript.value}"
      `;

      const fetchGemini = async (model: string) => {
        return fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${storedApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          },
        ).then((res) => res.json());
      };

      try {
        let data = await fetchGemini('gemini-2.5-pro');

        if (data.error) {
          console.warn('Flash fehlgeschlagen, versuche Pro...', data.error);
          data = await fetchGemini('gemini-pro');
        }

        if (data.error) {
          throw new Error(data.error.message || 'API Error');
        }

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          summary.value = data.candidates[0].content.parts[0].text;

          // --- AUTOMATISCHES SPEICHERN ---
          saveMemo(false); // false = nicht manuell, also automatisch
          // -------------------------------
        } else {
          throw new Error('Keine Antwort von Gemini erhalten.');
        }
      } catch (error) {
        const errorMessage = (error as Error).message || 'Unbekannter Fehler';
        $q.notify({
          color: 'negative',
          message: 'Fehler: ' + errorMessage,
        });
      } finally {
        loading.value = false;
      }
    };

    return {
      transcript,
      interimTranscript,
      summary,
      isRecording,
      loading,
      showSettings,
      apiKeyInput,
      hasKey,
      savedMemos,
      groupedMemos,
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

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
.animate-cursor {
  animation: blink 1s infinite;
}
</style>
