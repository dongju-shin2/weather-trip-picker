<script setup>
// 상단 고정(sticky) 헤더 — 좌측 워드마크 / 우측 내비 + 단위 토글
// RouterLink는 main.js에서 use(router) 할 때 전역 등록돼서 여기서도 import 없이 그냥 씀
import { nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UnitToggler from '@/components/UnitToggler.vue'

const route = useRoute()
const router = useRouter()

// "내 여행"은 홈 페이지 안의 섹션(TripPlanner, id="my-trip")이라 별도 라우트 없이 스크롤로 진입
// 홈이면 바로 스크롤, 다른 페이지면 홈으로 이동한 뒤(렌더 완료 대기) 스크롤
const goMyTrip = async () => {
  if (route.path !== '/') {
    await router.push('/')
    await nextTick()
  }
  document.getElementById('my-trip')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <header class="site-header">
    <div class="header-inner">
      <!-- 워드마크 — 클릭하면 홈으로 -->
      <RouterLink to="/" class="logo">날씨 보고 여행지 고르기</RouterLink>

      <nav class="nav">
        <RouterLink to="/">여행지 고르기</RouterLink>
        <RouterLink to="/favorites">찜한 여행지</RouterLink>
        <!-- 홈의 '내 여행' 섹션으로 스크롤 진입 (기능은 기존 그대로) -->
        <button type="button" class="nav-btn" @click="goMyTrip">내 여행</button>
        <RouterLink to="/about">서비스 소개</RouterLink>

        <!-- 단위 설정 UI. 어느 페이지에서 바꿔도 스토어라서 전 화면에 즉시 반영 -->
        <UnitToggler />
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.header-inner {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 24px;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  box-sizing: border-box;
}

.logo {
  font-size: 18px;
  font-weight: 800;
  color: var(--color-heading);
  text-decoration: none;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.nav {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.nav a,
.nav-btn {
  text-decoration: none;
  color: var(--color-text-sub);
  font-weight: 600;
  font-size: 15px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: color 0.2s;
}
.nav a:hover,
.nav-btn:hover {
  color: #4f46e5;
}

/* '내 여행'은 스크롤 이동 버튼이라 a가 아닌 button — 링크와 같은 모양으로 */
.nav-btn {
  border: none;
  background: none;
  cursor: pointer;
  font-family: inherit;
}

/* 현재 페이지 링크는 포인트 컬러로 강조 */
.nav a.router-link-exact-active {
  color: #4f46e5;
}
</style>
