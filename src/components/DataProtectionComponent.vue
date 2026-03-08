<template>
  <section class="hero legal-hero">
    <div class="row items-center q-col-gutter-xl">
      <div>
        <div class="text-h2 text-weight-bold q-mb-md text-pink-4">
          {{ $t('privacy.title') }}
        </div>
        <div class="text-subtitle1 text-grey-4 q-mb-xl">
          {{ $t('privacy.dataStorage') }}
        </div>
        <div class="text-subtitle1 text-grey-4 q-mb-xl">
          {{ $t('privacy.aiProcessing') }}
        </div>
        <div class="text-subtitle1 text-grey-4 q-mb-xl">
          {{ $t('privacy.apiKey') }}
        </div>
        <div class="text-subtitle1 text-grey-4 q-mb-xl">
          {{ $t('privacy.userResponsibility') }}
        </div>
        <div class="text-subtitle1 text-grey-4 q-mb-xl">
          {{ $t('privacy.noPayment') }}
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DataProtectionPage',
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
