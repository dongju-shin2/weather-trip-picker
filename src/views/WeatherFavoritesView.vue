<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import { useFavorites } from '@/composables/useFavorites'
import { useWeather } from '@/composables/useWeather'

const router = useRouter()

// 홈에서 별 눌러 담아둔 id 목록. composable 덕분에 페이지를 넘어와도 그대로 살아있음
const { favorites, toggleFav } = useFavorites()

// 날씨 목록은 홈이랑 같은 useWeather 공유 — 홈에서 이미 받아왔으면 재호출 없이 그대로 씀
const { weatherList, isLoading, loadWeather } = useWeather()

// 홈 안 거치고 /favorites로 바로 들어온 경우 대비 (이미 받아온 상태면 composable이 스킵)
onMounted(() => loadWeather())

// 즐겨찾기 id에 해당하는 도시만 추림. favorites가 바뀌면(별 해제) 목록도 바로 줄어듦
const favoriteCities = computed(() =>
  weatherList.value.filter((city) => favorites.value.includes(city.id))
)

// 여기서도 상세보기는 홈이랑 똑같이 문자열 push
const showDetail = (city) => {
  router.push('/weather/' + city.id)
}
</script>

<template>
  <div class="container">
    <BaseDashboardCard title="⭐ 찜한 여행지">
      <template #header>
        <!-- 담긴 개수 뱃지 -->
        <el-tag type="warning" round effect="light">{{ favoriteCities.length }}개</el-tag>
      </template>

      <!-- 로딩 중 (홈 안 거치고 바로 들어온 경우에만 보임) -->
      <el-skeleton v-if="isLoading" :rows="4" animated />

      <!-- 홈에서 쓰던 WeatherCard 재사용 — is-favorite은 여기 있는 것 자체가 즐겨찾기라 항상 true -->
      <!-- 홈과 같은 반응형 그리드 (데스크톱 2열 / 모바일 1열) -->
      <div v-else-if="favoriteCities.length > 0">
        <el-row :gutter="16">
          <el-col v-for="city in favoriteCities" :key="city.id" :xs="24" :md="12">
            <WeatherCard
              :city="city"
              :is-favorite="true"
              @click-detail="showDetail($event)"
              @toggle-favorite="toggleFav($event)"
            />
          </el-col>
        </el-row>
      </div>

      <!-- 아직 아무것도 안 담은 경우 → 홈으로 유도 (el-empty 일러스트 + 버튼) -->
      <el-empty v-else description="아직 찜한 여행지가 없어요 ⭐ 카드의 별(☆)을 눌러 찜해 보세요.">
        <el-button type="primary" @click="router.push('/')">여행지 고르러 가기</el-button>
      </el-empty>
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
/* 홈과 같은 폭 — 카드가 2열로 깔림 */
.container {
  max-width: 960px;
  margin: 0 auto;
}

</style>
