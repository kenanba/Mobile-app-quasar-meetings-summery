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
      <q-page class="q-pa-md flex flex-center column bg-dark text-white">
        <ImpressumComponent />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ImpressumComponent from 'components/ImpressumComponent.vue';
import { useMeta } from 'quasar';
import LanguageSelector from 'components/LanguageSelector.vue';

export default defineComponent({
  name: 'ImpressumPage',
  components: {
    LanguageSelector,
    ImpressumComponent,
  },
  setup() {
    useMeta({
      title: 'Impressum – QuasarMemo',
      meta: {
        robots: {
          name: 'robots',
          content: 'noindex, nofollow',
        },
      },
    });
  },
});
</script>
