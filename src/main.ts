import './assets/main.css';

import { createApp } from 'vue';
import pinia from './store';

import App from './App.vue';
import './index.css';
import 'primeicons/primeicons.css';
import router from './router';
import i18n from './i18n';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Tailwind from 'primevue/passthrough/tailwind';
import { ApolloClients } from '@vue/apollo-composable';
import { mondayApolloClient, mondayFileApolloClient } from './graphql';
import * as Sentry from '@sentry/vue';

const app = createApp(App);

app.provide(ApolloClients, {
  default: mondayApolloClient,
  mondayFileClient: mondayFileApolloClient,
});

app.use(PrimeVue, { unstyled: true, pt: Tailwind });
app.use(ToastService);
app.use(router);
app.use(pinia);
app.use(i18n);

Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_VERCEL_ENV || 'local',
  integrations: [
    Sentry.browserTracingIntegration({ router }),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  tracePropagationTargets: ['localhost', import.meta.env.VITE_API_URL],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

app.mount('#app');
