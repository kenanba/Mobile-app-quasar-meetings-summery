<template>
  <q-layout view="hHh lpR fFf" class="bg-dark text-white">

    <!-- HEADER with language selector -->
    <q-header elevated class="bg-dark">
      <q-toolbar>
        <q-toolbar-title>QuasarMemo</q-toolbar-title>
        <LanguageSelector />
      </q-toolbar>
    </q-header>

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
      <div class="q-pa-md">
        <div class="row items-center justify-between">
          <div>{{ $t('landing.footer.copyright') }}</div>
          <div class="legal-links">
            <router-link to="/impressum" style="color: #00acc1; text-decoration: none;">{{ $t('common.impressum') }}</router-link>
            <router-link to="/data-protection" style="color: #00acc1; text-decoration: none; margin-left: 1rem;">{{ $t('common.dataProtection') }}</router-link>
          </div>
        </div>
        <div class="text-caption text-grey-6 q-mt-sm text-center">
          {{ $t('landing.footer.disclaimer') }}
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
import LanguageSelector from 'components/LanguageSelector.vue';
import { useMeta } from 'quasar';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'LandingPage',
  components: {
    HeroSection,
    HowItWorks,
    PrivacySection,
    CallToAction,
    LanguageSelector,
  },

  setup(){
    const { t } = useI18n();
    useMeta(() => ({
      title: t('index.meta.title'),
      titleTemplate: (title: string) => `${title}`,

      meta: {
        description: {
          name: 'description',
          content: t('index.meta.description'),
        },

        keywords: {
          name: 'keywords',
          content: t('index.meta.keywords'),
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
    }));

  }
});
</script>
