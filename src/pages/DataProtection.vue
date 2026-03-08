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
        <DataProtectionComponent />
      </q-page>
    </q-page-container>
  </q-layout>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import DataProtectionComponent from 'components/DataProtectionComponent.vue';
import { useMeta } from 'quasar';
import LanguageSelector from 'components/LanguageSelector.vue';

export default defineComponent({
  name: 'DataProtection',
  components: {
    LanguageSelector,
    DataProtectionComponent,
  },
  setup() {
    useMeta({
      title: 'Datenschutz – QuasarMemo',
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
