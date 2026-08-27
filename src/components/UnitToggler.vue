<script setup>
// 온도 단위 설정 UI — 대시보드 상단(네비 바 옆)에 붙는 앱 전체 부품이라 exercise/ 말고 components/ 바로 아래
import { storeToRefs } from 'pinia'
import { useConfigStore } from '@/stores/configStore'

const configStore = useConfigStore()

// state/getter를 구조분해로 꺼낼 땐 storeToRefs 필수 — 그냥 분해하면 반응성이 끊김
const { unitSymbol, unitLabel, toggleCount } = storeToRefs(configStore)
// action은 반응형이 아니라 그냥 함수라 storeToRefs 없이 바로 꺼내도 됨
const { toggleUnit } = configStore
</script>

<template>
  <div class="unit-toggler">
    <!-- 현재 단위 안내 문구. getter(unitLabel/unitSymbol)가 unit 상태 따라 자동 갱신 -->
    <span class="unit-info">날씨단위: {{ unitLabel }}({{ unitSymbol }})</span>

    <!-- el-switch로 단위 전환 — 켬/끔이 아니라 ℃/℉ 전환이라 양쪽에 라벨을 붙임 -->
    <!-- 스위치의 on/off는 스토어 unit에서 계산해서 넣고, change 때 toggleUnit 액션 호출 -->
    <el-switch
      :model-value="configStore.unit === 'fahrenheit'"
      inactive-text="℃"
      active-text="℉"
      @change="toggleUnit"
    />

    <!-- 내가 추가한 state(toggleCount) 확인용 뱃지. 한 번도 안 눌렀으면 숨김 -->
    <el-tag v-if="toggleCount > 0" size="small" round effect="plain">{{ toggleCount }}회 변경</el-tag>
  </div>
</template>

<style scoped>
/* 네비 바랑 같은 흰색 알약 톤으로 맞춤 */
.unit-toggler {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border-radius: 999px;
  padding: 10px 18px;
  box-shadow: 0 4px 14px rgba(30, 41, 59, 0.08);
}

.unit-info {
  color: #334155;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
}
</style>
