import { ref } from 'vue'
import { CITIES } from '@/constants/cities'
import { fetchForecast, toStatus, toKoDescription } from '@/api/weatherApi'

// 도시별 5일 예보 캐시 — useWeather처럼 모듈 스코프라 날짜비교 패널/내여행 패널이 같은 데이터를 봄
// 현재 날씨(useWeather)와 분리한 이유: 예보 5도시분은 호출이 무거워서, 실제로 필요할 때만 받으려고
const forecastsByCity = ref({}) // { city_01: [{ dt, dateKey, hour, temp, status }, ...], ... }
const isLoading = ref(false)
const loadError = ref('')
let loaded = false

// Date(또는 ms) → 'YYYY-MM-DD' 로컬 기준 키. toISOString()은 UTC라 자정 근처에 날짜가 하루 밀려서 직접 조립
export const toDateKey = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function useForecasts() {
  const loadForecasts = async (force = false) => {
    if (loaded && !force) return
    isLoading.value = true
    loadError.value = ''
    try {
      // 5개 도시 예보를 병렬로 — [id, 예보배열] 쌍으로 만들어 Object.fromEntries로 합침
      const results = await Promise.all(
        CITIES.map(async (c) => {
          const data = await fetchForecast(c.lat, c.lon)
          return [
            c.id,
            data.list.map((item) => ({
              dt: item.dt,
              dateKey: toDateKey(item.dt * 1000), // 날짜별로 골라내기 쉽게 키를 미리 계산
              hour: new Date(item.dt * 1000).getHours(),
              temp: Math.round(item.main.temp), // 섭씨 원본
              status: toStatus(item.weather[0]),               // 정렬 등 로직용 대분류 (기존 그대로)
              description: toKoDescription(item.weather[0]),   // 표시용 자체 매핑 라벨
            })),
          ]
        })
      )
      forecastsByCity.value = Object.fromEntries(results)
      loaded = true
    } catch {
      loadError.value = '예보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
    } finally {
      isLoading.value = false
    }
  }

  // 특정 도시의 특정 날짜 예보 한 줄 — 정오 것 우선, 없으면(오늘 오후처럼 정오가 지난 경우) 남은 시간대의 가운데 것
  const getDayForecast = (cityId, dateKey) => {
    const dayItems = (forecastsByCity.value[cityId] ?? []).filter((i) => i.dateKey === dateKey)
    if (!dayItems.length) return null
    return dayItems.find((i) => i.hour === 12) ?? dayItems[Math.floor(dayItems.length / 2)]
  }

  return { forecastsByCity, isLoading, loadError, loadForecasts, getDayForecast }
}
