<template>
  <div class="w-full">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue';
import { useUserStore } from './store/user';

const userStore = useUserStore();

onMounted(() => {
  userStore.setSentryUser({ username: userStore.currentUserName || 'Not Defined' });
});
</script>
