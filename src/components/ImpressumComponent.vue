<template>
  <section class="hero legal-hero">
    <div class="row items-center q-col-gutter-xl">
      <div>
        <div class="text-h2 text-weight-bold q-mb-md text-pink-4">
          {{ $t('imprint.title') }}
        </div>
        <div class="text-subtitle1 text-grey-4 q-mb-xl">
          <strong>{{ $t('imprint.appName') }}</strong>
        </div>
        <div class="text-subtitle1 text-grey-4 q-mb-md">
          {{ $t('imprint.author') }}
        </div>
        <div class="text-subtitle1 text-grey-4 q-mb-md">
          {{ $t('imprint.address') }}
        </div>
        <div class="text-subtitle1 text-grey-4 q-mt-lg">
          <strong>{{ $t('imprint.noteLabel') }}</strong> {{ $t('imprint.noteText') }}
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ImpressumPage',
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
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
}
</style>
