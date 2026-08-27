<script setup>
// 여긴 레이아웃만 — 상단바는 TheHeader로 분리했고, 실제 화면은 RouterView가 갈아끼움
import TheHeader from '@/components/TheHeader.vue'
</script>

<template>
  <div class="app">
    <!-- 상단 고정 헤더 (모든 페이지 공통) -->
    <TheHeader />

    <!-- 메인 콘텐츠 — 중앙 1140px 컨테이너, 현재 URL에 매칭된 뷰가 여기 렌더링됨 -->
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style>
/* 브라우저 기본 여백 제거 + 본문 기본 톤 */
body {
  margin: 0;
  font-family: 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
  /* 히어로가 100vw로 컨테이너를 탈출할 때 생기는 가로 스크롤 방지
     (hidden이 아니라 clip — hidden은 스크롤 컨테이너를 만들어 sticky 헤더가 깨짐) */
  overflow-x: clip;
}

/* ===== Element Plus 테마 커스터마이징 (과제 7) =====
   라이브러리 기본색(파랑) 대신 우리 앱의 인디고 톤으로.
   Element Plus는 색을 전부 CSS 변수로 쓰기 때문에 :root에서 변수만 덮으면 전체에 적용됨.
   light-3 ~ light-9는 hover/배경용으로 원색을 점점 연하게 섞은 단계 */
:root {
  /* ===== 텍스트 색상 토큰 — 전 페이지 공통 기준 =====
     heading: 제목/도시명/온도 숫자, text: 본문, text-sub: 보조 정보(날씨 상태·명소·설명)
     이보다 연한 회색(#9CA3AF 이하)은 placeholder 외에 쓰지 않기 */
  --color-heading: #111827;
  --color-text: #1f2937;
  --color-text-sub: #4b5563;

  /* Element Plus 내부 텍스트(표/디스크립션/입력)도 같은 기준으로 */
  --el-text-color-primary: #1f2937;
  --el-text-color-regular: #1f2937;
  --el-text-color-secondary: #4b5563;

  --el-color-primary: #4f46e5;
  --el-color-primary-light-3: #7e77eb;
  --el-color-primary-light-5: #a5a0f1;
  --el-color-primary-light-7: #cbc8f7;
  --el-color-primary-light-8: #dedcf9;
  --el-color-primary-light-9: #f1f0fc;
  --el-color-primary-dark-2: #3f38b7;
  --el-font-family: 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
  /* 버튼/입력 모서리 반경 전역 통일 */
  --el-border-radius-base: 8px;
}

/* 버튼 인터랙션 통일 — hover 시 1px 상승 + 은은한 그림자, 0.2s */
.el-button {
  transition: all 0.2s;
}
.el-button:not(.is-text):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08);
}

/* 남아있는 el-card(상세/소개/404)도 같은 규칙 — 얇은 테두리 하나만, 그림자 없음 */
.el-card {
  --el-card-border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: none;
}
</style>

<style scoped>
/* 페이지 배경 — 넘어갈 때 안 끊기게 App이 소유 */
.app {
  min-height: 100vh;
  background: #f7f8fa;
}

/* 본문 중앙 컨테이너 */
.app-main {
  max-width: 1140px;
  margin: 0 auto;
  padding: 40px 24px 64px;
  box-sizing: border-box;
}
</style>
