<script setup>
defineProps({
  message: { type: String, default: '' },
})
</script>

<template>
  <!-- 하단 상태바 -->
  <div class="status-bar">
    {{ message || '카드를 클릭하거나 검색해 보세요.' }}
  </div>
</template>

<style scoped>
/* 하단 상태바 — 포인트 컬러(인디고)의 연한 톤 하나만 */
.status-bar {
  margin-top: 24px;
  padding: 16px;
  border-radius: 12px;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 16px;
  text-align: center;
}
</style>
