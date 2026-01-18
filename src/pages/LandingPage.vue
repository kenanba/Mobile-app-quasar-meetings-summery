<template>
  <q-layout view="hHh lpR fFf" class="bg-dark text-white">



    <!-- CONTENT -->
    <q-page-container>
      <q-page>

        <HeroSection />
        <HowItWorks />
        <PrivacySection />
        <CallToAction />

      </q-page>
    </q-page-container>

    <!-- FOOTER -->
    <q-footer class="bg-grey-10 text-grey-5">
      <div class="row items-center justify-between q-pa-md">
        <div>© 2026 QuasarMemo</div>
        <div class="legal-links">
          <router-link to="/impressum" style="color: #00acc1; text-decoration: none;">Impressum</router-link>
          <router-link to="/data-protection" style="color: #00acc1; text-decoration: none; margin-left: 1rem;">Datenschutz</router-link>
        </div>
      </div>
    </q-footer>

  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import HeroSection from 'components/landing/HeroSection.vue';
import HowItWorks from 'components/landing/HowItWorks.vue';
import PrivacySection from 'components/landing/PrivacySection.vue';
import CallToAction from 'components/landing/CallToAction.vue';
import { useMeta } from 'quasar';

export default defineComponent({
  name: 'LandingPage',
  components: {
    HeroSection,
    HowItWorks,
    PrivacySection,
    CallToAction
  },

  setup(){
    useMeta({
      title: 'QuasarMemo – KI-gestützte Sprach- & Meeting-Zusammenfassung',
      titleTemplate: (title) => `${title}`,

      meta: {
        description: {
          name: 'description',
          content:
            'QuasarMemo transkribiert Sprachaufnahmen und Meetings automatisch und erstellt strukturierte Zusammenfassungen – lokal, privat und kostenlos.',
        },

        keywords: {
          name: 'keywords',
          content:
            'Sprachmemo, KI Transkription, Meeting Zusammenfassung, Notizen App, Sprachaufnahme',
        },

        robots: {
          name: 'robots',
          content: 'index, follow',
        },

        charset: {
          charset: 'utf-8',
        },

        viewport: {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },

        author: {
          name: 'author',
          content: 'QuasarMemo',
        },
      },

      link: {
        canonical: {
          rel: 'canonical',
          href: 'https://quasar-memo.netlify.app/',
        },
      },
    });

  }
});
</script>
