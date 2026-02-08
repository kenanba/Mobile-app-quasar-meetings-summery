<template>
  <div class="row q-gutter-md items-center justify-center q-mb-xl">
    <q-btn
      round
      size="xl"
      :color="isRecording ? 'red-5' : 'pink-5'"
      :icon="isRecording ? 'stop' : 'mic'"
      :disable="loading"
      @click="$emit('toggle')"
    />

    <q-btn
      v-if="hasAudio && !isRecording"
      rounded
      icon="auto_awesome"
      :label="$t('index.controls.process')"
      :loading="loading"
      @click="$emit('process')"
    />

    <q-btn
      v-if="hasContent && !isRecording"
      flat
      round
      icon="refresh"
      @click="$emit('reset')"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'RecorderControls',
  props: {
    isRecording: Boolean,
    loading: Boolean,
    hasAudio: Boolean,
    hasContent: Boolean
  }
});
</script>
