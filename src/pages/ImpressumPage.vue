<template>
  <q-page class="q-pa-md flex flex-center column bg-dark text-white">
    <ImpressumComponent />
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ImpressumComponent from 'components/ImpressumComponent.vue';


export default defineComponent({
  name: 'ImpressumPage',
  components: {
    ImpressumComponent,
  },

});
</script>
