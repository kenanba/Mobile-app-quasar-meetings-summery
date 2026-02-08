<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="bg-grey-9 text-white" style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">{{ $t('index.settings.title') }}</div>
        <small>{{ $t('index.settings.geminiKey') }}</small>
      </q-card-section>

      <q-card-section>
        <q-input
          :model-value="apiKey"
          @update:model-value="$emit('update:apiKey', $event)"
          filled
          dark
          :label="$t('index.settings.apiKeyLabel')"
          type="password"
          name="apiKey"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="$t('common.save')" color="primary" @click="$emit('save')" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SettingsDialog',
  props: {
    modelValue: { type: Boolean, required: true },
    apiKey: { type: String, required: true }
  },
  emits: ['update:modelValue', 'update:apiKey', 'save']
});
</script>
