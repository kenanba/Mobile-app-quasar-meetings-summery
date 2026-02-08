<template>
  <div class="text-center q-pa-lg">
    <q-icon
      :name="hasKey ? 'mic_none' : 'lock'"
      size="80px"
      color="grey-8"
    />
    <div class="text-h6 q-mt-md text-grey-5">
      {{ hasKey ? $t('index.emptyState.ready') : $t('index.emptyState.setup') }}
    </div>
    <div class="text-caption text-grey-7">
      {{ hasKey ? $t('index.emptyState.tapMic') : $t('index.emptyState.enterKey') }}
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
