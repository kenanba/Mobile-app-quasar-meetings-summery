<template>
  <q-page class="q-pa-md flex flex-center column bg-dark text-white">
    <DataProtectionComponent />
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DataProtectionComponent from 'components/DataProtectionComponent.vue';

export default defineComponent({
  name: 'DataProtection',
  components: {
    DataProtectionComponent,
  },
});
</script>
