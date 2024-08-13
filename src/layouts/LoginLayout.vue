<template>
  <div class="w-full h-full min-h-screen">
    <main class="max-w-[95vw] mx-auto">
      <router-view></router-view>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { RouterView } from 'vue-router';
</script>