<template>
  <q-card class="bg-grey-9 q-mb-md" flat bordered>
    <q-card-section>
      <div class="row justify-between items-center q-mb-md">
        <div class="text-h6 text-pink-3">
          <q-icon name="auto_awesome" class="q-mr-sm" /> KI Ergebnis
        </div>
        <div class="row q-gutter-sm">
          <q-btn flat round icon="save" @click="$emit('save')" />
          <q-btn flat round icon="content_copy" @click="$emit('copy', summary)" />
        </div>
      </div>

      <div class="text-body1 q-mb-md" v-html="summary"></div>

      <q-expansion-item dense expand-separator label="Perfektes Transkript">
        <div class="q-pa-sm text-body2 text-grey-4">
          {{ transcript }}
        </div>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ResultCard',
  props: {
    summary: String,
    transcript: String
  }
});
</script>
