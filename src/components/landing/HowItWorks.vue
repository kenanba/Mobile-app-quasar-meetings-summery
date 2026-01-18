<template>
  <section class="how-it-works-section">
    <h2 class="section-title">So funktioniert es</h2>

    <div class="steps-container">
      <div class="step-card">
        <div class="step-number">1</div>
        <h3 class="step-title">Sprich deine Nachricht</h3>
        <p class="step-desc">
          Starte die Aufnahme mit einem Klick auf das Mikrofon.
        </p>
      </div>

      <div class="step-card">
        <div class="step-number">2</div>
        <h3 class="step-title">KI verarbeitet deine Aufnahme</h3>
        <p class="step-desc">
          Automatische Transkription und Zusammenfassung der Nachricht.
        </p>
      </div>

      <div class="step-card">
        <div class="step-number">3</div>
        <h3 class="step-title">Ergebnis erhalten</h3>
        <p class="step-desc">
          Du siehst das fertige Transkript und die strukturierte Zusammenfassung.
        </p>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'HowItWorks'
});
</script>

<style scoped>
.how-it-works-section {
  padding: 4rem 2rem;
  background-color: #edf2f7; /* hellblauer Hintergrund für Abgrenzung */
}

.section-title {
  font-size: 2.5rem;
  text-align: center;
  font-weight: bold;
  margin-bottom: 3rem;
  color: #1a202c;
}

.steps-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Kartenlayout für Desktop */
@media (min-width: 768px) {
  .steps-container {
    flex-direction: row;
    justify-content: center;
    gap: 2rem;
  }
}

.step-card {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  flex: 1;
}

.step-number {
  font-size: 2rem;
  font-weight: bold;
  color: #e53e3e; /* Highlight-Farbe */
  margin-bottom: 1rem;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.step-desc {
  font-size: 1rem;
  color: #4a5568;
  line-height: 1.6;
}
</style>
