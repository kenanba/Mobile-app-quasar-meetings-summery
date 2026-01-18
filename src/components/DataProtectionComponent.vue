<template>
  <section class="hero legal-hero">
    <div class="row items-center q-col-gutter-xl">

      <!-- TEXT -->
      <div>
        <div class="text-h2 text-weight-bold q-mb-md text-pink-4">
          Datenschutz
        </div>

        <div class="text-subtitle1 text-grey-4 q-mb-xl">
          QuasarMemo speichert keinerlei personenbezogene Daten. Alle Sprachaufnahmen und Inhalte werden nur lokal auf Ihrem Gerät verarbeitet.
          Es erfolgt keine Übertragung an Dritte oder Server.
        </div>

        <div class="text-subtitle1 text-grey-4 q-mb-xl">
          Da die App keine finanziellen Transaktionen beinhaltet, sind auch keine Zahlungsinformationen erforderlich.
        </div>
      </div>


    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DataProtectionPage'
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
