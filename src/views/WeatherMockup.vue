<script setup>
import { ref, computed, watch, watchEffect } from 'vue'

// ===== 과제2 요구사항 1: 반응형 상태 3개 =====
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

// status → 이모지
const icons = { 맑음: '☀️', 비: '🌧️', 구름: '☁️', 흐림: '🌫️' }

// 과제1 요구사항 3: v-model 안 쓰고 :value + @input으로 직접 처리
// → 한글 IME 조합 중 갱신 타이밍 확인 목적. v-model은 조합 끝나야 반영됨
const onInput = (e) => {
  searchQuery.value = e.target.value
}

// ===== 과제2 요구사항 2: 검색 필터 computed =====
// 검색어 비어있으면 전체 그대로, 있으면 includes로 부분 일치
const filteredWeatherList = computed(() => {
  const q = searchQuery.value.trim()
  if (!q) return weatherList.value
  return weatherList.value.filter((city) => city.name.includes(q))
})

// ===== 과제2 요구사항 3: watch vs watchEffect 구분 =====

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

// ===== 과제2 요구사항 5: 나만의 상태 / computed / watcher =====

// (1) 나만의 computed: 전체 도시 평균 기온
const avgTemp = computed(() => {
  const sum = weatherList.value.reduce((acc, city) => acc + city.temp, 0)
  return (sum / weatherList.value.length).toFixed(1)
})

// (2) 나만의 computed: 검색 결과 개수 (검색창 아래 표시용)
const resultCount = computed(() => filteredWeatherList.value.length)

// (3) 나만의 watcher: 검색 결과가 0개 되는 순간을 감지해서 로그
// computed(resultCount)도 watch 대상이 될 수 있다는 걸 확인해보고 싶었음
watch(resultCount, (count) => {
  if (count === 0) {
    console.log(`[내 watcher] '${searchQuery.value}' 검색 결과 0개 → 안내 문구가 표시됩니다`)
  }
})

// (4) 명소 보기 토글. 끄면 카드의 명소 줄이 사라짐 — 정적 데이터(spots)도 이걸로 반응형 흐름에 엮임
const showSpots = ref(true)

// (5) 즐겨찾기. 별 누르면 id를 넣었다 뺐다
const favorites = ref([])
const toggleFav = (id) => {
  favorites.value = favorites.value.includes(id)
    ? favorites.value.filter((f) => f !== id)
    : [...favorites.value, id]
}

// (6) 최고/최저 기온 도시 찾는 computed. reduce로 temp 제일 큰/작은 애 뽑기
const hottestId = computed(() =>
  weatherList.value.reduce((a, b) => (b.temp > a.temp ? b : a)).id
)
const coldestId = computed(() =>
  weatherList.value.reduce((a, b) => (b.temp < a.temp ? b : a)).id
)

// (7) 즐겨찾기 watcher. 몇 개 담겼는지 로그로 확인용
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
      <h1 class="title">🌦️ 과제 2: 날씨 (컴포지션)</h1>

      <!-- 검색 영역 (날씨 현황이랑 구분되게 흰 패널로) -->
      <section class="search-panel">
        <input
          class="search-input"
          type="text"
          :value="searchQuery"
          @input="onInput"
          placeholder="도시 이름을 검색하세요"
        />
        <!-- 과제1 요구사항 3: 입력값 실시간 출력 -->
        <p class="search-hint">검색 중인 도시: <strong>{{ searchQuery }}</strong></p>
        <!-- 과제2 요구사항 5: 나만의 computed 2개 표시 -->
        <p class="search-meta">
          검색 결과 <strong>{{ resultCount }}</strong>개 · 전체 평균 기온 <strong>{{ avgTemp }}℃</strong>
        </p>
      </section>

      <!-- 날씨 현황 영역 -->
      <section class="weather-panel">
        <div class="panel-head">
          <h2>지역별 날씨 현황</h2>
          <!-- 과제2 요구사항 5: 나만의 반응형 상태(명소 토글) -->
          <button class="unit-btn" @click="showSpots = !showSpots">
            {{ showSpots ? '📍 관광 명소 숨기기' : '📍 관광 명소 보기' }}
          </button>
        </div>

        <!-- ===== 과제2 요구사항 4: 세 가지 경우 분기 ===== -->

        <!-- 1) 검색어 없음 → 원본 전체 리스트 -->
        <div v-if="!searchQuery.trim()">
          <div
            v-for="city in weatherList"
            :key="city.id"
            class="card"
            :class="{ active: selectedCityInfo.startsWith(city.name) }"
            @click="selectCity(city.name)"
          >
            <div class="card-top">
              <span class="emoji">{{ icons[city.status] ?? '🌈' }}</span>
              <div class="card-info">
                <h3>
                  {{ city.name }} ({{ city.status }})
                  <!-- 최고/최저 기온 도시 강조 태그 -->
                  <span v-if="city.id === hottestId" class="temp-tag hottest">🔥 최고기온</span>
                  <span v-if="city.id === coldestId" class="temp-tag coldest">🧊 최저기온</span>
                </h3>
                <p class="status-text">현재 기온 {{ city.temp }}℃</p>
                <p v-if="showSpots" class="spots">📍 {{ city.spots.join(' · ') }}</p>
              </div>
              <!-- 과제1 요구사항 2: 25도 기준 배지 -->
              <span v-if="city.temp >= 25" class="badge hot">🔥 더움 (25도 이상)</span>
              <span v-else class="badge cool">❄️ 선선함 (25도 미만)</span>
              <!-- 즐겨찾기 별. 이것도 .stop 필수 — 안 그러면 카드 선택까지 같이 눌림 -->
              <button
                class="fav-btn"
                :class="{ on: favorites.includes(city.id) }"
                @click.stop="toggleFav(city.id)"
              >
                {{ favorites.includes(city.id) ? '★' : '☆' }}
              </button>
            </div>
            <!-- .stop 필수: 없으면 카드 클릭까지 같이 타서 상태바가 바뀌어버림 -->
            <button class="detail-btn" @click.stop="showDetail(city.name, city.status, city.spots)">상세보기</button>
          </div>
        </div>

        <!-- 2) 검색어 있고 매칭 결과 있음 → 필터링된 리스트 -->
        <!-- 카드 마크업이 위랑 중복인데, 컴포넌트 분리는 아직 안 배워서 일단 복붙 -->
        <div v-else-if="filteredWeatherList.length > 0">
          <div
            v-for="city in filteredWeatherList"
            :key="city.id"
            class="card"
            :class="{ active: selectedCityInfo.startsWith(city.name) }"
            @click="selectCity(city.name)"
          >
            <div class="card-top">
              <span class="emoji">{{ icons[city.status] ?? '🌈' }}</span>
              <div class="card-info">
                <h3>
                  {{ city.name }} ({{ city.status }})
                  <!-- 최고/최저 기온 도시 강조 태그 -->
                  <span v-if="city.id === hottestId" class="temp-tag hottest">🔥 최고기온</span>
                  <span v-if="city.id === coldestId" class="temp-tag coldest">🧊 최저기온</span>
                </h3>
                <p class="status-text">현재 기온 {{ city.temp }}℃</p>
                <p v-if="showSpots" class="spots">📍 {{ city.spots.join(' · ') }}</p>
              </div>
              <span v-if="city.temp >= 25" class="badge hot">🔥 더움 (25도 이상)</span>
              <span v-else class="badge cool">❄️ 선선함 (25도 미만)</span>
              <!-- 즐겨찾기 별. 이것도 .stop 필수 — 안 그러면 카드 선택까지 같이 눌림 -->
              <button
                class="fav-btn"
                :class="{ on: favorites.includes(city.id) }"
                @click.stop="toggleFav(city.id)"
              >
                {{ favorites.includes(city.id) ? '★' : '☆' }}
              </button>
            </div>
            <button class="detail-btn" @click.stop="showDetail(city.name, city.status, city.spots)">상세보기</button>
          </div>
        </div>

        <!-- 3) 매칭 결과 없음 -->
        <p v-else class="empty">검색 결과가 일치하는 도시가 없습니다 🥲</p>
      </section>

      <!-- 하단 상태바 -->
      <div class="status-bar">
        {{ selectedCityInfo || '카드를 클릭하거나 검색해 보세요.' }}
      </div>
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

/* 검색 패널 — 날씨 현황이랑 시각적으로 구분 */
.search-panel {
  background: #fff;
  border-radius: 16px;
  padding: 18px 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 14px rgba(30, 41, 59, 0.08);
}

.search-input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 1.1rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.search-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.search-hint {
  margin: 10px 4px 0;
  font-size: 1rem;
  color: #64748b;
}
.search-hint strong {
  color: #4f46e5;
}

.search-meta {
  margin: 6px 4px 0;
  font-size: 0.95rem;
  color: #64748b;
}
.search-meta strong {
  color: #4f46e5;
}

/* 날씨 현황 패널 */
.weather-panel {
  margin-bottom: 8px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding: 0 4px;
}
.panel-head h2 {
  margin: 0;
  font-size: 1.15rem;
  color: #334155;
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

/* 날씨 카드 */
.card {
  background: #fff;
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 14px;
  box-shadow: 0 4px 14px rgba(30, 41, 59, 0.08);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(30, 41, 59, 0.12);
}
/* 선택된 카드 표시 */
.card.active {
  border-color: #6366f1;
}

.card-top {
  display: flex;
  align-items: center;
  gap: 14px;
}

.emoji {
  font-size: 2.5rem;
}

.card-info {
  flex: 1;
}
.card-info h3 {
  margin: 0;
  font-size: 1.3rem;
  color: #0f172a;
}
.status-text {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 1rem;
}

/* 최고/최저 기온 강조 태그 */
.temp-tag {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  vertical-align: middle;
}
.temp-tag.hottest {
  background: #ffedd5;
  color: #ea580c;
}
.temp-tag.coldest {
  background: #e0f2fe;
  color: #0284c7;
}

/* 추천 명소 */
.spots {
  margin: 6px 0 0;
  font-size: 0.9rem;
  color: #94a3b8;
}

/* 즐겨찾기 별 버튼 */
.fav-btn {
  border: none;
  background: none;
  font-size: 1.5rem;
  color: #cbd5e1;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s, transform 0.2s;
}
.fav-btn:hover {
  transform: scale(1.2);
}
.fav-btn.on {
  color: #f59e0b;
}

/* 더움/선선함 배지 */
.badge {
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}
.badge.hot {
  background: #fee2e2;
  color: #dc2626;
}
.badge.cool {
  background: #dbeafe;
  color: #2563eb;
}

.detail-btn {
  margin-top: 14px;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.detail-btn:hover {
  background: #e0e7ff;
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
