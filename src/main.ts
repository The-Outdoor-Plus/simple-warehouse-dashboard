import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import './index.css';
import 'primeicons/primeicons.css';
import router from './router';
import i18n from './i18n';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Tailwind from 'primevue/passthrough/tailwind';
import { DefaultApolloClient } from '@vue/apollo-composable';
import { mondayApolloClient } from './graphql';

const app = createApp(App);

app.provide(DefaultApolloClient, mondayApolloClient);

app.use(createPinia());
app.use(PrimeVue, { unstyled: true, pt: Tailwind });
app.use(ToastService);
app.use(router);
app.use(i18n);

app.mount('#app');
