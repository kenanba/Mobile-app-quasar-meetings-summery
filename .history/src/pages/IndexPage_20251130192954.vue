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
              <!-- Save Button -->
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

<script setup lang="ts">
import { ref } from "vue";

const transcript = ref("");
const interimTranscript = ref("");
const listening = ref(false);

let recognition: SpeechRecognition | null = null;
let lastFinalSentence = "";

// -------------------------------
// INITIALISIERUNG
// -------------------------------
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = "de-DE";
  recognition.interimResults = true;
  recognition.continuous = true;
} else {
  alert("Speech Recognition wird von diesem Browser nicht unterstützt.");
}

// -------------------------------
// START
// -------------------------------
function startListening() {
  if (!recognition) return;
  transcript.value = "";
  interimTranscript.value = "";
  listening.value = true;
  recognition.start();
}

// -------------------------------
// STOP
// -------------------------------
function stopListening() {
  if (!recognition) return;
  listening.value = false;
  recognition.stop();
}

// -------------------------------
// DUPLIKAT-FREIE ERGEBNISSE
// -------------------------------
if (recognition) {
  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let finalChunk = "";
    let interimChunk = "";

    // --- Ergebnisse sammeln
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const res = event.results[i];
      if (!res) continue;

      const text = res[0]?.transcript || "";

      if (res.isFinal) finalChunk += text;
      else interimChunk += text;
    }

    // -------------------------------
    // FINALE ERKENNUNG → DUPLIKATE VERMEIDEN
    // -------------------------------
    if (finalChunk) {
      const cleanFinal = finalChunk.trim();
      const cleanTranscript = transcript.value.trim();

      // 1) Duplikat prüfen (exakt)
      if (cleanFinal === lastFinalSentence) {
        interimTranscript.value = "";
        return;
      }

      // 2) Duplikat prüfen (letztes Segment vergleichen)
      const lastPart = cleanTranscript
        .slice(-cleanFinal.length - 5)
        .trim();

      if (lastPart === cleanFinal) {
        interimTranscript.value = "";
        return;
      }

      // 3) Speichern, um Wiederholungen zu verhindern
      lastFinalSentence = cleanFinal;

      // 4) Clean anhängen
      transcript.value += (cleanTranscript ? " " : "") + cleanFinal;

      interimTranscript.value = "";
    } else {
      // Live Vorschau
      interimTranscript.value = interimChunk;
    }
  };

  recognition.onerror = (e) => {
    console.error("Speech Recognition error:", e);
  };
}
</script>

<template>
  <div style="padding: 20px; font-family: sans-serif;">
    <h2>🎤 Speech to Text (mit Anti-Repeat-System)</h2>

    <button
      @click="listening ? stopListening() : startListening()"
      style="padding: 10px 20px; margin-bottom: 20px; cursor: pointer;"
    >
      {{ listening ? "Stop" : "Start" }}
    </button>

    <h3>Final:</h3>
    <div style="background:#eee; padding:10px; min-height:80px;">
      {{ transcript }}
    </div>

    <h3>Live:</h3>
    <div style="background:#ddd; padding:10px; min-height:40px;">
      {{ interimTranscript }}
    </div>
  </div>
</template>

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
