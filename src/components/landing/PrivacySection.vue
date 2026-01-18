<template>
  <section class="q-pa-xl bg-grey-10 text-center">
    <q-icon name="verified_user" size="48px" color="green-4" />

    <div class="text-h6 q-mt-md">
      Datenschutz steht an erster Stelle
    </div>

    <div class="text-caption text-grey-5" style="max-width:600px;margin:auto">
      Deine Aufnahmen und Zusammenfassungen werden lokal gespeichert.
      Es gibt keine Nutzerkonten, kein Tracking und keine Werbung.
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PrivacySection'
});
</script>
