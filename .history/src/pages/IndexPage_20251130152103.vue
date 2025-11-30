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

</script>
