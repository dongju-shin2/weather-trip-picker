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
/* 하단 상태바 */
.status-bar {
  margin-top: 24px;
  padding: 14px 18px;
  border-radius: 12px;
  background: rgba(99, 102, 241, 0.1);
  color: #4338ca;
  font-size: 1.05rem;
  text-align: center;
}
</style>
