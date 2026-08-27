<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import StatusBar from '@/components/exercise/StatusBar.vue'

// ===== 화면을 움직이는 기본 상태들 =====
const searchQuery = ref('')       // 검색어
const selectedCityInfo = ref('')  // 상태바에 뿌릴 선택 문구 (비어있으면 초기 안내)
// 날씨 데이터. key는 index 말고 id로 (정렬/삭제 시 꼬이는 거 방지)
// spots: 날씨 보고 여행지 고르라고 도시별 추천 명소 2개씩
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음', spots: ['경복궁', 'N서울타워'] },
  { id: 'city_02', name: '수원', temp: 24, status: '비', spots: ['수원화성', '광교호수공원'] },
  { id: 'city_03', name: '부산', temp: 26, status: '구름', spots: ['해운대', '감천문화마을'] },
  { id: 'city_04', name: '인천', temp: 23, status: '흐림', spots: ['월미도', '차이나타운'] },
  { id: 'city_05', name: '제주', temp: 27, status: '맑음', spots: ['성산일출봉', '협재해수욕장'] },
])

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
const avgTemp = computed(() => {
  const sum = weatherList.value.reduce((acc, city) => acc + city.temp, 0)
  return (sum / weatherList.value.length).toFixed(1)
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

// 즐겨찾기. 별 누르면 id를 넣었다 뺐다
const favorites = ref([])
const toggleFav = (id) => {
  favorites.value = favorites.value.includes(id)
    ? favorites.value.filter((f) => f !== id)
    : [...favorites.value, id]
}

// 최고/최저 기온 도시 찾는 computed. reduce로 temp 제일 큰/작은 애 뽑기
const hottestId = computed(() =>
  weatherList.value.reduce((a, b) => (b.temp > a.temp ? b : a)).id
)
const coldestId = computed(() =>
  weatherList.value.reduce((a, b) => (b.temp < a.temp ? b : a)).id
)

// 즐겨찾기 watcher. 몇 개 담겼는지 로그로 확인용
watch(favorites, (list) => {
  console.log(`[내 watcher] 즐겨찾기 ${list.length}개: ${list.join(', ') || '(없음)'}`)
})

const selectCity = (name) => {
  selectedCityInfo.value = `${name}이 선택되었습니다.`
}

// 명소까지 같이 보여주게 spots 인자 추가
const showDetail = (cityName, status, spots) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.\n📍 추천 명소: ${spots.join(', ')}`)
}
</script>

<template>
  <div class="page">
    <div class="container">
      <h1 class="title">🌦️ 과제 3: 날씨 (컴포넌트)</h1>

      <!-- slot으로 전달되는 SearchBar/WeatherCard는 시각적으로는 BaseDashboardCard 내부에 있지만,
           부모 스코프에서 컴파일되므로 부모의 상태/메서드와 직접 바인딩 가능 -->

      <!-- 검색 영역 (날씨 현황이랑 구분되게 흰 패널로) -->
      <BaseDashboardCard title="🔍 도시 검색 (한글 즉시 동기화)">
        <SearchBar :search-query="searchQuery" @update-query="searchQuery = $event" />
        <!-- 결과 개수 · 평균 기온. 부모 computed를 그대로 쓰는 줄이라 SearchBar에 안 넣고 여기 둠 -->
        <p class="search-meta">
          검색 결과 <strong>{{ resultCount }}</strong>개 · 전체 평균 기온 <strong>{{ avgTemp }}℃</strong>
        </p>
      </BaseDashboardCard>

      <!-- 날씨 현황 영역 -->
      <BaseDashboardCard title="지역별 날씨 현황">
        <template #header>
          <!-- 명소 보기 토글. showSpots를 직접 뒤집는 버튼이라 부모가 소유 -->
          <button class="unit-btn" @click="showSpots = !showSpots">
            {{ showSpots ? '📍 관광 명소 숨기기' : '📍 관광 명소 보기' }}
          </button>
        </template>

        <!-- ===== 검색 상태에 따라 세 가지 경우로 분기 ===== -->

        <!-- 1) 검색어 없음 → 원본 전체 리스트 -->
        <div v-if="!searchQuery.trim()">
          <WeatherCard
            v-for="city in weatherList"
            :key="city.id"
            :city="city"
            :show-spots="showSpots"
            :is-favorite="favorites.includes(city.id)"
            :is-active="selectedCityInfo.startsWith(city.name)"
            :is-hottest="city.id === hottestId"
            :is-coldest="city.id === coldestId"
            @select-card="selectCity($event.name)"
            @click-detail="showDetail($event.name, $event.status, $event.spots)"
            @toggle-favorite="toggleFav($event)"
          />
        </div>

        <!-- 2) 검색어 있고 매칭 결과 있음 → 필터링된 리스트 -->
        <div v-else-if="filteredWeatherList.length > 0">
          <WeatherCard
            v-for="city in filteredWeatherList"
            :key="city.id"
            :city="city"
            :show-spots="showSpots"
            :is-favorite="favorites.includes(city.id)"
            :is-active="selectedCityInfo.startsWith(city.name)"
            :is-hottest="city.id === hottestId"
            :is-coldest="city.id === coldestId"
            @select-card="selectCity($event.name)"
            @click-detail="showDetail($event.name, $event.status, $event.spots)"
            @toggle-favorite="toggleFav($event)"
          />
        </div>

        <!-- 3) 매칭 결과 없음 -->
        <p v-else class="empty">검색 결과가 일치하는 도시가 없습니다 🥲</p>
      </BaseDashboardCard>

      <!-- 하단 상태바 -->
      <StatusBar :message="selectedCityInfo" />
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(160deg, #e0f2fe 0%, #ede9fe 60%, #fce7f3 100%);
  padding: 40px 16px;
  box-sizing: border-box;
}

.container {
  max-width: 480px;
  margin: 0 auto;
}

.title {
  text-align: center;
  font-size: 1.8rem;
  color: #1e293b;
  margin-bottom: 24px;
}

.search-meta {
  margin: 6px 4px 0;
  font-size: 0.95rem;
  color: #64748b;
}
.search-meta strong {
  color: #4f46e5;
}

.unit-btn {
  padding: 6px 12px;
  border: 1px solid #c7d2fe;
  border-radius: 999px;
  background: #fff;
  color: #4f46e5;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.unit-btn:hover {
  background: #eef2ff;
}

/* 검색 결과 없음 — 눈에 띄되 부드럽게 */
.empty {
  text-align: center;
  color: #7c6f9f;
  background: rgba(255, 255, 255, 0.6);
  border: 1px dashed #c4b5fd;
  border-radius: 16px;
  padding: 32px 16px;
  font-size: 1.05rem;
}
</style>
