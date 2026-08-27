<script setup>
defineProps({
  searchQuery: { type: String, default: '' },
})

const emit = defineEmits(['update-query'])
</script>

<template>
  <!-- el-input — clearable 붙이면 지우기(X) 버튼이 기본으로 달려 나옴 -->
  <!-- 여기도 v-model 대신 :model-value + @input 조합 -->
  <!-- → el-input은 한글 IME 조합 중에도 input 이벤트를 그대로 흘려보내줘서 즉시 동기화가 됨 -->
  <el-input
    class="search-input"
    :model-value="searchQuery"
    @input="(val) => emit('update-query', val)"
    placeholder="여행지 이름을 검색하세요"
    size="large"
    clearable
  >
    <template #prefix>🔍</template>
  </el-input>
</template>

<style scoped>
/* 라운드 정도만 기존 디자인(12px)에 맞춤 — 색/포커스 링은 테마 변수가 알아서 인디고로 */
.search-input {
  --el-border-radius-base: 12px;
}
</style>
