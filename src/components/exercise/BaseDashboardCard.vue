<script setup>
// 흰색 패널 디자인을 공통으로 쓰기 위한 래퍼 — 검색 영역이랑 날씨 현황 영역이 둘 다 이걸로 감싸짐
// 속은 el-card고, 우리 slot 구조(#header/기본)를 el-card의 slot에 그대로 이어붙이는 얇은 래퍼
defineProps({
  title: { type: String, default: '' },
})
</script>

<template>
  <el-card class="dashboard-card">
    <template #header>
      <div class="panel-head">
        <h2 v-if="title">{{ title }}</h2>
        <!-- 타이틀 오른쪽 영역 (토글 버튼 등 부모가 주입) -->
        <slot name="header" />
      </div>
    </template>
    <slot />
  </el-card>
</template>

<style scoped>
.dashboard-card {
  margin-bottom: 20px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.panel-head h2 {
  margin: 0;
  font-size: 1.15rem;
  color: #334155;
}
</style>
