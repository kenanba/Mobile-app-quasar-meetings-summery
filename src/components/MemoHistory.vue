<template>
  <q-list bordered separator dark>
    <q-expansion-item
      v-for="(memos, date) in groupedMemos"
      :key="date"
      :label="date"
      icon="folder"
    >
      <q-card
        v-for="memo in memos"
        :key="memo.id"
        class="bg-grey-9 q-mb-sm"
      >
        <q-card-section>
          <div class="row justify-between">
            <div class="text-caption">{{ memo.time }}</div>
            <q-btn flat round icon="delete" color="red" @click="$emit('delete', memo.id)" />
          </div>
          <div class="text-body2 q-mt-sm">
            {{ memo.rawSummary.substring(0, 100) }}...
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </q-list>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MemoHistory',
  props: {
    groupedMemos: { type: Object, required: true }
  }
});
</script>
