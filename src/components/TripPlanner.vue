<script setup>
// "내 여행" 패널 — 목적지+기간(당일치기~n박)을 등록해두면 앱이 기억하고 있다가,
// 예보 범위(여행 5일 전)에 들어오는 순간 일차별 예보를 자동으로 보여줌
// 이 앱을 만든 이유(목적지 정하고 날씨를 매번 또 찾아보는 귀찮음)를 정면으로 푸는 기능
import { ref, computed, onMounted } from 'vue'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import { CITIES } from '@/constants/cities'
import { useTripStore } from '@/stores/tripStore'
import { useForecasts, toDateKey } from '@/composables/useForecasts'
import { useDisplayTemp } from '@/composables/useDisplayTemp'

const tripStore = useTripStore()
const { isLoading, loadForecasts, getDayForecast } = useForecasts()
const { formatTemp } = useDisplayTemp()

// 등록 폼 상태 (스토어에 저장하기 전까지만 쓰는 로컬 상태라 ref로 충분)
const formCityId = ref(CITIES[0].id)
const formDates = ref(null) // daterange 모드라 [시작 Date, 종료 Date] 배열이 들어옴

const icons = { 맑음: '☀️', 비: '🌧️', 구름: '☁️', 흐림: '🌫️', 눈: '❄️' }

const tripCity = computed(() => CITIES.find((c) => c.id === tripStore.cityId) ?? null)

// 오늘 기준 며칠 뒤인지 (예보 범위 판정용)
const dayOffset = (dateKey) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((new Date(dateKey + 'T00:00:00') - today) / (1000 * 60 * 60 * 24))
}

// D-day 라벨 — 기간 여행이라 "여행 중" 상태가 새로 생김 (시작일은 지났는데 종료일은 안 지난 경우)
const ddayLabel = computed(() => {
  const start = tripStore.dday
  const end = dayOffset(tripStore.endDate)
  if (end < 0) return '지난 여행'
  if (start > 0) return `D-${start}`
  if (start === 0) return 'D-Day!'
  return '여행 중'
})

// 여행 일차별 예보 — 각 날짜가 예보 범위(오늘~4일 뒤)에 들어왔는지 하루씩 판정
// 2박 3일이면 첫날만 범위에 들어오고 나머진 대기 중일 수도 있어서 일 단위로 봐야 함
const tripDays = computed(() =>
  tripStore.days.map((key, i) => {
    const offset = dayOffset(key)
    const inRange = offset >= 0 && offset <= 4
    return {
      key,
      label: `${i + 1}일차`,
      date: key.slice(5).replace('-', '.'), // '2026-09-10' → '09.10'
      inRange,
      forecast: inRange ? getDayForecast(tripStore.cityId, key) : null,
    }
  })
)
const anyInRange = computed(() => tripDays.value.some((d) => d.inRange))

// 새로고침으로 다시 들어왔을 때, 등록된 여행이 이미 범위 안이면 바로 예보 로딩
onMounted(() => {
  if (anyInRange.value) loadForecasts()
})

// 등록은 미래 날짜면 얼마든지 (2주 뒤도 OK — 그때까진 D-day만 세다가 5일 전부터 예보가 뜸)
const disabledDate = (date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

const saveTrip = () => {
  if (!formDates.value) return
  const [start, end] = formDates.value
  tripStore.setTrip(formCityId.value, toDateKey(start), toDateKey(end))
  if (anyInRange.value) loadForecasts()
}
</script>

<template>
  <BaseDashboardCard title="🧳 내 여행">
    <!-- 아직 등록 전 → 목적지 + 기간 등록 폼 -->
    <div v-if="!tripStore.hasTrip" class="trip-form">
      <el-select v-model="formCityId" class="city-select">
        <el-option v-for="c in CITIES" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>
      <!-- daterange: 시작~종료를 한 번에. 당일치기는 같은 날을 두 번 클릭 -->
      <el-date-picker
        v-model="formDates"
        type="daterange"
        start-placeholder="가는 날"
        end-placeholder="오는 날"
        :disabled-date="disabledDate"
      />
      <el-button type="primary" @click="saveTrip">등록</el-button>
      <p class="hint">
        여행지와 기간을 등록해두면 여행 5일 전부터 일차별 예보를 여기서 바로 보여드려요. (당일치기는 가는 날 = 오는 날)
      </p>
    </div>

    <!-- 등록 후 → D-day + 기간 + (범위 안이면) 일차별 예보 -->
    <div v-else class="trip-info">
      <p class="trip-title">
        <strong>{{ tripCity?.name }}</strong> {{ tripStore.durationLabel }} 여행
        <el-tag :type="ddayLabel === '지난 여행' ? 'info' : 'primary'" round>{{ ddayLabel }}</el-tag>
        <span class="trip-date">{{ tripStore.startDate }} ~ {{ tripStore.endDate }}</span>
      </p>

      <el-skeleton v-if="anyInRange && isLoading" :rows="2" animated />
      <ul v-else-if="anyInRange" class="day-list">
        <li v-for="d in tripDays" :key="d.key">
          <span class="day-label">{{ d.label }} ({{ d.date }})</span>
          <span v-if="d.forecast" class="day-forecast">
            {{ icons[d.forecast.status] ?? '🌈' }} {{ d.forecast.status }} · {{ formatTemp(d.forecast.temp) }}
          </span>
          <span v-else class="day-wait">예보 대기 (5일 전부터)</span>
        </li>
      </ul>
      <p v-else-if="ddayLabel === '지난 여행'" class="hint">여행이 끝났어요. 다음 여행을 등록해 보세요!</p>
      <p v-else class="hint">아직 예보 범위 밖이에요. 여행 5일 전부터 일차별 예보가 자동으로 표시됩니다.</p>

      <el-button size="small" plain @click="tripStore.clearTrip()">여행 변경/삭제</el-button>
    </div>
  </BaseDashboardCard>
</template>

<style scoped>
.trip-form {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.city-select {
  width: 110px;
}
.hint {
  margin: 0 0 10px;
  width: 100%;
  color: #64748b;
  font-size: 0.9rem;
}
.trip-form .hint {
  margin-bottom: 0;
}

.trip-title {
  margin: 0 0 10px;
  font-size: 1.05rem;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.trip-date {
  color: #64748b;
  font-size: 0.9rem;
}

/* 일차별 예보 줄 */
.day-list {
  list-style: none;
  padding: 0;
  margin: 0 0 10px;
}
.day-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 4px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.95rem;
}
.day-list li:last-child {
  border-bottom: none;
}
.day-label {
  color: #64748b;
}
.day-forecast {
  color: #334155;
  font-weight: 600;
}
.day-wait {
  color: #94a3b8;
  font-size: 0.85rem;
}
</style>
