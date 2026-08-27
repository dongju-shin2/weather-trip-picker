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

const icons = { 맑음: '☀️', 비: '🌧️', 구름: '☁️', 흐림: '🌫️', 눈: '❄️' }

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
  <BaseDashboardCard title="📅 이 날짜엔 어디가 좋을까?">
    <template #header>
      <el-date-picker
        v-model="pickedDate"
        type="date"
        placeholder="여행 날짜 선택"
        :disabled-date="disabledDate"
        @change="onPick"
      />
    </template>

    <!-- 날짜 선택 전 → 안내 / 로딩 / 실패 / 비교 결과 순으로 분기 -->
    <p v-if="!pickedDate" class="hint">
      날짜를 고르면 5개 도시의 그 날 예보를 여행하기 좋은 순서로 보여드려요 (무료 예보 범위: 오늘부터 5일)
    </p>
    <el-skeleton v-else-if="isLoading" :rows="3" animated />
    <div v-else-if="loadError" class="error-box">
      <el-alert :title="loadError" type="error" show-icon :closable="false" />
      <el-button type="primary" plain @click="loadForecasts(true)">다시 시도</el-button>
    </div>
    <ul v-else class="compare-list">
      <li v-for="(city, idx) in comparison" :key="city.id">
        <span class="rank">{{ idx + 1 }}</span>
        <span class="emoji">{{ icons[city.forecast.status] ?? '🌈' }}</span>
        <span class="name">{{ city.name }}</span>
        <span class="status">{{ city.forecast.status }} · {{ formatTemp(city.forecast.temp) }}</span>
        <el-tag v-if="idx === 0" type="success" size="small" round>여기 어때요?</el-tag>
        <el-button size="small" text type="primary" @click="router.push('/weather/' + city.id)">상세보기</el-button>
      </li>
    </ul>
  </BaseDashboardCard>
</template>

<style scoped>
.hint {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
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
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.emoji {
  font-size: 1.3rem;
}
.name {
  font-weight: 600;
  color: #0f172a;
}
.status {
  color: #64748b;
  font-size: 0.9rem;
  flex: 1;
}
</style>
