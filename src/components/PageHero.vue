<script setup>
// 페이지 상단 히어로 — 홈은 큰 버전, 상세/찜/소개는 compact(얇은) 버전
// 표시 전용 컴포넌트라 로직 없음. 그라데이션 톤을 한 곳에서 관리해서 전 페이지가 통일됨
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  compact: { type: Boolean, default: false },
})
</script>

<template>
  <section class="hero" :class="{ compact }">
    <div class="hero-inner">
      <h1 class="hero-title">{{ title }}</h1>
      <p v-if="subtitle" class="hero-subtitle">{{ subtitle }}</p>
    </div>
  </section>
</template>

<style scoped>
.hero {
  /* 중앙 컨테이너(app-main) 안에서 화면 전체 폭으로 탈출 — 가로 넘침은 body overflow-x: clip이 처리 */
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-top: -40px; /* app-main 상단 패딩 상쇄 — 헤더 바로 아래부터 시작 */
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  min-height: 260px;
  /* 파스텔 대각선 그라데이션 — 연보라/연블루/연핑크가 낮은 채도로 은은하게 섞이는 톤 */
  background:
    radial-gradient(60% 130% at 15% 20%, rgba(199, 184, 245, 0.5), transparent 70%),
    radial-gradient(50% 120% at 85% 25%, rgba(168, 216, 240, 0.45), transparent 70%),
    radial-gradient(55% 130% at 60% 105%, rgba(245, 200, 224, 0.42), transparent 70%),
    linear-gradient(120deg, #f5f2fc 0%, #f0f6fc 55%, #faf1f7 100%);
}

/* 서브 페이지용 얇은 버전 */
.hero.compact {
  min-height: 140px;
}

.hero-inner {
  max-width: 1140px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 24px;
  box-sizing: border-box;
}

.hero-title {
  margin: 0;
  font-size: 44px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.25;
  color: #1e1b4b; /* 진한 남색 — 파스텔 배경 위 가독성 */
  white-space: pre-line; /* 타이틀 문자열의 \n을 줄바꿈으로 (모바일에선 추가 자동 줄바꿈) */
}
.compact .hero-title {
  font-size: 28px;
}

.hero-subtitle {
  margin: 12px 0 0;
  font-size: 18px;
  color: var(--color-text);
}
.compact .hero-subtitle {
  margin-top: 8px;
  font-size: 16px;
}

/* 모바일에선 타이틀만 한 단계 줄임 */
@media (max-width: 640px) {
  .hero-title {
    font-size: 32px;
  }
  .compact .hero-title {
    font-size: 24px;
  }
}
</style>
