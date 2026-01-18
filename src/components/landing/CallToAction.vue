<template>
  <section class="q-pa-xl text-center">
    <div class="text-h5 q-mb-md">
      Bereit, produktiver zu denken?
    </div>

    <q-btn
      color="pink-5"
      size="lg"
      rounded
      icon="mic"
      label="Jetzt starten"
      to="/ai"
    />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CallToAction'
});
</script>
