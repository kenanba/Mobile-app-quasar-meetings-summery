<template>
  <div class="full-width q-mb-lg row items-center justify-between" style="max-width: 600px">
    <div class="text-h6 text-weight-bold">
      Quasar<span class="text-pink-3">Memo</span>
    </div>
    <q-btn
      v-if="hasKey"
      flat
      round
      dense
      icon="settings"
      @click="$emit('open-settings')"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'HeaderBar',
  props: {
    hasKey: { type: Boolean, required: true }
  },
});
</script>
