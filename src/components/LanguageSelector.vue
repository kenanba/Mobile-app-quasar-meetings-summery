<template>
  <q-select
    v-model="locale"
    :options="languageOptions"
    dense
    outlined
    dark
    emit-value
    map-options
    :label="$t('language.label')"
    class="language-selector"
    style="min-width: 140px"
    @update:model-value="onLocaleChange"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'LanguageSelector',
  setup() {
    const { locale } = useI18n();

    const languageOptions = [
      { label: 'Deutsch', value: 'de' },
      { label: 'English', value: 'en' },
    ];

    const onLocaleChange = (newLocale: string) => {
      localStorage.setItem('quasar_memo_locale', newLocale);
    };

    return {
      locale,
      languageOptions,
      onLocaleChange,
    };
  },
});
</script>
