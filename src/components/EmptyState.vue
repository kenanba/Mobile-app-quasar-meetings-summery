<template>
  <div class="text-center q-pa-lg">
    <q-icon
      :name="hasKey ? 'mic_none' : 'lock'"
      size="80px"
      color="grey-8"
    />
    <div class="text-h6 q-mt-md text-grey-5">
      {{ hasKey ? 'Bereit zur Aufnahme' : 'Setup erforderlich' }}
    </div>
    <div class="text-caption text-grey-7">
      {{ hasKey ? 'Tippe auf das Mikrofon' : 'Bitte API Key eingeben' }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'EmptyState',
  props: {
    hasKey: { type: Boolean, required: true }
  }
});
</script>
