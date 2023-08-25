import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import(/* webpackChunkName: "home" */ '@/layouts/DefaultLayout.vue'),
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import(/* webpackChunkName: "home" */ '@/views/HomeView.vue'),
        },
        {
          path: 'new',
          name: 'NewItem',
          component: () => import(/* webpackChunkName: "new-item" */ '@/views/NewItemView.vue'),
        },
      ],
    },
  ]
});

export default router
