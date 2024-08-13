<template>
  <div class="w-full min-h-screen">
    <div class="flex flex-col sm:flex-row h-full">
      <div class="w-full md:w-6/12 lg:w-5/12 xl:w-4/12 2xl:w-3/12 sm:min-h-screen bg-white flex flex-col items-center">
        <div class="w-full bg-white my-24 sm:mt-60 flex flex-col px-8 max-w-xl">
          <img
            class="w-full"
            src="@/assets/top_logo.png"
          />
          <form
            class="mt-8 flex flex-col"
            @submit.prevent="submit"
          >
            <label for="username">Username</label>
            <InputText
              id="username"
              v-model="username"
              name="username"
            ></InputText>

            <label for="password">Password</label>
            <Password
              id="password"
              v-model="password"
              name="password"
              :feedback="false"
            ></Password>
            <Button
              class="mt-4 bg-blue-600"
              type="submit"
              severity="info"
            >
              Login
            </Button>
          </form>
        </div>
      </div>
      <div class="w-full md:w-6/12 lg:w-7/12 xl:w-8/12 2xl:w-9/12 sm:min-h-screen max-h-screen">
        <img
          class="h-full"
          cover
          src="@/assets/topbg.jpg"
        />
      </div>
    </div>
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user';
import axios from 'axios';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();
const toast = useToast();

const username = ref('');
const password = ref('');
const isLoading = ref(false);

const submit = async () => {
  try {
    isLoading.value = true;
    const result = await axios({
      method: 'post',
      url: `${import.meta.env.VITE_API_URL}/api/login`,
      data: JSON.parse(JSON.stringify({ username: username.value, password: password.value })),
      headers: { 'Content-Type': 'application/json' },
    });
    console.log(result);
    userStore.successfullLogin({ username: result.data.username }, { user: { username: result.data.username }, access_token: result.data.token });
    toast.add({ severity: 'success', summary: 'Logged in', detail: 'Logged in successfully', life: 3000 });
    router.push('/');
  } catch (e: any) {
    console.log(e);
    toast.add({ severity: 'error', summary: 'Error login in', detail: e?.response?.data?.error || 'There was an error while trying to log you in', life: 3000 });
  } finally {
    isLoading.value = false;
  }
}
</script>

