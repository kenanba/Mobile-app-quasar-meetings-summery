<template>
  <section class="hero">
    <div class="row items-center q-col-gutter-xl">

      <!-- TEXT -->
      <div class="col-12 col-md-6">
        <div class="text-h2 text-weight-bold q-mb-md">
          Deine Gedanken.
          <span class="text-pink-4">Sofort organisiert.</span>
        </div>

        <div class="text-subtitle1 text-grey-4 q-mb-xl">
          Sprich deine Ideen ein. QuasarMemo transkribiert, analysiert
          und fasst sie automatisch zusammen. Du kannst deine Meetings
          aufnehmen und direkt eine strukturierte, gut beschriebene
          Zusammenfassung erhalten.
        </div>

        <q-btn
          color="pink-5"
          size="lg"
          rounded
          icon="mic"
          label="Jetzt aufnehmen"
          to="/ai"
        />
      </div>

      <!-- IMAGE -->
      <div class="col-12 col-md-6 text-center">
        <img
          src="/hero.png"
          class="hero-image"
          alt="QuasarMemo App Vorschau"
        />
      </div>

    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: 80px 24px;
  background: radial-gradient(circle at top, #1f1f1f, #121212);
}

.hero-image {
  max-width: 100%;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'HeroSection'
});
</script>
