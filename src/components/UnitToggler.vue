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
  <div class="unit-toggler" :title="`날씨단위: ${unitLabel}(${unitSymbol})`">
    <!-- el-switch로 단위 전환 — 켬/끔이 아니라 ℃/℉ 전환이라 양쪽에 라벨을 붙임 -->
    <!-- 스위치의 on/off는 스토어 unit에서 계산해서 넣고, change 때 toggleUnit 액션 호출 -->
    <el-switch
      :model-value="configStore.unit === 'fahrenheit'"
      inactive-text="℃"
      active-text="℉"
      @change="toggleUnit"
    />

    <!-- 내가 추가한 state(toggleCount) 확인용 표시. 한 번도 안 눌렀으면 숨김 -->
    <span v-if="toggleCount > 0" class="toggle-count">{{ toggleCount }}회 변경</span>
  </div>
</template>

<style scoped>
/* 헤더 안에 들어가는 컴팩트 토글 — 패널 장식 없이 스위치만 */
.unit-toggler {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-count {
  color: var(--color-text-sub);
  font-size: 13px;
  white-space: nowrap;
}
</style>
