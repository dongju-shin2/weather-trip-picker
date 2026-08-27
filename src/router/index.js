import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 전부 () => import()로 lazy loading — 첫 진입 때 홈만 받고 나머지는 실제로 갈 때 받게
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/WeatherHomeView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/WeatherAboutView.vue'),
    },
    {
      // :cityId 동적 세그먼트 — city_01 ~ city_05가 이 자리로 들어옴
      path: '/weather/:cityId',
      name: 'weatherDetail',
      component: () => import('@/views/WeatherDetailView.vue'),
    },
    {
      // 내가 추가한 뷰 — 즐겨찾기한 도시만 모아 보는 페이지
      path: '/favorites',
      name: 'favorites',
      component: () => import('@/views/WeatherFavoritesView.vue'),
    },
    {
      // 위에서 하나도 안 걸린 주소는 전부 여기로 (/kk 같은 오타 주소 대비)
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

export default router
