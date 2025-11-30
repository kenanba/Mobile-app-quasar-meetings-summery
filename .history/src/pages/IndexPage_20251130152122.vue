<template>
<div id="q-app">
    <q-layout view="hHh lpR fFf" class="bg-dark text-white">

        <q-header class="bg-dark text-white q-py-sm" elevated>
            <q-toolbar>
                <q-btn flat round dense icon="graphic_eq" class="q-mr-sm text-pink-3"></q-btn>
                <q-toolbar-title class="text-weight-bold">
                    Quasar<span class="text-pink-3">Memo</span>
                </q-toolbar-title>
                <q-btn flat round dense icon="settings" @click="showSettings = true"></q-btn>
            </q-toolbar>
        </q-header>

        <q-page-container>
            <q-page class="q-pa-md flex flex-center column">

                <!-- State: Empty / Start -->
                <div v-if="!transcript && !summary && !isRecording" class="text-center q-pa-lg">
                    <q-icon name="mic_none" size="80px" color="grey-8"></q-icon>
                    <div class="text-h5 q-mt-md text-grey-5">Bereit zur Aufnahme</div>
                    <div class="text-caption text-grey-7">Tippe auf das Mikrofon, um zu starten</div>
                </div>

                <!-- Recording & Transcript Area -->
                <div v-show="transcript || isRecording" class="full-width" style="max-width: 600px;">
                    <q-card class="bg-grey-10 q-mb-md" flat bordered>
                        <q-card-section>
                            <div class="text-subtitle2 text-grey-5 q-mb-sm">LIVE TRANSKRIPT</div>
                            <div class="text-body1 typewriter" style="min-height: 100px; white-space: pre-wrap;">{{ transcript }}<span v-if="isRecording" class="text-pink-3">_</span></div>
                        </q-card-section>
                    </q-card>
                </div>

                <!-- Summary Result -->
                <div v-if="summary" class="full-width" style="max-width: 600px;">
                    <q-card class="bg-grey-9 q-mb-md" flat bordered>
                        <q-card-section>
                            <div class="row items-center justify-between q-mb-md">
                                <div class="text-h6 text-pink-3"><q-icon name="auto_awesome" class="q-mr-sm"></q-icon>KI Zusammenfassung</div>
                                <q-btn flat round icon="content_copy" size="sm" @click="copyToClipboard(summary)"></q-btn>
                            </div>
                            <div class="text-body1" v-html="renderMarkdown(summary)"></div>
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
                            :class="{'recording-pulse': isRecording}"
                            @click="toggleRecording"
                        ></q-btn>

                        <!-- Summarize Button (appears if text exists) -->
                        <transition appear enter-active-class="animated fadeInRight" leave-active-class="animated fadeOutRight">
                            <q-btn
                                v-if="transcript.length > 10 && !isRecording"
                                rounded
                                color="white"
                                text-color="black"
                                icon="auto_awesome"
                                label="Zusammenfassen"
                                :loading="loading"
                                @click="generateSummary"
                            ></q-btn>
                        </transition>

                         <!-- Clear Button -->
                         <transition appear enter-active-class="animated fadeInLeft" leave-active-class="animated fadeOutLeft">
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

            </q-page>
        </q-page-container>

        <!-- Settings Dialog for API Key -->
        <q-dialog v-model="showSettings" persistent>
            <q-card class="bg-grey-9 text-white" style="min-width: 350px">
                <q-card-section>
                    <div class="text-h6">Einstellungen</div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                    <p class="text-caption text-grey-4">
                        Um die Zusammenfassung zu nutzen, benötigst du einen kostenlosen Gemini API Key.
                    </p>
                    <q-input
                        v-model="apiKey"
                        filled
                        dark
                        label="Gemini API Key"
                        type="password"
                        hint="Beginnt mit AIza..."
                    ></q-input>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Speichern" color="primary" v-close-popup></q-btn>
                </q-card-actions>
            </q-card>
        </q-dialog>

    </q-layout>
</div>
</template>

<script>
  // Ensure scripts are loaded before execution
    document.addEventListener('DOMContentLoaded', () => {
        const { createApp, ref, onMounted } = Vue;
        // Access Quasar global directly inside setup or here
        const md = window.markdownit();

        const app = createApp({
            setup() {
                const $q = Quasar.useQuasar();

                // State
                const transcript = ref('');
                const summary = ref('');
                const isRecording = ref(false);
                const loading = ref(false);
                const showSettings = ref(false);
                const apiKey = ref(localStorage.getItem('gemini_api_key') || '');

                // Speech Recognition Setup
                let recognition = null;

                onMounted(() => {
                    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                        recognition = new SpeechRecognition();
                        recognition.continuous = true;
                        recognition.interimResults = true;
                        recognition.lang = 'de-DE'; // German

                        recognition.onresult = (event) => {
                            let interimTranscript = '';
                            let finalTranscript = '';

                            for (let i = event.resultIndex; i < event.results.length; ++i) {
                                if (event.results[i].isFinal) {
                                    finalTranscript += event.results[i][0].transcript;
                                } else {
                                    interimTranscript += event.results[i][0].transcript;
                                }
                            }

                            // Append final results to main transcript
                            if (finalTranscript) {
                                transcript.value += (transcript.value ? ' ' : '') + finalTranscript;
                            }
                        };

                        recognition.onerror = (event) => {
                            console.error("Speech Error:", event.error);
                            isRecording.value = false;
                            $q.notify({
                                color: 'negative',
                                message: 'Fehler bei der Spracherkennung: ' + event.error
                            });
                        };

                        recognition.onend = () => {
                            // If user didn't manually stop, try to restart (for continuous feeling)
                            if (isRecording.value) {
                                try {
                                    recognition.start();
                                } catch (e) {
                                    isRecording.value = false;
                                }
                            }
                        };
                    } else {
                        $q.notify({
                            color: 'negative',
                            message: 'Dein Browser unterstützt keine Web Speech API.'
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

                const renderMarkdown = (text) => {
                    return md.render(text);
                }

                const copyToClipboard = (text) => {
                    const el = document.createElement('textarea');
                    el.value = text;
                    document.body.appendChild(el);
                    el.select();
                    document.execCommand('copy');
                    document.body.removeChild(el);
                    $q.notify({ color: 'green', message: 'Kopiert!', icon: 'check' });
                };

                // Gemini API Call
                const generateSummary = async () => {
                    if (!apiKey.value) {
                        showSettings.value = true;
                        $q.notify({ color: 'warning', message: 'Bitte gib zuerst deinen API Key ein.' });
                        return;
                    }

                    localStorage.setItem('gemini_api_key', apiKey.value);
                    loading.value = true;

                    const prompt = `
    Du bist ein professioneller Assistent. Deine Aufgabe ist es, das folgende gesprochene Transkript zu bereinigen und zusammenzufassen.
    Erstelle eine Struktur:
    1. **Kernaussage**: Ein Satz, worum es ging.
    2. **Details**: Stichpunkte der wichtigsten Informationen.
    3. **Action Items**: Falls Aufgaben genannt wurden (sonst weglassen).

    Hier ist das Transkript:
    "${transcript.value}"
                    `;

                    try {
                        // Using Gemini 1.5 Flash as requested, suitable for user provided keys
                        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.value}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                contents: [{
                                    parts: [{ text: prompt }]
                                }]
                            })
                        });

                        const data = await response.json();

                        if (data.error) {
                            throw new Error(data.error.message);
                        }

                        const resultText = data.candidates[0].content.parts[0].text;
                        summary.value = resultText;

                    } catch (error) {
                        $q.notify({
                            color: 'negative',
                            message: 'Fehler bei der Zusammenfassung: ' + error.message
                        });
                    } finally {
                        loading.value = false;
                    }
                };

                return {
                    transcript,
                    summary,
                    isRecording,
                    loading,
                    showSettings,
                    apiKey,
                    toggleRecording,
                    generateSummary,
                    clearAll,
                    renderMarkdown,
                    copyToClipboard
                };
            }
        });

        app.use(Quasar);
        app.mount('#q-app');
    });
</script>
