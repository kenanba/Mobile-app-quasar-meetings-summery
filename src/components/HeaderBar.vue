<template>
  <div class="full-width q-mb-lg row items-center justify-between" style="max-width: 600px">
    <div class="text-h6 text-weight-bold">
      Quasar<span class="text-pink-3">Memo</span>
    </div>
    <div class="row items-center q-gutter-sm">
      <LanguageSelector />
      <q-btn
        v-if="hasKey"
        flat
        round
        dense
        icon="settings"
        @click="$emit('open-settings')"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LanguageSelector from 'components/LanguageSelector.vue';

export default defineComponent({
  name: 'HeaderBar',
  components: { LanguageSelector },
  props: {
    hasKey: { type: Boolean, required: true }
  },
});
</script>
