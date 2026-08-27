<script setup>
// "목적지를 정하고 날씨를 또 찾아보는" 순서를 뒤집은 패널 — 날짜를 먼저 고르면 도시들이 좋은 순서로 줄을 섬
// 홈에서만 쓰는 기능 블록이지만 재사용 부품(exercise/)은 아니라서 components/ 바로 아래에 둠
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import { CITIES } from '@/constants/cities'
import { useForecasts, toDateKey } from '@/composables/useForecasts'
import { useDisplayTemp } from '@/composables/useDisplayTemp'

const router = useRouter()
const { isLoading, loadError, loadForecasts, getDayForecast } = useForecasts()
const { formatTemp } = useDisplayTemp()

const pickedDate = ref(null)

// 무료 예보 범위가 오늘~4일 뒤(5일치)라서 그 밖 날짜는 달력에서 아예 못 고르게 막음
const disabledDate = (date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const max = new Date(today)
  max.setDate(max.getDate() + 4)
  return date < today || date > max
}

// 예보 5도시분은 무거워서 미리 안 받고, 날짜를 고르는 순간에 받음 (받아둔 게 있으면 스킵)
const onPick = (val) => {
  if (val) loadForecasts()
}

// 여행하기 좋은 날씨 순위 — 숫자가 작을수록 좋음
const statusRank = { 맑음: 0, 구름: 1, 흐림: 2, 눈: 3, 비: 4 }

// 고른 날짜의 도시별 예보를 "좋은 순서"로 정렬
// 1순위 날씨(맑음 > 구름 > ...), 동순위면 걷기 좋은 기온(24℃)에 가까운 순
const comparison = computed(() => {
  if (!pickedDate.value) return []
  const key = toDateKey(pickedDate.value)
  return CITIES.map((c) => ({ ...c, forecast: getDayForecast(c.id, key) }))
    .filter((c) => c.forecast)
    .sort((a, b) => {
      const rankDiff = statusRank[a.forecast.status] - statusRank[b.forecast.status]
      return rankDiff !== 0 ? rankDiff : Math.abs(a.forecast.temp - 24) - Math.abs(b.forecast.temp - 24)
    })
})
</script>

<template>
  <BaseDashboardCard title="이 날짜엔 어디가 좋을까?">
    <!-- 핵심 기능이라 제목 아래 큰 입력으로 — 좌측 정렬, 클릭 가능한 요소임이 분명하게 -->
    <el-date-picker
      v-model="pickedDate"
      class="date-input"
      type="date"
      placeholder="여행 날짜 선택"
      :disabled-date="disabledDate"
      @change="onPick"
    />

    <!-- 안내 문구는 카드 없이 입력 필드 바로 아래 보조 텍스트로 -->
    <p v-if="!pickedDate" class="hint">
      날짜를 고르면 5개 도시의 그 날 예보를 여행하기 좋은 순서로 보여드려요 (무료 예보 범위: 오늘부터 5일)
    </p>

    <!-- 날짜 선택 후 결과 — 얇은 테두리 카드 한 겹 (섹션 자체는 카드가 아님) -->
    <div v-if="pickedDate" class="panel-card">
      <el-skeleton v-if="isLoading" :rows="3" animated />
      <div v-else-if="loadError" class="error-box">
        <el-alert :title="loadError" type="error" show-icon :closable="false" />
        <el-button type="primary" plain @click="loadForecasts(true)">다시 시도</el-button>
      </div>
      <ul v-else class="compare-list">
        <li v-for="(city, idx) in comparison" :key="city.id">
          <span class="rank">{{ idx + 1 }}</span>
          <span class="name">{{ city.name }}</span>
          <span class="status">{{ city.forecast.description }} · {{ formatTemp(city.forecast.temp) }}</span>
          <span v-if="idx === 0" class="best-note">여기 어때요?</span>
          <el-button size="small" text type="primary" @click="router.push('/weather/' + city.id)">상세보기</el-button>
        </li>
      </ul>
    </div>
  </BaseDashboardCard>
</template>

<style scoped>
/* ===== 날짜 선택 입력 — 핵심 기능이라 크게 ===== */
.date-input {
  /* Element Plus 날짜 입력 폭/hover 보더는 CSS 변수로 제어 */
  --el-date-editor-width: 360px;
  --el-input-hover-border-color: #4f46e5;
  max-width: 100%;
  height: 54px;
}
/* 내부 래퍼(흰 배경 + 1px 보더 역할의 inset shadow)를 같이 키움 */
.date-input :deep(.el-input__wrapper) {
  height: 54px;
  padding: 0 16px;
  border-radius: 10px;
  background: #fff;
}
.date-input :deep(.el-input__inner) {
  font-size: 17px;
  height: 100%;
}
.date-input :deep(.el-input__inner::placeholder) {
  font-size: 17px;
}
.date-input :deep(.el-input__icon) {
  font-size: 18px;
}

/* 카드 한 겹 — 테두리만 쓰고 그림자는 안 씀 (둘 중 하나만) */
.panel-card {
  margin-top: 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 20px;
}

/* 입력 필드 바로 아래 보조 안내 문구 */
.hint {
  margin: 10px 0 0;
  color: var(--color-text-sub);
  font-size: 14px;
}

.error-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.compare-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.compare-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 4px;
  border-bottom: 1px solid #f1f5f9;
}
.compare-list li:last-child {
  border-bottom: none;
}

.rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.name {
  font-weight: 600;
  font-size: 16px;
  color: var(--color-heading);
}
.status {
  color: var(--color-text-sub);
  font-size: 15px;
  flex: 1;
}

/* 1위 도시 추천 문구 — 배지 대신 포인트 컬러 텍스트 */
.best-note {
  color: #4f46e5;
  font-size: 14px;
  font-weight: 600;
}
</style>
