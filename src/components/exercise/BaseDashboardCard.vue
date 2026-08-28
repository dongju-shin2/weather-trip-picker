<script setup>
// 예전엔 el-card 래퍼였는데, "카드 속 카드" 중첩을 없애면서 카드 없는 섹션으로 변경
// 섹션 제목은 페이지 배경 위 헤딩으로 직접 얹고, 콘텐츠(카드 그리드/검색창/폼)는 그 아래에
defineProps({
  title: { type: String, default: '' },
})
</script>

<template>
  <section class="dashboard-section">
    <div class="section-head">
      <h2 v-if="title">{{ title }}</h2>
      <!-- 타이틀 오른쪽 영역 (토글 버튼 등 부모가 주입) -->
      <slot name="header" />
    </div>
    <slot />
  </section>
</template>

<style scoped>
.dashboard-section {
  margin-bottom: 40px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}
.section-head h2 {
  margin: 0;
  font-size: 27px;
  font-weight: 700;
  color: var(--color-heading);
  line-height: 1.3;
}
</style>
