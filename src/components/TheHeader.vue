<script setup>
// App.vue에서 상단바만 분리 — 앱 전체 레이아웃 부품이라 exercise/ 말고 components/ 바로 아래 둠
// RouterLink는 main.js에서 use(router) 할 때 전역 등록돼서 여기서도 import 없이 그냥 씀
import UnitToggler from '@/components/UnitToggler.vue'
</script>

<template>
  <header>
    <!-- 어느 페이지로 가도 유지되는 공통 타이틀 -->
    <h1 class="app-title">🌦️ 날씨 보고 여행지 고르기</h1>
    <!-- 처음 온 사람이 3초 안에 무슨 앱인지 알게 해주는 한 줄 소개 -->
    <p class="app-subtitle">날짜만 고르면, 그날 날씨 좋은 여행지가 한눈에.</p>

    <!-- 내비 바 + 단위 토글러를 한 줄에 나란히 (mockup처럼 네비 왼쪽 / 단위 오른쪽) -->
    <div class="top-bar">
      <!-- 내비게이션 바. a 태그 대신 RouterLink — 새로고침 없이 화면만 전환 -->
      <!-- 메뉴 이름도 "여행" 언어로 통일 — 뭘 하는 앱인지 메뉴만 봐도 읽히게 -->
      <nav class="nav">
        <RouterLink to="/">🌦️ 여행지 고르기</RouterLink>
        <RouterLink to="/favorites">⭐ 찜한 여행지</RouterLink>
        <RouterLink to="/about">ℹ️ 서비스 소개</RouterLink>
      </nav>

      <!-- 단위 설정 UI. 어느 페이지에서 바꿔도 스토어라서 전 화면에 즉시 반영 -->
      <UnitToggler />
    </div>
  </header>
</template>

<style scoped>
.app-title {
  text-align: center;
  font-size: 1.8rem;
  color: #1e293b;
  margin: 0 0 6px;
}

/* 타이틀 아래 한 줄 소개 — 회색 작은 글씨로 담백하게 */
.app-subtitle {
  text-align: center;
  font-size: 0.95rem;
  color: #64748b;
  margin: 0 0 20px;
}

/* 내비 바 + 단위 토글러 묶음 줄. 좁은 화면에선 자연스럽게 줄바꿈 */
.top-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin: 0 auto 24px;
}

/* 내비 바 — 흰색 알약 패널로 카드 톤 맞춤 */
.nav {
  background: #fff;
  border-radius: 999px;
  padding: 10px 18px;
  box-shadow: 0 4px 14px rgba(30, 41, 59, 0.08);
  display: flex;
  justify-content: center;
  gap: 22px;
}

.nav a {
  text-decoration: none;
  color: #64748b;
  font-weight: 600;
  font-size: 0.95rem;
  transition: color 0.2s;
}
.nav a:hover {
  color: #4f46e5;
}

/* 현재 페이지 링크는 라우터가 붙여주는 클래스로 강조 — 파란색 + 밑줄 */
.nav a.router-link-active {
  color: #2563eb;
  text-decoration: underline;
  text-underline-offset: 4px;
}
</style>
