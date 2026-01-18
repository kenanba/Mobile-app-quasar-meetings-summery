<template>
  <section class="hero legal-hero">
    <div class="row items-center q-col-gutter-xl">

      <!-- TEXT -->
      <div>
        <div class="text-h2 text-weight-bold q-mb-md text-pink-4" >
          Impressum
        </div>

        <div class="text-subtitle1 text-grey-4 q-mb-xl">
          <strong>QuasarMemo</strong>
        </div>
        <div class="text-subtitle1 text-grey-4 q-mb-md">
          Bakre
        </div>
        <div class="text-subtitle1 text-grey-4 q-mb-md">
          Berlin 12099, Deutschland
        </div>

        <div class="text-subtitle1 text-grey-4 q-mt-lg">
          <strong>Hinweis:</strong> Dies ist eine rein private, kostenlose App.
          Es werden keine personenbezogenen Daten gespeichert oder verarbeitet.
        </div>
      </div>

    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ImpressumPage'
});
</script>

<style scoped>
.hero.legal-hero {
  padding: 80px 24px;
  background: radial-gradient(circle at top, #1f1f1f, #121212);
  color: #f7fafc;
}

.hero.legal-hero .text-grey-4 {
  color: #e2e8f0; /* heller Text auf dunklem Hintergrund */
}

.hero-image {
  max-width: 200px;
  margin-top: 2rem;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
}
</style>
