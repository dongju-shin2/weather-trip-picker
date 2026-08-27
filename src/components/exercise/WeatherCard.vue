<script setup>
import { useDisplayTemp } from '@/composables/useDisplayTemp'
import { iconFor } from '@/constants/weatherIcons'

defineProps({
  city: { type: Object, required: true },
  showSpots: { type: Boolean, default: true },
  isFavorite: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },
  isHottest: { type: Boolean, default: false },
  isColdest: { type: Boolean, default: false },
})

const emit = defineEmits(['select-card', 'click-detail', 'toggle-favorite'])

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
      <!-- 이모지 매핑은 상세 페이지와 공유하는 constants/weatherIcons -->
      <span class="emoji">{{ iconFor(city.status) }}</span>
      <div class="card-info">
        <h3>
          {{ city.name }}
          <!-- 최고/최저 기온 도시 표시 — 배지 대신 작은 회색 텍스트 -->
          <span v-if="isHottest" class="temp-note">최고기온</span>
          <span v-if="isColdest" class="temp-note">최저기온</span>
        </h3>
      </div>
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

    <!-- 온도가 카드의 주인공, 날씨 상태는 바로 옆에서 같이 읽히게 -->
    <!-- 단위변경 누르면 즉시 갱신 (formatTemp가 스토어 unit을 읽어서) -->
    <p class="temp">
      {{ formatTemp(city.temp) }}
      <!-- id 기준 자체 매핑 설명("구름 많음") 우선, 없으면(mock 데이터) 대분류 상태 -->
      <span class="temp-status">{{ city.description || city.status }}</span>
    </p>

    <p v-if="showSpots" class="spots">
      <svg class="pin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      {{ city.spots.join(' · ') }}
    </p>

    <!-- .stop 필수: 없으면 카드 클릭까지 같이 타서 상태바가 바뀌어버림 -->
    <el-button class="detail-btn" type="primary" plain @click.stop="emit('click-detail', city)">
      상세보기
    </el-button>
  </div>
</template>

<style scoped>
/* 날씨 카드 — 얇은 테두리 한 겹만, 그림자는 hover 때만 살짝 */
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
}
/* 선택된 카드 표시 */
.card.active {
  border-color: #4f46e5;
}

.card-top {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.emoji {
  font-size: 2.5rem;
  line-height: 1;
}

.card-info {
  flex: 1;
}
.card-info h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--color-heading);
}
/* 최고/최저기온 표시 — 도시명 옆 작은 글씨 (보조 정보) */
.temp-note {
  margin-left: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-sub);
}

/* 온도 숫자 — 카드에서 가장 크고 굵게 */
.temp {
  margin: 16px 0 0;
  font-size: 42px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--color-heading);
  line-height: 1.1;
  display: flex;
  align-items: baseline;
  gap: 10px;
}

/* 온도 옆 날씨 상태 — 온도보다 위계는 낮지만 같이 읽히는 크기 */
.temp-status {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0;
  color: var(--color-text-sub);
}

/* 추천 명소 */
.spots {
  margin: 8px 0 0;
  font-size: 14px;
  color: var(--color-text-sub);
  display: flex;
  align-items: center;
  gap: 4px;
}
.pin-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
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
  margin-top: 16px;
  width: 100%;
}
</style>
