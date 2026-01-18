<template>
  <div class="full-width" style="max-width: 600px">
    <q-card class="bg-grey-10 q-mb-md" flat bordered>
      <q-card-section>
        <div class="row justify-between items-center q-mb-sm">
          <div class="text-subtitle2 text-grey-5">LIVE VORSCHAU</div>
          <q-badge v-if="isRecording" color="red" label="REC" class="animate-blink" />
        </div>
        <div class="row items-center q-gutter-sm">
          <q-badge v-if="isRecording" color="red" label="REC" />
          <div v-if="isRecording" class="text-caption text-grey-4">
            {{ time }}
          </div>
        </div>
        <div class="text-body1 typewriter text-grey-6">
          <span>{{ transcript }}</span>
          <span class="text-grey-8">{{ interim }}</span>
          <span v-if="isRecording" class="text-pink-3">_</span>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LivePreview',
  props: {
    transcript: String,
    interim: String,
    isRecording: Boolean,
    time: String
  }
});
</script>
