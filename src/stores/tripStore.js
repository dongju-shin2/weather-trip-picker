import { defineStore } from 'pinia'
import { toDateKey } from '@/composables/useForecasts'

// 여행 계획(어디로, 언제부터 언제까지) 전역 스토어 — 과제 5 요구사항 4의 "본인만의 추가 Store" 케이스
// configStore(앱 설정)와 성격이 달라서 스토어를 따로 팜: 이건 설정이 아니라 사용자의 "데이터"
const STORAGE_KEY = 'weather-trip-plan'

// 새로고침하면 스토어가 초기화되니까, localStorage에 저장해둔 걸 초기값으로 읽어옴
// (스토어 = 메모리, localStorage = 브라우저에 남는 저장소. 역할이 다름)
const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')

export const useTripStore = defineStore('trip', {
  state: () => ({
    cityId: saved?.cityId ?? null,
    // 'YYYY-MM-DD' 문자열로 통일 (Date 객체는 JSON 저장이 애매해서)
    // 당일치기면 시작일 == 종료일. 기간 개념이 없던 예전 저장분({date})도 읽히게 fallback
    startDate: saved?.startDate ?? saved?.date ?? null,
    endDate: saved?.endDate ?? saved?.date ?? null,
  }),

  getters: {
    hasTrip: (state) => Boolean(state.cityId && state.startDate && state.endDate),

    // 여행 시작까지 며칠 남았는지 (당일 0, 지났으면 음수)
    dday: (state) => {
      if (!state.startDate) return null
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const target = new Date(state.startDate + 'T00:00:00') // 로컬 자정 기준
      return Math.round((target - today) / (1000 * 60 * 60 * 24))
    },

    // 몇 박인지 (당일치기 0, 1박 2일 1, ...)
    nights(state) {
      if (!this.hasTrip) return null
      const start = new Date(state.startDate + 'T00:00:00')
      const end = new Date(state.endDate + 'T00:00:00')
      return Math.round((end - start) / (1000 * 60 * 60 * 24))
    },

    // "당일치기" / "1박 2일" 같은 표시용 라벨
    durationLabel() {
      if (this.nights == null) return ''
      return this.nights === 0 ? '당일치기' : `${this.nights}박 ${this.nights + 1}일`
    },

    // 여행 기간의 날짜 키 목록 ['2026-09-10', '2026-09-11', ...] — 일차별 예보 뽑을 때 씀
    days(state) {
      if (!this.hasTrip) return []
      const list = []
      const cur = new Date(state.startDate + 'T00:00:00')
      const end = new Date(state.endDate + 'T00:00:00')
      while (cur <= end) {
        list.push(toDateKey(cur))
        cur.setDate(cur.getDate() + 1)
      }
      return list
    },
  },

  actions: {
    setTrip(cityId, startDate, endDate) {
      this.cityId = cityId
      this.startDate = startDate
      this.endDate = endDate
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ cityId, startDate, endDate }))
    },
    clearTrip() {
      this.cityId = null
      this.startDate = null
      this.endDate = null
      localStorage.removeItem(STORAGE_KEY)
    },
  },
})
