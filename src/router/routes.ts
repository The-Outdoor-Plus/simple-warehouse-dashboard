export default [
  {
    path: '/',
    component: () => import(/* webpackChunkName: "home" */ '@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import(/* webpackChunkName: "home" */ '@/views/HomeView.vue'),
        meta: {
          requiresAuth: true,
          onlyWhenLoggedOut: false,
        }
      },
      {
        path: 'new',
        name: 'NewItem',
        component: () => import(/* webpackChunkName: "new-item" */ '@/views/NewItemView.vue'),
        meta: {
          requiresAuth: true,
          onlyWhenLoggedOut: false,
        }
      },
    ],
  },
  {
    path: '/login',
    component: () => import('@/layouts/LoginLayout.vue'),
    children: [
      {
        path: '',
        name: 'Login',
        component: () => import(/* webpackChunkName: "login" */ '@/views/LoginView.vue'),
        meta: {
          requiresAuth: false,
          onlyWhenLoggedOut: true,
        }
      }
    ],
  },
 
];