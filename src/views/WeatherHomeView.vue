<script setup>
import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import StatusBar from '@/components/exercise/StatusBar.vue'
import TripPlanner from '@/components/TripPlanner.vue'
import DateComparePanel from '@/components/DateComparePanel.vue'
import { useFavorites } from '@/composables/useFavorites'
import { useWeather } from '@/composables/useWeather'
import { useConfigStore } from '@/stores/configStore'
import { useTripStore } from '@/stores/tripStore'

const router = useRouter() // 페이지 이동(push/replace)용
const route = useRoute()   // 현재 URL 정보(query) 읽기용

// 단위 설정 스토어 — 평균 기온 표시에 쓸 기호/변환 공식용 (카드 내부는 카드가 알아서 씀)
const configStore = useConfigStore()

// 여행 등록 여부에 따라 내 여행 패널 위치를 바꾸기 위해 (등록 후엔 맨 위, 등록 전엔 맨 아래)
const tripStore = useTripStore()

// ===== 화면을 움직이는 기본 상태들 =====
const searchQuery = ref('')       // 검색어
const selectedCityInfo = ref('')  // 상태바에 뿌릴 선택 문구 (비어있으면 초기 안내)

// 날씨 데이터는 OpenWeatherMap 실시간 호출로 받아옴
// useFavorites처럼 composable(useWeather)로 빼서 즐겨찾기 페이지랑 같은 목록 하나를 공유
const { weatherList, isLoading, loadError, loadWeather } = useWeather()

// ===== 검색어 ↔ URL 쿼리 동기화 (단방향으로만!) =====

// 검색어 → URL 방향. 입력 이벤트가 들어올 때만 URL을 갱신한다.
// q는 replace로만 반영 — push로 하면 글자 칠 때마다 뒤로가기 기록이 한 글자씩 쌓임
const updateQuery = (val) => {
  searchQuery.value = val
  // 빈 문자열이면 ?q= 자체를 지워서 URL 깔끔하게
  router.replace({ query: val.trim() ? { q: val } : {} })
}

// URL → 검색어 방향은 mount 때 딱 1회만 (새로고침해도 검색 상태 살아있게)
// route.query를 watch로 되쓰면 검색어→URL→watch→검색어… 무한 되먹임 나니까 절대 양방향으로 안 묶음
onMounted(() => {
  if (route.query.q) searchQuery.value = String(route.query.q)
  loadWeather() // 실제 날씨 불러오기 (이미 받아온 상태면 composable이 알아서 스킵)
})

// ===== 검색 필터 =====
// 검색어 비어있으면 전체 그대로, 있으면 includes로 부분 일치
const filteredWeatherList = computed(() => {
  const q = searchQuery.value.trim()
  if (!q) return weatherList.value
  return weatherList.value.filter((city) => city.name.includes(q))
})

// ===== watch vs watchEffect — 상황별로 뭘 쓰는 게 맞는지 =====

// selectedCityInfo는 watch로.
// "이 값 하나"만 콕 집어서 감시하면 되는 케이스라 대상을 명시하는 watch가 맞음.
// watch는 값이 실제로 바뀌기 전엔 실행 안 되니까, 첫 로드 때(빈 문자열) 쓸데없는 로그도 안 찍힘
watch(selectedCityInfo, (newVal) => {
  console.log(`[watch 감지] 상태 바 문구가 업데이트되었습니다 -> "${newVal}"`)
})

// searchQuery는 watchEffect로.
// 콜백 안에서 읽은 반응형 값을 알아서 의존성으로 추적해줌 → 감시 대상 지정이 필요 없음.
// 시작하자마자 1번 실행되는 것도 "초기 상태 기준으로 일단 한 번 필터링" 느낌이라 여기선 자연스러움
watchEffect(() => {
  console.log(`[watchEffect 자동 호출] 현재 검색어 '${searchQuery.value}'에 매칭되는 API 데이터를 필터링합니다`)
})

// ===== 여기서부턴 직접 추가해 본 상태 / computed / watcher =====

// 전체 도시 평균 기온. 검색창 아래 표시용
// 원본은 섭씨로 평균 내고, 화씨 모드일 땐 스토어 convert로 변환해서 표시만 바꿈
const avgTemp = computed(() => {
  if (!weatherList.value.length) return '-' // API 응답 오기 전엔 빈 배열이라 0으로 나누기 방지
  const sum = weatherList.value.reduce((acc, city) => acc + city.temp, 0)
  const avgC = sum / weatherList.value.length
  // 섭씨는 소수 1자리 유지, 화씨는 convert가 반올림 정수로 돌려줌
  return configStore.unit === 'celsius' ? avgC.toFixed(1) : configStore.convert(avgC)
})

// 검색 결과 개수 (검색창 아래 표시용)
const resultCount = computed(() => filteredWeatherList.value.length)

// 검색 결과가 0개 되는 순간을 감지해서 로그
// computed(resultCount)도 watch 대상이 될 수 있다는 걸 확인해보고 싶었음
watch(resultCount, (count) => {
  if (count === 0) {
    console.log(`[내 watcher] '${searchQuery.value}' 검색 결과 0개 → 안내 문구가 표시됩니다`)
  }
})

// 명소 보기 토글. 끄면 카드의 명소 줄이 사라짐 — 정적 데이터(spots)도 이걸로 반응형 흐름에 엮임
const showSpots = ref(true)

// 즐겨찾기 — 즐겨찾기 페이지(/favorites)에서도 봐야 해서 컴포넌트 밖 composable로 뺐음
const { favorites, toggleFav } = useFavorites()

// 최고/최저 기온 도시 찾는 computed. reduce로 temp 제일 큰/작은 애 뽑기
// 빈 배열에 초기값 없는 reduce를 돌리면 에러 나서, 로딩 전엔 null
const hottestId = computed(() =>
  weatherList.value.length ? weatherList.value.reduce((a, b) => (b.temp > a.temp ? b : a)).id : null
)
const coldestId = computed(() =>
  weatherList.value.length ? weatherList.value.reduce((a, b) => (b.temp < a.temp ? b : a)).id : null
)

// 즐겨찾기 watcher. 몇 개 담겼는지 로그로 확인용
watch(favorites, (list) => {
  console.log(`[내 watcher] 즐겨찾기 ${list.length}개: ${list.join(', ') || '(없음)'}`)
})

const selectCity = (name) => {
  selectedCityInfo.value = `${name}이 선택되었습니다.`
}

// alert 대신 상세 페이지로 넘기기 — id만 있으면 되니까 문자열 push로 처리
// city.id('city_01' 형태)를 가공 없이 그대로 붙여야 상세 쪽 find랑 맞아떨어짐
const showDetail = (city) => {
  router.push('/weather/' + city.id)
}
</script>

<template>
  <div class="container">
    <!-- slot으로 전달되는 SearchBar/WeatherCard는 시각적으로는 BaseDashboardCard 내부에 있지만,
         부모 스코프에서 컴파일되므로 부모의 상태/메서드와 직접 바인딩 가능 -->

    <!-- 등록된 여행이 있으면 D-day 카드가 첫눈에 보이게 맨 위 (등록 전 폼은 맨 아래에) -->
    <TripPlanner v-if="tripStore.hasTrip" />

    <!-- 핵심 기능 — 부제("날짜만 고르면...")가 가리키는 패널이라 제일 먼저 -->
    <DateComparePanel />

    <!-- 날씨 현황 영역. 검색은 이 목록을 거르는 도구라 같은 카드 안에 둠 -->
    <BaseDashboardCard title="🗺️ 지금 여러 여행지 날씨">
      <template #header>
        <!-- 명소 보기 토글. showSpots를 직접 뒤집는 버튼이라 부모가 소유 -->
        <el-button size="small" round plain @click="showSpots = !showSpots">
          {{ showSpots ? '📍 관광 명소 숨기기' : '📍 관광 명소 보기' }}
        </el-button>
      </template>

      <!-- 입력 이벤트 하나로 검색어 갱신 + URL 반영까지 (updateQuery 안에서 처리) -->
      <SearchBar :search-query="searchQuery" @update-query="updateQuery($event)" />
      <!-- 결과 개수 · 평균 기온. 부모 computed를 그대로 쓰는 줄이라 SearchBar에 안 넣고 여기 둠 -->
      <p class="search-meta">
        검색 결과 <strong>{{ resultCount }}</strong>개 · 전체 평균 기온 <strong>{{ avgTemp }}{{ configStore.unitSymbol }}</strong>
      </p>

      <!-- ===== API 상태(로딩/실패) 먼저 분기하고, 그다음 검색 상태로 분기 ===== -->

      <!-- 0) 로딩 중 — el-skeleton: 카드 자리에 회색 뼈대가 깜빡이는 로딩 UI -->
      <el-skeleton v-if="isLoading" :rows="6" animated />

      <!-- 0-2) 호출 실패 — 다시 시도 버튼으로 loadWeather(force) 재호출 -->
      <div v-else-if="loadError" class="error-box">
        <el-alert :title="loadError" type="error" show-icon :closable="false" />
        <el-button type="primary" plain @click="loadWeather(true)">다시 시도</el-button>
      </div>

      <!-- 1) 검색어 없음 → 원본 전체 리스트 -->
      <!-- el-row/el-col 반응형 그리드: 한 줄이 24칸이라 md(데스크톱)에선 12칸씩 2열, xs(모바일)에선 24칸 1열 -->
      <div v-else-if="!searchQuery.trim()">
        <el-row :gutter="16">
          <el-col v-for="city in weatherList" :key="city.id" :xs="24" :md="12">
            <WeatherCard
              :city="city"
              :show-spots="showSpots"
              :is-favorite="favorites.includes(city.id)"
              :is-active="selectedCityInfo.startsWith(city.name)"
              :is-hottest="city.id === hottestId"
              :is-coldest="city.id === coldestId"
              @select-card="selectCity($event.name)"
              @click-detail="showDetail($event)"
              @toggle-favorite="toggleFav($event)"
            />
          </el-col>
        </el-row>
      </div>

      <!-- 2) 검색어 있고 매칭 결과 있음 → 필터링된 리스트 -->
      <div v-else-if="filteredWeatherList.length > 0">
        <el-row :gutter="16">
          <el-col v-for="city in filteredWeatherList" :key="city.id" :xs="24" :md="12">
            <WeatherCard
              :city="city"
              :show-spots="showSpots"
              :is-favorite="favorites.includes(city.id)"
              :is-active="selectedCityInfo.startsWith(city.name)"
              :is-hottest="city.id === hottestId"
              :is-coldest="city.id === coldestId"
              @select-card="selectCity($event.name)"
              @click-detail="showDetail($event)"
              @toggle-favorite="toggleFav($event)"
            />
          </el-col>
        </el-row>
      </div>

      <!-- 3) 매칭 결과 없음 — el-empty가 일러스트까지 그려줌 -->
      <el-empty v-else description="검색 결과가 일치하는 도시가 없습니다 🥲" />
    </BaseDashboardCard>

    <!-- 등록 전 내 여행 폼은 여정의 마지막 단계(고르고 나서 등록)라 맨 아래 -->
    <TripPlanner v-if="!tripStore.hasTrip" />

    <!-- 하단 상태바 -->
    <StatusBar :message="selectedCityInfo" />
  </div>
</template>

<style scoped>
/* 배경 그라데이션은 App.vue로 올라갔으니 여기선 컨텐츠 폭만 잡음 */
/* 데스크톱에서 좌우 여백이 너무 남아서 480 → 960으로 넓힘 (카드가 2열로 깔리는 폭) */
.container {
  max-width: 960px;
  margin: 0 auto;
}

.search-meta {
  margin: 6px 4px 14px;
  font-size: 0.95rem;
  color: #64748b;
}
.search-meta strong {
  color: #4f46e5;
}

/* 에러 알림 + 다시 시도 버튼 세로 배치 */
.error-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}
</style>
