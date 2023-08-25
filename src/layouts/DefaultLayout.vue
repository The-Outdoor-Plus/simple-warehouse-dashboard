<template>
  <div class="w-full h-full min-h-screen">
    <top-bar></top-bar>
    <main class="container mx-auto pt-20">
      <router-view></router-view>
    </main>
  </div>
</template>

<script lang="ts" setup>
import TopBar from '@/components/TopBar.vue';
import { RouterView } from 'vue-router';
//
</script>