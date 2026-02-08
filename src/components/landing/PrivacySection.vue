<template>
  <section class="q-pa-xl bg-grey-10 text-center">
    <q-icon name="verified_user" size="48px" color="green-4" />

    <div class="text-h6 q-mt-md">
      {{ $t('landing.privacy.title') }}
    </div>

    <div class="text-caption text-grey-5" style="max-width:600px;margin:auto">
      {{ $t('landing.privacy.desc') }}
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PrivacySection'
});
</script>
