// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user';
import routes from './routes';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  const requiresAuth = to.meta.requiresAuth;
  const onlyWhenLoggedOut = to.meta.onlyWhenLoggedOut;
  const loggedIn = !!userStore.currentToken;

  if (requiresAuth && !onlyWhenLoggedOut && !loggedIn) {
    return next({
      path: '/login',
      query: { redirect: to.fullPath },
    });
  }

  if (requiresAuth && !loggedIn) {
    return next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }

  if (loggedIn && onlyWhenLoggedOut) {
    return next('/');
  }

  next();
});

export default router