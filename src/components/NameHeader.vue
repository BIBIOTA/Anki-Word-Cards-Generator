<template>
    <v-app-bar color="primary">
        <v-toolbar-title class="ml-5 pl-3 text-left">
            Anki Word Cards Generator
        </v-toolbar-title>

        <v-btn-toggle
          v-model="lang"
          rounded="0"
          group
          class="mr-5"
        >
          <v-btn
            @click="toggleLang(Languages.En)"
            color="primary"
            value="en"
          >
            Enlgish Card
          </v-btn>

          <v-btn
            @click="toggleLang(Languages.Es)"
            color="primary"
            value="es"
        >
            Spanlish Card
          </v-btn>
        </v-btn-toggle>

    </v-app-bar>
</template>

<script setup lang="ts">
import { Languages } from '../enums/generator';
import { getLang } from '../methods/lang';
import { onMounted, ref } from 'vue';

const lang = ref(Languages.En);

onMounted(() => {
    lang.value = getLang();
});

const toggleLang = (lang: Languages) => {
    window.location.href = `/?lang=${lang}`;
};

</script>
