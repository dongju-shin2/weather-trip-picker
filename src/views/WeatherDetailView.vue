<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplayTemp } from '@/composables/useDisplayTemp'
import PageHero from '@/components/PageHero.vue'
import { iconFor } from '@/constants/weatherIcons'
import { CITIES } from '@/constants/cities'
import { fetchCurrentWeather, fetchForecast, fetchAirPollution, toStatus, toKoDescription, toAqiLabel } from '@/api/weatherApi'
import { fetchCitySummary } from '@/api/wikiApi'

const route = useRoute()   // URL의 :cityId 꺼내오기용
const router = useRouter() // 메인으로 돌아가기용

// 기온 표시용 composable — 헤더에서 단위를 바꾸면 여기 표시도 그대로 따라 바뀜
const { formatTemp } = useDisplayTemp()

// URL의 cityId로 도시 고정 정보(이름/좌표/위키 제목) 찾기
// 못 찾으면 null → API 호출 없이 바로 "데이터 없음" 분기 (주소창에 이상한 id 직접 친 경우)
const cityMeta = CITIES.find((c) => c.id === route.params.cityId) ?? null

// ===== API 응답 담을 상태들 =====
const current = ref(null)       // 현재 날씨 (기온/습도/풍속...)
const dailyForecast = ref([])   // 5일 예보 (하루 1개씩 추림)
const air = ref(null)           // 미세먼지
const wiki = ref(null)          // 위키백과 도시 소개
const isLoading = ref(false)
const loadError = ref('')

// 3시간 간격 40개 예보에서 "매일 정오" 것만 추려서 하루 1줄로
const pickDaily = (list) =>
  list
    .filter((item) => new Date(item.dt * 1000).getHours() === 12)
    .map((item) => ({
      dt: item.dt,
      // 1756266000 같은 유닉스 초 → "8. 28. (금)" 형태로
      label: new Date(item.dt * 1000).toLocaleDateString('ko-KR', {
        month: 'numeric',
        day: 'numeric',
        weekday: 'short',
      }),
      temp: Math.round(item.main.temp), // 섭씨 원본
      status: toStatus(item.weather[0]),             // 행 이모지 매핑용 대분류
      description: toKoDescription(item.weather[0]), // id 기준 자체 매핑 라벨
    }))

const load = async () => {
  isLoading.value = true
  loadError.value = ''
  try {
    // 날씨 3종은 전부 있어야 화면이 완성되니까 Promise.all로 병렬 + 한꺼번에 대기
    const [cur, fc, ap] = await Promise.all([
      fetchCurrentWeather(cityMeta.lat, cityMeta.lon),
      fetchForecast(cityMeta.lat, cityMeta.lon),
      fetchAirPollution(cityMeta.lat, cityMeta.lon),
    ])
    current.value = {
      temp: Math.round(cur.main.temp),            // 섭씨 원본 (표시 변환은 formatTemp가)
      feelsLike: Math.round(cur.main.feels_like), // 체감 온도 — 실제 API라서 이런 값도 공짜로 생김
      status: toStatus(cur.weather[0]),
      description: toKoDescription(cur.weather[0]), // API 번역("온흐림") 대신 id 기준 자체 매핑
      humidity: cur.main.humidity,
      wind: cur.wind.speed,
    }
    dailyForecast.value = pickDaily(fc.list)
    air.value = {
      aqi: ap.list[0].main.aqi,
      label: toAqiLabel(ap.list[0].main.aqi),
      pm25: ap.list[0].components.pm2_5,
      pm10: ap.list[0].components.pm10,
    }
  } catch {
    loadError.value = '기상 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
  } finally {
    isLoading.value = false
  }

  // 위키 소개는 부가 정보 — 실패해도 날씨 화면은 살아야 해서 try를 따로 뺌
  try {
    wiki.value = await fetchCitySummary(cityMeta.wikiTitle)
  } catch {
    wiki.value = null // 소개 카드만 조용히 숨김
  }
}

onMounted(() => {
  if (cityMeta) load() // 없는 도시면 호출 자체를 안 함
})

// 대기질 게이지(el-progress) 색 — aqi 1~2 좋음(초록), 3 주의(노랑), 4~5 나쁨(빨강)
const aqiStatus = computed(() => {
  if (!air.value) return 'success'
  if (air.value.aqi <= 2) return 'success'
  if (air.value.aqi === 3) return 'warning'
  return 'exception'
})
</script>

<template>
  <div class="container">
    <!-- 얇은 히어로 — 페이지 제목 포함, 홈과 같은 그라데이션 톤 -->
    <PageHero compact title="지역별 상세 기상 관측 정보" :subtitle="cityMeta ? cityMeta.fullName : ''" />

    <el-card class="detail-card">
      <!-- 0) URL에 이상한 cityId를 직접 쳐서 들어온 케이스 -->
      <el-empty
        v-if="!cityMeta"
        :description="`'${route.params.cityId}' 에 해당하는 관측 정보가 없습니다.`"
      />

      <!-- 1) 로딩 중 — 회색 뼈대 스켈레톤 -->
      <el-skeleton v-else-if="isLoading" :rows="8" animated />

      <!-- 2) 호출 실패 -->
      <div v-else-if="loadError" class="error-box">
        <el-alert :title="loadError" type="error" show-icon :closable="false" />
        <el-button type="primary" plain @click="load">다시 시도</el-button>
      </div>

      <!-- 3) 정상 케이스 -->
      <div v-else-if="current">
        <!-- 현재 날씨 요약 — 카드와 같은 매핑의 큰 이모지 + 도시명 + 상태·기온 -->
        <div class="current-head">
          <span class="current-emoji">{{ iconFor(current.status) }}</span>
          <div>
            <p class="current-city">{{ cityMeta.name }}</p>
            <p class="current-desc">{{ current.description }} · {{ formatTemp(current.temp) }}</p>
          </div>
        </div>

        <!-- 라벨-값 목록은 el-descriptions가 딱 그 용도의 컴포넌트 -->
        <el-descriptions :column="1" border>
          <el-descriptions-item label="지정 지역">{{ cityMeta.fullName }}</el-descriptions-item>
          <el-descriptions-item label="실시간 기온">
            {{ formatTemp(current.temp) }} (체감 {{ formatTemp(current.feelsLike) }})
          </el-descriptions-item>
          <el-descriptions-item label="기상 현황">{{ current.description }}</el-descriptions-item>
          <el-descriptions-item label="대기 습도(%)">{{ current.humidity }}%</el-descriptions-item>
          <el-descriptions-item label="현재 풍속(m/s)">{{ current.wind }}m/s</el-descriptions-item>
        </el-descriptions>

        <!-- 미세먼지 (OWM Air Pollution API) — 등급 태그 + 게이지 -->
        <div v-if="air" class="air-box">
          <div class="air-head">
            <span class="air-label">대기질 {{ air.label }}</span>
            <span class="air-detail">초미세먼지 {{ air.pm25 }} · 미세먼지 {{ air.pm10 }} ㎍/㎥</span>
          </div>
          <!-- aqi 1~5를 20~100% 게이지로 — 낮을수록 좋은 값 -->
          <el-progress :percentage="air.aqi * 20" :status="aqiStatus" :show-text="false" />
        </div>

        <!-- 5일 예보 (OWM Forecast API에서 매일 정오만 추림) — 리스트 대신 el-table -->
        <div v-if="dailyForecast.length" class="forecast">
          <h3 class="section-title">5일 예보 (정오 기준)</h3>
          <el-table :data="dailyForecast" size="small">
            <el-table-column prop="label" label="날짜" />
            <el-table-column label="날씨" align="center">
              <template #default="{ row }">
                <span class="fc-emoji">{{ iconFor(row.status) }}</span> {{ row.description }}
              </template>
            </el-table-column>
            <el-table-column label="기온" align="right">
              <!-- 예보 기온도 단위변경 즉시 반영 — 같은 formatTemp 사용 -->
              <template #default="{ row }">{{ formatTemp(row.temp) }}</template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 도시 소개 (위키백과 요약 API) — 실패했으면 이 카드만 조용히 빠짐 -->
        <div v-if="wiki" class="wiki-box">
          <h3 class="section-title">여행 전에 알아두기</h3>
          <!-- el-image: 로딩 중 placeholder + 클릭하면 크게 보기(preview)가 공짜로 생김 -->
          <el-image
            v-if="wiki.thumbnail"
            :src="wiki.thumbnail"
            :alt="cityMeta.name"
            :preview-src-list="[wiki.thumbnail]"
            fit="cover"
            class="wiki-img"
          />
          <p class="wiki-extract">{{ wiki.extract }}</p>
          <a v-if="wiki.pageUrl" :href="wiki.pageUrl" target="_blank" rel="noopener" class="wiki-link">위키백과에서 더 보기 ↗</a>
        </div>
      </div>

      <div class="back-row">
        <el-button type="primary" plain @click="router.push('/')">메인 대시보드로 돌아가기</el-button>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
/* 상세는 위→아래로 읽는 페이지라 본문 컨테이너(1140px) 안에서 720px로만 */
.container {
  max-width: 720px;
  margin: 0 auto;
}

/* 현재 날씨 요약 헤더 — 표 위쪽, 큰 이모지 */
.current-head {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}
.current-emoji {
  font-size: 56px;
  line-height: 1;
}
.current-city {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--color-heading);
}
.current-desc {
  margin: 4px 0 0;
  font-size: 16px;
  color: var(--color-text-sub);
}

/* 5일 예보 행 이모지 */
.fc-emoji {
  font-size: 19px;
  vertical-align: -2px;
}

/* 에러 알림 + 다시 시도 버튼 세로 배치 */
.error-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

/* 미세먼지 영역 */
.air-box {
  margin-top: 16px;
}
.air-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.air-label {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
}
.air-detail {
  font-size: 14px;
  color: var(--color-text-sub);
}

/* 5일 예보 / 위키 섹션 제목 */
.section-title {
  margin: 24px 0 12px;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-heading);
  line-height: 1.3;
}

/* 위키백과 도시 소개 */
.wiki-img {
  width: 100%;
  height: 220px;
  border-radius: 12px;
  display: block;
  margin-bottom: 10px;
}
.wiki-extract {
  margin: 0;
  font-size: 16px;
  color: var(--color-text);
  line-height: 1.7;
}
.wiki-link {
  display: inline-block;
  margin-top: 8px;
  font-size: 14px;
  color: #4f46e5;
  text-decoration: none;
  font-weight: 600;
}
.wiki-link:hover {
  text-decoration: underline;
}

.back-row {
  margin-top: 20px;
  text-align: center;
}
</style>
