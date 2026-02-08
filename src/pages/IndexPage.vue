<template>
  <q-page class="q-pa-md flex flex-center column bg-dark text-white">
    <HeaderBar :has-key="hasKey" @open-settings="openSettings" />
    <small style="margin-bottom: 10px">{{ $t('index.microAccess') }}</small>
    <EmptyState v-if="showEmptyState" :has-key="hasKey" />

    <LivePreview
      v-if="showLivePreview"
      :transcript="transcript"
      :interim="interimTranscript"
      :is-recording="isRecording"
      :time="formattedRecordingTime"
    />

    <div v-if="summary && hasKey" class="full-width" style="max-width: 600px">
      <ResultCard
        :summary="renderedSummary"
        :transcript="finalGeminiTranscript"
        @save="saveMemo(true)"
        @copy="copyToClipboard"
      />
    </div>

    <RecorderControls
      v-if="hasKey"
      :is-recording="isRecording"
      :loading="loading"
      :has-audio="audioChunks.length > 0"
      :has-content="transcript.length > 0"
      @toggle="toggleRecording"
      @process="processAudioWithGemini"
      @reset="clearAll"
    />

    <div v-if="hasKey && savedMemos.length" class="full-width" style="max-width: 600px">
      <MemoHistory :grouped-memos="groupedMemos" @delete="deleteMemo" />
    </div>

    <SettingsDialog v-model="showSettings" v-model:apiKey="apiKeyInput" @save="saveKey" />
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useQuasar, copyToClipboard as qCopy, useMeta } from 'quasar';
import { useI18n } from 'vue-i18n';

import HeaderBar from 'components/HeaderBar.vue';
import EmptyState from 'components/EmptyState.vue';
import LivePreview from 'components/LivePreview.vue';
import ResultCard from 'components/ResultCard.vue';
import RecorderControls from 'components/RecorderControls.vue';
import MemoHistory from 'components/MemoHistory.vue';
import SettingsDialog from 'components/SettingsDialog.vue';

interface MemoEntry {
  id: number;
  date: string;
  time: string;
  transcript: string;
  rawSummary: string;
  showDetails?: boolean;
}

export default defineComponent({
  name: 'IndexPage',
  components: {
    HeaderBar,
    EmptyState,
    LivePreview,
    ResultCard,
    RecorderControls,
    MemoHistory,
    SettingsDialog,
  },

  setup() {
    const $q = useQuasar();
    const { t } = useI18n();

    // UI State
    const transcript = ref('');
    const interimTranscript = ref('');
    const finalGeminiTranscript = ref('');
    const summary = ref('');
    const isRecording = ref(false);
    const loading = ref(false);

    // Data
    const savedMemos = ref<MemoEntry[]>([]);
    const audioChunks = ref<Blob[]>([]);

    // Settings
    const showSettings = ref(false);
    const apiKeyInput = ref('');
    const hasKey = ref(false);
    let storedApiKey = '';

    // Recorder
    let mediaRecorder: MediaRecorder | null = null;
    let audioStream: MediaStream | null = null;

    const recordingSeconds = ref(0);
    let recordingInterval: number | null = null;
    // -------------------- COMPUTED --------------------

    const showEmptyState = computed(
      () => !summary.value && !isRecording.value && audioChunks.value.length === 0,
    );

    const showLivePreview = computed(
      () => hasKey.value && (isRecording.value || transcript.value.length > 0),
    );

    const renderedSummary = computed(() => simpleRenderMarkdown(summary.value));

    const groupedMemos = computed<Record<string, MemoEntry[]>>(() => {
      const groups: Record<string, MemoEntry[]> = {};

      for (const memo of savedMemos.value) {
        if (!groups[memo.date]) {
          groups[memo.date] = [];
        }
        groups[memo.date]!.push(memo);
      }

      return groups;
    });

    // -------------------- LIFECYCLE --------------------

    onMounted(() => {
      const history = localStorage.getItem('quasar_memo_history');
      if (history) savedMemos.value = JSON.parse(history);

      const key = localStorage.getItem('gemini_api_key');
      if (key) {
        storedApiKey = key;
        apiKeyInput.value = key;
        hasKey.value = true;
      } else {
        showSettings.value = true;
      }
    });

    watch(
      savedMemos,
      (v) => {
        localStorage.setItem('quasar_memo_history', JSON.stringify(v));
      },
      { deep: true },
    );

    // -------------------- RECORDING --------------------

    const startRecordingTimer = () => {
      recordingSeconds.value = 0;

      recordingInterval = window.setInterval(() => {
        recordingSeconds.value++;
      }, 1000);
    };

    const stopRecordingTimer = () => {
      if (recordingInterval !== null) {
        clearInterval(recordingInterval);
        recordingInterval = null;
      }
    };

    const formattedRecordingTime = computed(() => {
      const mins = Math.floor(recordingSeconds.value / 60);
      const secs = recordingSeconds.value % 60;

      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    });

    const startRecording = async () => {
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(audioStream);
      audioChunks.value = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.value.push(e.data);
      };

      mediaRecorder.start();
      isRecording.value = true;
      transcript.value = '';
      summary.value = '';

      startRecordingTimer();
    };

    const stopRecording = () => {
      mediaRecorder?.stop();
      audioStream?.getTracks().forEach((t) => t.stop());
      isRecording.value = false;

      stopRecordingTimer();

      setTimeout(() => {
        void processAudioWithGemini();
      }, 400);
    };

    const toggleRecording = async () => {
      if (isRecording.value) {
        stopRecording();
      } else {
        await startRecording();
      }
    };

    // -------------------- GEMINI --------------------

    const blobToBase64 = (blob: Blob): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          const result = reader.result;
          if (typeof result === 'string') {
            const base64 = result.split(',')[1];
            if (base64) resolve(base64);
            else reject(new Error('Invalid base64'));
          } else {
            reject(new Error('Empty reader result'));
          }
        };

        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

    const processAudioWithGemini = async () => {
      if (!storedApiKey || audioChunks.value.length === 0) return;

      loading.value = true;

      try {
        const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' });
        const base64 = await blobToBase64(audioBlob);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${storedApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: t('index.geminiPrompt') },
                    { inlineData: { mimeType: 'audio/webm', data: base64 } },
                  ],
                },
              ],
            }),
          },
        );
        const data = await response.json();

        if (data.error) {
          $q.notify({
            color: 'negative',
            message: t('index.notify.geminiError') + ': ' + data.error.message,
          });
        }
        summary.value = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        saveMemo(false);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : t('index.notify.unknownError');

        $q.notify({
          color: 'negative',
          message: t('index.notify.geminiError') + ': ' + message,
        });
      } finally {
        loading.value = false;
      }
    };

    // -------------------- UTILS --------------------

    const saveMemo = (manual: boolean) => {
      if (!summary.value) return;

      const now = new Date();
      const isoDate = now.toISOString().split('T')[0] as string;

      savedMemos.value.unshift({
        id: Date.now(),
        date: isoDate,
        time: now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        transcript: finalGeminiTranscript.value,
        rawSummary: summary.value,
      });
      $q.notify({ color: 'green', message: manual ? t('index.notify.saved') : t('index.notify.done') });
    };

    const deleteMemo = (id: number) => {
      savedMemos.value = savedMemos.value.filter((m) => m.id !== id);
    };

    const clearAll = () => {
      transcript.value = '';
      summary.value = '';
      audioChunks.value = [];
    };

    const openSettings = () => {
      showSettings.value = true;
    };

    const saveKey = () => {
      storedApiKey = apiKeyInput.value;
      localStorage.setItem('gemini_api_key', storedApiKey);
      hasKey.value = true;
      showSettings.value = false;
    };

    const copyToClipboard = (text: string) => {
      void qCopy(text)
        .then(() => {
          $q.notify({ color: 'green', message: t('common.copy') });
        })
        .catch(() => {
          $q.notify({ color: 'negative', message: t('common.copyError') });
        });
    };
    const simpleRenderMarkdown = (text: string) =>
      text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');

    // -------------------- RETURN --------------------

    useMeta(() => ({
      title: t('index.meta.title'),
      titleTemplate: (title: string) => `${title}`,

      meta: {
        description: {
          name: 'description',
          content: t('index.meta.description'),
        },

        keywords: {
          name: 'keywords',
          content: t('index.meta.keywords'),
        },

        robots: {
          name: 'robots',
          content: 'index, follow',
        },

        charset: {
          charset: 'utf-8',
        },

        viewport: {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },

        author: {
          name: 'author',
          content: 'QuasarMemo',
        },
      },

      link: {
        canonical: {
          rel: 'canonical',
          href: 'https://quasar-memo.netlify.app/',
        },
      },
    }));
    return {
      transcript,
      interimTranscript,
      finalGeminiTranscript,
      summary,
      renderedSummary,
      isRecording,
      loading,
      audioChunks,
      savedMemos,
      groupedMemos,
      showSettings,
      apiKeyInput,
      hasKey,
      showEmptyState,
      showLivePreview,
      toggleRecording,
      processAudioWithGemini,
      clearAll,
      saveMemo,
      deleteMemo,
      openSettings,
      saveKey,
      copyToClipboard,
      formattedRecordingTime,
      recordingSeconds,
    };
  },
});
</script>
