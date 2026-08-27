import { defineStore } from 'pinia'

// 앱 전역 설정 스토어 — 지금은 온도 단위 하나지만, 테마/언어 같은 설정도 여기 모으는 용도
// useFavorites처럼 composable로도 되지만, "여러 화면이 같이 쓰는 전역 설정"이라 Pinia 스토어로 승격
export const useConfigStore = defineStore('config', {
  state: () => ({
    unit: 'celsius', // 단위를 저장하는 변수 (초기값: celsius)

    // ===== 내가 추가한 state =====
    toggleCount: 0, // 단위를 몇 번 바꿨는지. UnitToggler에 뱃지로 표시해서 스토어가 살아있는지 확인용
  }),

  getters: {
    // 현재 단위 상태에 맞는 기호 (℃ / ℉)
    unitSymbol: (state) => (state.unit === 'celsius' ? '℃' : '℉'),

    // ===== 내가 추가한 getters =====
    // 한글 라벨. 헤더의 "날씨단위: 섭씨(℃)" 문구용 — 기호만으론 어색해서 추가
    unitLabel: (state) => (state.unit === 'celsius' ? '섭씨' : '화씨'),

    // 섭씨 원본값 → 현재 단위로 변환한 숫자를 돌려주는 함수형 getter
    // 변환 공식은 여기 한 곳에만 두고, "변환값 + 기호"로 조립해 보여주는 쪽은
    // useDisplayTemp composable(formatTemp)이 담당 — 수업자료의 "Composable로 해결" 힌트 반영
    convert: (state) => (celsius) => {
      if (state.unit === 'fahrenheit') {
        return Math.round((celsius * 9) / 5 + 32) // 화씨 변환 연산
      }
      return celsius // 'celsius'일 때는 원본 그대로 반환
    },
  },

  actions: {
    // 'celsius'와 'fahrenheit'를 토글(스위칭)하는 함수
    toggleUnit() {
      this.unit = this.unit === 'celsius' ? 'fahrenheit' : 'celsius'
      this.toggleCount++
    },

    // ===== 내가 추가한 action =====
    // 특정 단위로 직접 지정. 토글만 있으면 "무조건 섭씨로 초기화" 같은 게 안 돼서 추가
    setUnit(unit) {
      if (unit !== 'celsius' && unit !== 'fahrenheit') return // 이상한 값은 무시
      if (this.unit !== unit) this.toggleCount++
      this.unit = unit
    },
  },
})
