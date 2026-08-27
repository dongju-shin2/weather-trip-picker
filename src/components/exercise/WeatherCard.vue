<script setup>
import { useDisplayTemp } from '@/composables/useDisplayTemp'

defineProps({
  city: { type: Object, required: true },
  showSpots: { type: Boolean, default: true },
  isFavorite: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },
  isHottest: { type: Boolean, default: false },
  isColdest: { type: Boolean, default: false },
})

const emit = defineEmits(['select-card', 'click-detail', 'toggle-favorite'])

// status → 이모지 (표시 전용 정적 데이터라 카드 컴포넌트가 소유)
// '눈'은 mock 데이터엔 없었지만 실제 API에선 나올 수 있는 상태라 넣어둠
const icons = { 맑음: '☀️', 비: '🌧️', 구름: '☁️', 흐림: '🌫️', 눈: '❄️' }

// 기온 표시는 composable에 맡김 — 원본(섭씨)은 그대로 두고 보여줄 때만 현재 단위 문자열로
const { formatTemp } = useDisplayTemp()
</script>

<template>
  <div
    class="card"
    :class="{ active: isActive }"
    @click="emit('select-card', city)"
  >
    <div class="card-top">
      <span class="emoji">{{ icons[city.status] ?? '🌈' }}</span>
      <div class="card-info">
        <h3>
          {{ city.name }} ({{ city.status }})
          <!-- 최고/최저 기온 도시 강조 태그 -->
          <el-tag v-if="isHottest" type="danger" size="small" round>🔥 최고기온</el-tag>
          <el-tag v-if="isColdest" type="info" size="small" round>🧊 최저기온</el-tag>
        </h3>
        <!-- 단위변경 누르면 즉시 갱신 (formatTemp가 스토어 unit을 읽고 있어서) -->
        <p class="status-text">현재 기온 {{ formatTemp(city.temp) }}</p>
        <p v-if="showSpots" class="spots">📍 {{ city.spots.join(' · ') }}</p>
      </div>
      <!-- 25도를 기준으로 더움/선선함 배지 나눠 붙임 (el-tag의 type으로 색 구분) -->
      <el-tag v-if="city.temp >= 25" type="danger" effect="light" round>🔥 더움 (25도 이상)</el-tag>
      <el-tag v-else type="primary" effect="light" round>❄️ 선선함 (25도 미만)</el-tag>
      <!-- 찜(즐겨찾기) 별. 이것도 .stop 필수 — 안 그러면 카드 선택까지 같이 눌림 -->
      <!-- el-tooltip: 별만 있으면 뭔지 모를 수 있어서 올리면 설명이 뜨게 -->
      <el-tooltip :content="isFavorite ? '찜 해제' : '여행지 찜하기'" placement="top">
        <button
          class="fav-btn"
          :class="{ on: isFavorite }"
          @click.stop="emit('toggle-favorite', city.id)"
        >
          {{ isFavorite ? '★' : '☆' }}
        </button>
      </el-tooltip>
    </div>
    <!-- .stop 필수: 없으면 카드 클릭까지 같이 타서 상태바가 바뀌어버림 -->
    <el-button class="detail-btn" type="primary" plain round @click.stop="emit('click-detail', city)">
      상세보기
    </el-button>
  </div>
</template>

<style scoped>
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

.detail-btn {
  margin-top: 14px;
}
</style>
