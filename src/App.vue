<script setup>
// 여긴 레이아웃만 — 상단바는 TheHeader로 분리했고, 실제 화면은 RouterView가 갈아끼움
import TheHeader from '@/components/TheHeader.vue'
</script>

<template>
  <div class="app">
    <!-- 공통 타이틀 + 내비게이션 바 (모든 페이지 고정) -->
    <TheHeader />

    <!-- 메인 콘텐츠 자리 — 현재 URL에 매칭된 뷰가 여기 렌더링됨 -->
    <RouterView />
  </div>
</template>

<style>
/* 브라우저 기본 여백 제거 */
body {
  margin: 0;
  font-family: 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
}

/* ===== Element Plus 테마 커스터마이징 (과제 7) =====
   라이브러리 기본색(파랑) 대신 우리 앱의 인디고 톤으로.
   Element Plus는 색을 전부 CSS 변수로 쓰기 때문에 :root에서 변수만 덮으면 전체에 적용됨.
   light-3 ~ light-9는 hover/배경용으로 원색을 점점 연하게 섞은 단계 */
:root {
  --el-color-primary: #4f46e5;
  --el-color-primary-light-3: #7e77eb;
  --el-color-primary-light-5: #a5a0f1;
  --el-color-primary-light-7: #cbc8f7;
  --el-color-primary-light-8: #dedcf9;
  --el-color-primary-light-9: #f1f0fc;
  --el-color-primary-dark-2: #3f38b7;
  --el-font-family: 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
}

/* 카드 모서리를 기존 흰 패널(16px)과 똑같이 — scoped면 자식 뷰에 안 먹어서 전역 블록에 둠 */
.el-card {
  --el-card-border-radius: 16px;
  border: none;
  box-shadow: 0 4px 14px rgba(30, 41, 59, 0.08);
}
</style>

<style scoped>
/* 배경 그라데이션을 App으로 올림 — 페이지 넘어갈 때마다 배경이 끊기지 않게 */
.app {
  min-height: 100vh;
  background: linear-gradient(160deg, #e0f2fe 0%, #ede9fe 60%, #fce7f3 100%);
  padding: 40px 16px;
  box-sizing: border-box;
}
</style>
